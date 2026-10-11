from dataclasses import dataclass, field
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.location_models import Place
from app.repositories.locations import get_landcover, get_terrain
from app.repositories.drainage import drain_stats
from app.services.comparison.candidates import find_candidates
from app.services.comparison.explainable import (
    ExplanationDetail,
    compute_explainable_similarity,
    save_comparison_explanations,
)
from app.services.comparison.similarity import FeatureVector, DEFAULT_WEIGHTS, weighted_similarity


@dataclass
class ComparisonResult:
    place_a_id: UUID
    place_b_id: UUID
    similarity_score: float
    weights_version: str
    feature_similarities: dict[str, float]
    reasons: list[str] = field(default_factory=list)
    explanations: list[ExplanationDetail] = field(default_factory=list)


def build_feature_vector(db: Session, place: Place) -> FeatureVector:
    from shapely import wkb
    import math

    lon, lat = 0.0, 0.0
    try:
        pt = wkb.loads(bytes(place.geom.data))
        lon, lat = pt.x, pt.y
    except Exception:
        pass

    terrain = get_terrain(db, place.id)
    landcover = get_landcover(db, place.id)
    dstats = drain_stats(db, place.ward)

    return FeatureVector(
        rainfall_mm=None,
        mean_elevation=terrain.mean_elevation if terrain else None,
        hand=terrain.hand if terrain else None,
        builtup_fraction=landcover.builtup_fraction if landcover else None,
        vegetation_fraction=landcover.vegetation_fraction if landcover else None,
        water_fraction=landcover.water_fraction if landcover else None,
        drain_density=dstats["total_length_m"] / 1000.0 / 10.0 if dstats["segment_count"] else None,
        upstream_drainage_m=dstats["total_length_m"],
        outfall_distance_m=None,
        relative_elevation=terrain.relative_elevation if terrain else None,
    )


def compare_locations(
    db: Session,
    place_a: Place,
    place_b: Place,
    weights: dict[str, float] | None = None,
    comparison_id: UUID | None = None,
) -> ComparisonResult:
    # 1. Base vector similarity
    vec_a = build_feature_vector(db, place_a)
    vec_b = build_feature_vector(db, place_b)
    score, feats = weighted_similarity(vec_a, vec_b, weights)

    # 2. Decompose into explainable components (L14)
    total_score, explanations, reasons = compute_explainable_similarity(
        db=db,
        place_a=place_a,
        place_b=place_b,
        comparison_id=comparison_id,
    )

    # Combine explainable reasons
    combined_reasons = list(reasons)
    for feat, sim in feats.items():
        if sim > 0.8:
            msg = f"Similar {feat} (similarity={sim:.2f})"
            if msg not in combined_reasons:
                combined_reasons.append(msg)

    # Save to comparison_explanations table if comparison_id provided
    if comparison_id:
        save_comparison_explanations(db, comparison_id, explanations)

    return ComparisonResult(
        place_a_id=place_a.id,
        place_b_id=place_b.id,
        similarity_score=total_score if total_score > 0 else score,
        weights_version="phase2_explainable",
        feature_similarities=feats,
        reasons=combined_reasons,
        explanations=explanations,
    )

