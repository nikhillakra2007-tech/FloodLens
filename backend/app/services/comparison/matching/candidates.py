from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.location_models import Place
from app.services.comparison.similarity import FeatureVector, weighted_similarity


def find_candidates(
    db: Session,
    place: Place,
    target_vec: FeatureVector,
    all_vectors: dict[UUID, FeatureVector],
    top_k: int = 5,
    weights: dict[str, float] | None = None,
) -> list[tuple[UUID, float, dict[str, float]]]:
    scored = []
    for pid, vec in all_vectors.items():
        score, feats = weighted_similarity(target_vec, vec, weights)
        scored.append((pid, score, feats))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]
