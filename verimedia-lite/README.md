# VeriMedia Lite

VeriMedia Lite is a short, simple open-source API for detecting AI-generated images.

It uses the Sightengine API as the primary detector, with an automatic fallback to a local open-source model using the 'transformers' library with 'openai/clip-vit-base-patch32' if Sightengine fails (e.g., error or no key).

## Setup Steps

1. **Clone the repository** (or download the source code).
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure Environment Variables:**
   - Copy `.env` or edit the existing `.env` file to include your Sightengine credentials if you have them.
   ```
   SIGHTENGINE_API_USER=your_api_user_here
   SIGHTENGINE_API_SECRET=your_api_secret_here
   ```
   - *Note: If these are left as placeholders, the API will automatically use the local fallback model.*
4. **Run the API:**
   ```bash
   uvicorn app.main:app --reload
   ```

## API Usage

The API will be available at `http://127.0.0.1:8000`.

### `GET /health`

Checks if the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /detect`

Analyzes an image and returns a verdict on whether it is real or AI-generated.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (the image file to check)

**Example with curl:**
```bash
curl -X POST "http://127.0.0.1:8000/detect" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path_to_your_image.jpg"
```

**Response:**
```json
{
  "score": 85.5,
  "verdict": "FAKE",
  "engine": "local"
}
```

- `score`: Confidence it is fake (0-100).
- `verdict`: "FAKE" if score > 70 else "REAL".
- `engine`: The engine used for detection ("sightengine" or "local").
