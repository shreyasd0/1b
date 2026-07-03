from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime


class ResumeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    filename: str
    match_score: float | None
    uploaded_at: datetime