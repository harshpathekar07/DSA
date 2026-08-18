import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SIGHTENGINE_API_USER = os.getenv("SIGHTENGINE_API_USER")
    SIGHTENGINE_API_SECRET = os.getenv("SIGHTENGINE_API_SECRET")
    FALLBACK_TO_LOCAL = True  # Always allow fallback if sightengine fails

config = Config()
