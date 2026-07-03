"""Standalone CLI test of extraction + NLP + ranking, no API/DB required.

Run from backend/ with the venv active:
    python scripts/test_pipeline.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.extraction import extract_text
from app.ranking import rank_resumes

SAMPLE_DIR = Path(__file__).resolve().parent.parent / "sample_data"


def main():
    job_path = SAMPLE_DIR / "job_description.txt"
    resume_paths = [
        SAMPLE_DIR / "resume_strong_match.txt",
        SAMPLE_DIR / "resume_moderate_match.txt",
        SAMPLE_DIR / "resume_weak_match.txt",
    ]

    job_text = extract_text(job_path.name, job_path.read_bytes())
    print(f"Job description extracted ({len(job_text)} chars):\n{job_text[:200]}...\n")

    resume_texts = []
    for path in resume_paths:
        text = extract_text(path.name, path.read_bytes())
        resume_texts.append(text)
        print(f"{path.name}: extracted {len(text)} chars")

    scores = rank_resumes(job_text, resume_texts)

    print("\n--- Match Scores ---")
    ranked = sorted(zip(resume_paths, scores), key=lambda x: x[1], reverse=True)
    for path, score in ranked:
        print(f"{path.name}: {score}")


if __name__ == "__main__":
    main()
    