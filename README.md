# Codelearn AI

Codelearn AI is an AI-powered study tool. A user uploads a document (PDF, TXT, or MD) and the app generates four structured study outputs:

1. **Mind Map** — rendered with Mermaid.js.
2. **Flashcards** — interactive 3D flip cards.
3. **Report** — a clean, formatted Markdown summary.
4. **Practice Quiz** — multiple-choice questions with scoring.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES modules, `type="module"`), hash-based SPA routing.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Google Gemini via `google-generativeai`.
- **Auth & DB**: Firebase Authentication + Firestore.

## Setup Instructions

### Backend
1. Go to the `backend/` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Update `.env` with your `GEMINI_API_KEY` and provide `firebase-credentials.json`.
4. Run the backend server: `python main.py` or `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`.

### Frontend
1. Serve the `frontend/` directory using any static file server, for example: `python -m http.server 5500`.
2. Access `http://127.0.0.1:5500` or `http://localhost:5500` in your browser.

## Features
- Hash-based SPA routing with full browser back/forward support.
- File upload parsing (PDF, TXT, MD).
- Generation of Mermaid graphs, 3D CSS flashcards, Markdown reports, and interactive quizzes.
- Firebase integration for saving modules to personal library.