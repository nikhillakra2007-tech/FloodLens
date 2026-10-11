from dataclasses import dataclass, field

DEFAULT_WEIGHTS = {
    "rainfall": 0.25,
    "terrain": 0.20,
    "hand_elevation": 0.15,
    "land_cover": 0.15,
    "drainage_context": 0.15,
    "waterbody_proximity": 0.10,
}


@dataclass
class FeatureVector:
    rainfall_mm: float | None = None
    mean_elevation: float | None = None
    hand: float | None = None
    builtup_fraction: float | None = None
    vegetation_fraction: float | None = None
    water_fraction: float | None = None
    drain_density: float | None = None
    upstream_drainage_m: float | None = None
    outfall_distance_m: float | None = None
    relative_elevation: float | None = None


def _safe_normalize(a: float | None, b: float | None) -> float:
    if a is None or b is None:
        return 0.0
    denom = abs(a) + abs(b)
    if denom < 1e-12:
        return 1.0
    diff = abs(a - b) / denom
    return max(0.0, min(1.0, 1.0 - diff))


def per_feature_similarity(a: FeatureVector, b: FeatureVector) -> dict[str, float]:
    return {
        "rainfall": _safe_normalize(a.rainfall_mm, b.rainfall_mm),
        "terrain": _safe_normalize(a.mean_elevation, b.mean_elevation),
        "hand_elevation": _safe_normalize(a.hand, b.hand),
        "land_cover": _safe_normalize(a.builtup_fraction, b.builtup_fraction),
        "drainage_context": _safe_normalize(a.drain_density, b.drain_density),
        "waterbody_proximity": _safe_normalize(a.water_fraction, b.water_fraction),
    }


def _get_field_name(feature_key: str) -> str:
    mapping = {
        "rainfall": "rainfall_mm",
        "terrain": "mean_elevation",
        "hand_elevation": "hand",
        "land_cover": "builtup_fraction",
        "drainage_context": "drain_density",
        "waterbody_proximity": "water_fraction",
    }
    return mapping.get(feature_key, feature_key)


def weighted_similarity(
    a: FeatureVector, b: FeatureVector, weights: dict[str, float] | None = None
) -> tuple[float, dict[str, float]]:
    w = weights or DEFAULT_WEIGHTS
    feats = per_feature_similarity(a, b)
    # Only weight features where both values are present (not None)
    present_weight = 0.0
    weighted_sum = 0.0
    for k, v in feats.items():
        field_name = _get_field_name(k)
        a_val = getattr(a, field_name, None)
        b_val = getattr(b, field_name, None)
        if a_val is not None and b_val is not None:
            present_weight += w.get(k, 0.0)
            weighted_sum += v * w.get(k, 0.0)
    # Fallback: if no features have both values present
    if present_weight <= 0:
        # Check if ALL features are None in both vectors
        all_none = True
        for k in w.keys():
            field_name = _get_field_name(k)
            a_val = getattr(a, field_name, None)
            b_val = getattr(b, field_name, None)
            if a_val is not None or b_val is not None:
                all_none = False
                break
        if all_none:
            return 1.0, feats  # Both completely unknown -> treat as identical
        return 0.0, feats
    score = weighted_sum / present_weight
    return max(0.0, min(1.0, score)), feats

