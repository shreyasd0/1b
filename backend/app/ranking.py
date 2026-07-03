"""TF-IDF vectorization + cosine similarity for job-resume matching."""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.nlp import preprocess


def rank_resumes(job_text: str, resume_texts: list[str]) -> list[float]:
    """Return a match score (0-1) for each resume, in the same order as resume_texts."""
    if not resume_texts:
        return []

    corpus = [preprocess(job_text)] + [preprocess(text) for text in resume_texts]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    job_vector = tfidf_matrix[0:1]
    resume_vectors = tfidf_matrix[1:]

    similarities = cosine_similarity(job_vector, resume_vectors)[0]
    return [round(float(score), 4) for score in similarities]