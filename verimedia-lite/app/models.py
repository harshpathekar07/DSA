from pydantic import BaseModel
from typing import Literal

class DetectionResponse(BaseModel):
    score: float
    verdict: Literal["FAKE", "REAL"]
    engine: Literal["sightengine", "local"]
