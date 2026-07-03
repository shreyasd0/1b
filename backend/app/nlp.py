"""NLP preprocessing: tokenization + stopword removal."""
import re

import nltk
from nltk.corpus import stopwords

try:
    STOPWORDS = set(stopwords.words("english"))
except LookupError:
    nltk.download("stopwords")
    STOPWORDS = set(stopwords.words("english"))

_WORD_RE = re.compile(r"\b[a-z]+\b")


def preprocess(text: str) -> str:
    tokens = _WORD_RE.findall(text.lower())
    cleaned_tokens = [t for t in tokens if t not in STOPWORDS]
    return " ".join(cleaned_tokens)