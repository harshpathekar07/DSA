# OOSC 4.0 Pitch Idea: VeriMedia Lite

**Title:** VeriMedia Lite: Truth in a Box

**1-Minute Intro:**
"Hello everyone, I'm excited to present VeriMedia Lite. In a world increasingly saturated with AI-generated content, distinguishing fact from fiction is harder than ever. Is that breaking news photo real? Is that product image authentic? VeriMedia Lite is a short, simple, and open-source API built to answer that exact question. It seamlessly integrates a powerful commercial API—Sightengine—with an automatic, robust local fallback using the open-source CLIP model. This means you get enterprise-grade detection with zero downtime, even if your API key expires or fails. It's incredibly easy to use, lightweight, and deployable anywhere for free. Let's see it in action."

**Live Demo:**
1. **Show the simple API structure:** Briefly show the `main.py` file with the single `/detect` endpoint.
2. **Run the API locally:** Start the Uvicorn server.
3. **Test a Real Image:**
   - Use a tool like Postman or `curl` to send a picture of a standard object (e.g., a real cat or a coffee mug).
   - Show the JSON response: `{"score": 12.5, "verdict": "REAL", "engine": "sightengine"}` (or local if using placeholder keys).
4. **Test an AI Image:**
   - Send an obviously AI-generated image (e.g., an astronaut riding a horse on Mars).
   - Show the JSON response: `{"score": 98.2, "verdict": "FAKE", "engine": "local"}`.
5. **Highlight the Fallback:** Mention that the second request used the local open-source CLIP model because we deliberately used placeholder Sightengine keys to demonstrate the seamless fallback mechanism.
6. **Wrap up:** "With just a few lines of code, you can integrate fake image detection into your app today. Thank you!"
