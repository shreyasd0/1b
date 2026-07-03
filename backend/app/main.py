from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.extraction import extract_text
from app.models import JobDescription, Resume
from app.ranking import rank_resumes
from app.schemas import JobOut, ResumeOut

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentMatch AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/jobs", response_model=JobOut)
async def create_job(title: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        text = extract_text(file.filename, await file.read())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    job = JobDescription(title=title, raw_text=text)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@app.get("/jobs", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()


@app.post("/jobs/{job_id}/resumes", response_model=list[ResumeOut])
async def upload_resumes(job_id: int, files: list[UploadFile] = File(...), db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    created = []
    for file in files:
        try:
            text = extract_text(file.filename, await file.read())
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        resume = Resume(job_id=job_id, filename=file.filename, raw_text=text)
        db.add(resume)
        created.append(resume)

    db.commit()
    for resume in created:
        db.refresh(resume)
    return created


@app.post("/jobs/{job_id}/rank", response_model=list[ResumeOut])
def rank_job_resumes(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resumes = db.query(Resume).filter(Resume.job_id == job_id).all()
    scores = rank_resumes(job.raw_text, [r.raw_text for r in resumes])

    for resume, score in zip(resumes, scores):
        resume.match_score = score
    db.commit()

    return db.query(Resume).filter(Resume.job_id == job_id).order_by(Resume.match_score.desc()).all()


@app.get("/jobs/{job_id}/results", response_model=list[ResumeOut])
def get_results(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return (
        db.query(Resume)
        .filter(Resume.job_id == job_id)
        .order_by(Resume.match_score.desc().nulls_last())
        .all()
    )