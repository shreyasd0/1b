"""Generate PDF/DOCX versions of the sample_data .txt files for manual UI testing."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from docx import Document
from fpdf import FPDF

SAMPLE_DIR = Path(__file__).resolve().parent.parent / "sample_data"


def write_pdf(text: str, out_path: Path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    for line in text.split("\n"):
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 6, line if line.strip() else " ")
    pdf.output(str(out_path))


def write_docx(text: str, out_path: Path):
    doc = Document()
    for line in text.split("\n"):
        doc.add_paragraph(line)
    doc.save(str(out_path))


def main():
    job_text = (SAMPLE_DIR / "job_description.txt").read_text()
    write_pdf(job_text, SAMPLE_DIR / "job_description.pdf")

    strong_text = (SAMPLE_DIR / "resume_strong_match.txt").read_text()
    write_pdf(strong_text, SAMPLE_DIR / "resume_strong_match.pdf")

    moderate_text = (SAMPLE_DIR / "resume_moderate_match.txt").read_text()
    write_docx(moderate_text, SAMPLE_DIR / "resume_moderate_match.docx")

    print("Generated:")
    print(" -", SAMPLE_DIR / "job_description.pdf")
    print(" -", SAMPLE_DIR / "resume_strong_match.pdf")
    print(" -", SAMPLE_DIR / "resume_moderate_match.docx")
    print(" - (resume_weak_match.txt already exists as plain text)")


if __name__ == "__main__":
    main()
    