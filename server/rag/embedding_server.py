
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

app = FastAPI(title="MediTrack Local Embedding Service")


@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer(MODEL_NAME)


class EmbeddingRequest(BaseModel):
    texts: list[str] = Field(min_length=1, max_length=32)


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "dimensions": 384}


@app.post("/embed")
def embed(request: EmbeddingRequest):
    texts = [text.strip() for text in request.texts]

    if any(not text for text in texts):
        raise HTTPException(status_code=400, detail="Texts must not be empty")

    try:
        model = get_model()
        vectors = model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )

        return {
            "model": MODEL_NAME,
            "dimensions": 384,
            "embeddings": [vector.tolist() for vector in vectors],
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Embedding generation failed: {type(exc).__name__}",
        ) from exc
