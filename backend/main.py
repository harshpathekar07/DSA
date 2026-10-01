import os
import json
import re
from typing import List
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
import google.generativeai as genai
from pypdf import PdfReader
import io

# Load environment variables
load_dotenv()

# Check for required environment variables
if not os.getenv("GEMINI_API_KEY"):
    raise RuntimeError("GEMINI_API_KEY is not set.")
if not os.getenv("FIREBASE_CREDENTIALS"):
    raise RuntimeError("FIREBASE_CREDENTIALS is not set.")

# Initialize Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize Firebase Admin
try:
    cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS"))
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Failed to initialize Firebase Admin: {e}")
    # Application can still start, but endpoints relying on Firebase Auth will fail

# Initialize FastAPI
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Firebase ID token in the Authorization header.
    """
    token = credentials.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def extract_text_from_file(file: UploadFile) -> str:
    """
    Extracts text from PDF, TXT, or MD files.
    """
    file_bytes = file.file.read()
    file_size = len(file_bytes)

    if file_size > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File {file.filename} is too large (max 15MB)")

    filename_lower = file.filename.lower()
    text = ""

    if filename_lower.endswith(".pdf"):
        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a valid PDF")

        try:
            pdf_reader = PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF {file.filename}")

    elif filename_lower.endswith(".txt") or filename_lower.endswith(".md"):
        try:
            text = file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read text file {file.filename}")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type for {file.filename}")

    return text.strip()

@app.post("/api/generate")
async def generate_pack(files: List[UploadFile] = File(...), user_data=Depends(verify_token)):
    """
    Endpoint to receive files, extract text, and call Gemini to generate the study pack.
    """
    all_text = []
    total_size = 0

    for file in files:
        # We process files one by one to avoid keeping all raw bytes in memory if possible,
        # but extract_text_from_file already reads the whole thing.
        # Ensure total payload doesn't exceed 30MB combined (approximated here by text size or assume client checked).
        extracted_text = extract_text_from_file(file)
        if not extracted_text:
            raise HTTPException(status_code=422, detail="This document has no extractable text. It may be a scanned image.")
        all_text.append(extracted_text)

    combined_text = "\n\n--- SOURCE BREAK ---\n\n".join(all_text)

    if not combined_text:
        raise HTTPException(status_code=422, detail="No extractable text found in uploaded files.")

    # Truncate to ~30,000 characters
    truncated = False
    if len(combined_text) > 30000:
        combined_text = combined_text[:30000]
        truncated = True

    prompt = f"""You are an expert educator and instructional designer. Analyze the SOURCE TEXT below and produce a complete study pack as a single, valid JSON object.

Return ONLY valid JSON. No markdown code fences, no explanation, no preamble, no trailing text. The response must begin with `{{` and end with `}}`.

The JSON must have EXACTLY these four top-level keys:

1. "mind_map" — A string containing valid Mermaid.js "graph TD" syntax. Use node labels in square brackets. 8–20 nodes. Do not wrap in code fences.

2. "flashcards" — An array of 10 to 20 objects with "question" and "answer" strings.

3. "report" — A Markdown string. H1 title, H2/H3 subheadings, bullet lists, 400–800 words. Synthesized summary, not a copy-paste.

4. "quiz" — An array of exactly 10 objects. Each has "question" (string), "options" (array of exactly 4 strings), "correct" (integer 0–3). Distractors must be contextually logical.

SOURCE TEXT:
\"\"\"
{combined_text}
\"\"\""""

    try:
        response = model.generate_content(prompt)
    except Exception as e:
        if "429" in str(e) or "Quota" in str(e):
            raise HTTPException(status_code=429, detail="AI quota reached. Try again in a minute.")
        raise HTTPException(status_code=500, detail="Failed to generate content from AI engine.")

    raw_output = response.text.strip()

    # Clean fences
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_output, flags=re.MULTILINE).strip()

    # Try to find JSON bounds just in case there's still preamble
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")

    if start_idx == -1 or end_idx == -1:
        print("Gemini Output (Malformed):", raw_output)
        raise HTTPException(status_code=502, detail="Gemini returned malformed JSON")

    json_str = cleaned[start_idx:end_idx+1]

    try:
        parsed_json = json.loads(json_str)
    except json.JSONDecodeError:
        print("Gemini Output (Parse Error):", raw_output)
        raise HTTPException(status_code=502, detail="Gemini returned malformed JSON")

    # Inject truncation warning into the report if applicable
    if truncated and "report" in parsed_json and isinstance(parsed_json["report"], str):
        parsed_json["report"] = "_Note: source document was truncated for processing._\n\n" + parsed_json["report"]

    return parsed_json

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}

@app.get("/")
async def root():
    """
    Root endpoint.
    """
    return {"service": "Codelearn AI", "version": "1.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)