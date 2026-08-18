import io
import requests
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch
import torch.nn.functional as F

from app.config import config
from app.models import DetectionResponse

# Lazy load local model
_local_model = None
_local_processor = None

def get_local_model():
    global _local_model, _local_processor
    if _local_model is None or _local_processor is None:
        model_id = "openai/clip-vit-base-patch32"
        _local_model = CLIPModel.from_pretrained(model_id)
        _local_processor = CLIPProcessor.from_pretrained(model_id)
    return _local_model, _local_processor

def detect_with_sightengine(image_bytes: bytes) -> dict:
    if not config.SIGHTENGINE_API_USER or not config.SIGHTENGINE_API_SECRET:
         return {"error": "Missing Sightengine credentials"}
    if config.SIGHTENGINE_API_USER == "your_api_user_here":
         return {"error": "Dummy Sightengine credentials"}

    url = 'https://api.sightengine.com/1.0/check.json'
    files = {'media': ('image.jpg', image_bytes, 'image/jpeg')}
    data = {
        'models': 'genai',
        'api_user': config.SIGHTENGINE_API_USER,
        'api_secret': config.SIGHTENGINE_API_SECRET
    }
    try:
        response = requests.post(url, files=files, data=data, timeout=10)
        response.raise_for_status()
        resp_json = response.json()
        if resp_json.get("status") == "success":
            # Sightengine returns type.ai_generated as a probability 0-1
            ai_score = resp_json.get("type", {}).get("ai_generated", 0.0)
            return {"score": ai_score * 100}
        else:
            return {"error": resp_json.get("error", "Sightengine API error")}
    except Exception as e:
        return {"error": str(e)}

def detect_with_local(image_bytes: bytes) -> dict:
    model, processor = get_local_model()
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return {"error": f"Invalid image: {str(e)}"}

    prompts = ["a real photograph", "an AI-generated image"]
    try:
        inputs = processor(text=prompts, images=image, return_tensors="pt", padding=True)
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image  # this is the image-text similarity score
        probs = logits_per_image.softmax(dim=1)  # we can take the softmax to get the label probabilities
        fake_prob = probs[0][1].item()  # probability for "an AI-generated image"
        return {"score": fake_prob * 100}
    except Exception as e:
        return {"error": str(e)}

def detect_image(image_bytes: bytes) -> DetectionResponse:
    # Try Sightengine first
    engine = "sightengine"
    res = detect_with_sightengine(image_bytes)

    # Fallback to local
    if "error" in res and config.FALLBACK_TO_LOCAL:
        engine = "local"
        res = detect_with_local(image_bytes)
        if "error" in res:
            # If local also fails, default to REAL with 0 score (or we could raise an exception)
            res = {"score": 0.0}

    score = res.get("score", 0.0)
    verdict = "FAKE" if score > 70 else "REAL"

    return DetectionResponse(
        score=score,
        verdict=verdict,
        engine=engine
    )
