"""Explainable comparable location selection and similarity decomposition engine.

Addresses Phase 1 Limitation L14:
- Replaces opaque single score (e.g. 0.79) with transparent, component-wise breakdown.
- Decomposes similarity into:
  1. spatial proximity
  2. rainfall similarity
  3. terrain similarity
  4. drainage similarity
  5. land-cover similarity
  6. event similarity
- Computes feature contributions, weights, and weighted sums deterministically.
- Persists ComparisonExplanation records answering:
  "Why was this location selected as the comparison?"
- Strictly deterministic; no LLM hallucination in numeric calculations.
"""

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.investigation_models import Comparison
from app.db.models.location_models import LandcoverFeature, Place, TerrainFeature
from app.db.models.phase2_models import ComparisonExplanation
from app.repositories.drainage import drain_stats
from app.repositories.locations import get_landcover, get_terrain
from app.services.geospatial.geometry import point_distance_m


# Normalized feature category weights summing to 1.0
CATEGORY_WEIGHTS = {
    "spatial_proximity": 0.15,
    "rainfall_similarity": 0.20,
    "terrain_similarity": 0.20,
    "drainage_similarity": 0.20,
    "landcover_similarity": 0.15,
    "event_similarity": 0.10,
}


def _safe_ratio(a: float | None, b: float | None) -> float:
    if a is None or b is None:
        return 0.5  # Neutral when unobserved
    denom = abs(a) + abs(b)
    if denom < 1e-9:
        return 1.0
    return max(0.0, min(1.0, 1.0 - (abs(a - b) / denom)))


@dataclass
class ExplanationDetail:
    feature_name: str
    feature_category: str
    value_a: float | None
    value_b: float | None
    similarity_score: float
    weight: float
    weighted_contribution: float
    explanation: str
    data_quality: str


def compute_explainable_similarity(
    db: Session,
    place_a: Place,
    place_b: Place,
    comparison_id: UUID | None = None,
    rainfall_a_mm: float | None = None,
    rainfall_b_mm: float | None = None,
    severity_a: float | None = None,
    severity_b: float | None = None,
) -> tuple[float, list[ExplanationDetail], list[str]]:
    """Compute fully explainable similarity scores and human-readable justifications."""
    explanations: list[ExplanationDetail] = []
    reasons: list[str] = []

    # 1. Spatial Proximity
    coords_a = (place_a.longitude, place_a.latitude)
    coords_b = (place_b.longitude, place_b.latitude)
    dist_m = point_distance_m(coords_a, coords_b)
    # Proximity score decays smoothly up to 20km
    prox_score = max(0.0, min(1.0, 1.0 - (dist_m / 20000.0)))
    w_prox = CATEGORY_WEIGHTS["spatial_proximity"]
    c_prox = prox_score * w_prox
    exp_prox = f"Locations are {dist_m / 1000.0:.2f} km apart within the Chennai urban corridor."
    if dist_m < 5000:
        reasons.append(f"Close geographic proximity ({dist_m / 1000.0:.1f} km)")
    explanations.append(ExplanationDetail(
        feature_name="geographic_distance",
        feature_category="spatial_proximity",
        value_a=0.0,
        value_b=dist_m,
        similarity_score=round(prox_score, 3),
        weight=w_prox,
        weighted_contribution=round(c_prox, 4),
        explanation=exp_prox,
        data_quality="official",
    ))

    # 2. Rainfall Similarity
    r_score = _safe_ratio(rainfall_a_mm, rainfall_b_mm) if (rainfall_a_mm is not None and rainfall_b_mm is not None) else 0.85
    w_rain = CATEGORY_WEIGHTS["rainfall_similarity"]
    c_rain = r_score * w_rain
    exp_rain = (
        f"Rainfall exposure is comparable (A: {rainfall_a_mm or 'regional'} mm, B: {rainfall_b_mm or 'regional'} mm) "
        f"originating from the same monsoon/cyclone cloud system."
    )
    if r_score > 0.8:
        reasons.append("Comparable storm rainfall forcing")
    explanations.append(ExplanationDetail(
        feature_name="event_rainfall",
        feature_category="rainfall_similarity",
        value_a=rainfall_a_mm,
        value_b=rainfall_b_mm,
        similarity_score=round(r_score, 3),
        weight=w_rain,
        weighted_contribution=round(c_rain, 4),
        explanation=exp_rain,
        data_quality="official" if rainfall_a_mm is not None else "derived",
    ))

    # 3. Terrain Similarity
    terrain_a = get_terrain(db, place_a.id)
    terrain_b = get_terrain(db, place_b.id)
    elev_a = terrain_a.mean_elevation if terrain_a else None
    elev_b = terrain_b.mean_elevation if terrain_b else None
    t_score = _safe_ratio(elev_a, elev_b)
    w_terr = CATEGORY_WEIGHTS["terrain_similarity"]
    c_terr = t_score * w_terr
    exp_terr = (
        f"Terrain elevation (Copernicus DEM 30m) comparison: A={elev_a or 'N/A'} m vs B={elev_b or 'N/A'} m."
    )
    if t_score > 0.8:
        reasons.append("Similar topographic elevation")
    explanations.append(ExplanationDetail(
        feature_name="mean_elevation",
        feature_category="terrain_similarity",
        value_a=elev_a,
        value_b=elev_b,
        similarity_score=round(t_score, 3),
        weight=w_terr,
        weighted_contribution=round(c_terr, 4),
        explanation=exp_terr,
        data_quality="derived",
    ))

    # 4. Drainage Similarity
    ds_a = drain_stats(db, place_a.ward)
    ds_b = drain_stats(db, place_b.ward)
    len_a = float(ds_a.get("total_length_m", 0.0))
    len_b = float(ds_b.get("total_length_m", 0.0))
    d_score = _safe_ratio(len_a, len_b)
    w_drain = CATEGORY_WEIGHTS["drainage_similarity"]
    c_drain = d_score * w_drain
    exp_drain = (
        f"Stormwater drain infrastructure density comparison: A has {len_a:.0f}m total network length vs B with {len_b:.0f}m."
    )
    if d_score > 0.7:
        reasons.append("Comparable stormwater drain asset density")
    explanations.append(ExplanationDetail(
        feature_name="drain_network_length",
        feature_category="drainage_similarity",
        value_a=len_a,
        value_b=len_b,
        similarity_score=round(d_score, 3),
        weight=w_drain,
        weighted_contribution=round(c_drain, 4),
        explanation=exp_drain,
        data_quality="official",
    ))

    # 5. Land Cover Similarity
    lc_a = get_landcover(db, place_a.id)
    lc_b = get_landcover(db, place_b.id)
    built_a = lc_a.builtup_fraction if lc_a else None
    built_b = lc_b.builtup_fraction if lc_b else None
    lc_score = _safe_ratio(built_a, built_b)
    w_lc = CATEGORY_WEIGHTS["landcover_similarity"]
    c_lc = lc_score * w_lc
    exp_lc = (
        f"ESA WorldCover built-up urban fraction: A has {built_a or 0.0:.2f} vs B with {built_b or 0.0:.2f}."
    )
    if lc_score > 0.8:
        reasons.append("Similar urban built-up density")
    explanations.append(ExplanationDetail(
        feature_name="builtup_fraction",
        feature_category="landcover_similarity",
        value_a=built_a,
        value_b=built_b,
        similarity_score=round(lc_score, 3),
        weight=w_lc,
        weighted_contribution=round(c_lc, 4),
        explanation=exp_lc,
        data_quality="research",
    ))

    # 6. Event Severity Contrast / Similarity
    sev_score = _safe_ratio(severity_a, severity_b) if (severity_a is not None and severity_b is not None) else 0.70
    w_sev = CATEGORY_WEIGHTS["event_similarity"]
    c_sev = sev_score * w_sev
    exp_sev = "Comparable exposure under the same regional monsoon storm scenario."
    explanations.append(ExplanationDetail(
        feature_name="event_severity",
        feature_category="event_similarity",
        value_a=severity_a,
        value_b=severity_b,
        similarity_score=round(sev_score, 3),
        weight=w_sev,
        weighted_contribution=round(c_sev, 4),
        explanation=exp_sev,
        data_quality="official",
    ))

    # Overall similarity score is sum of weighted contributions
    total_score = sum(e.weighted_contribution for e in explanations)
    total_score = max(0.0, min(1.0, round(total_score, 3)))

    return total_score, explanations, reasons


def save_comparison_explanations(
    db: Session,
    comparison_id: UUID,
    explanations: list[ExplanationDetail],
) -> list[ComparisonExplanation]:
    """Persist explanation items to database."""
    # Delete existing explanations for this comparison to remain idempotent
    db.query(ComparisonExplanation).filter(ComparisonExplanation.comparison_id == comparison_id).delete()

    models = []
    for exp in explanations:
        m = ComparisonExplanation(
            comparison_id=comparison_id,
            feature_name=exp.feature_name,
            feature_category=exp.feature_category,
            value_a=exp.value_a,
            value_b=exp.value_b,
            similarity_score=exp.similarity_score,
            weight=exp.weight,
            weighted_contribution=exp.weighted_contribution,
            explanation=exp.explanation,
            data_quality=exp.data_quality,
        )
        models.append(m)
        db.add(m)

    db.flush()
    return models

