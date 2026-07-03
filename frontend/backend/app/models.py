from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resumes = relationship("Resume", back_populates="job", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    filename = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    match_score = Column(Float, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("JobDescript")