from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class MechanismType(str, Enum):
    RUNOFF_CONCENTRATION = "RUNOFF_CONCENTRATION"
    DRAINAGE_CAPACITY = "DRAINAGE_CAPACITY"
    DRAINAGE_CONNECTIVITY = "DRAINAGE_CONNECTIVITY"
    TERRAIN_DEPRESSION = "TERRAIN_DEPRESSION"
    OUTFALL_RESTRICTION = "OUTFALL_RESTRICTION"
    WATERBODY_INTERACTION = "WATERBODY_INTERACTION"
    IMPERVIOUS_SURFACE = "IMPERVIOUS_SURFACE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


@dataclass
class MechanismScore:
    mechanism_type: str
    score: float
    confidence: float
    rank: int | None = None
    explanation: str = ""
    signal_values: dict[str, Any] = field(default_factory=dict)


MECHANISM_WEIGHTS = {
    "upstream_built_fraction": 0.30,
    "contributing_area": 0.20,
    "rainfall": 0.20,
    "ab_difference": 0.30,
}


def _clamp(v: float) -> float:
    return max(0.0, min(1.0, v))


def score_runoff_concentration(
    upstream_built_a: float | None,
    upstream_built_b: float | None,
    contributing_area_a: float | None,
    contributing_area_b: float | None,
    rainfall_a: float | None,
    rainfall_b: float | None,
) -> MechanismScore:
    vals: dict[str, Any] = {}
    if upstream_built_a is not None and upstream_built_b is not None:
        vals["upstream_built_diff"] = upstream_built_a - upstream_built_b
    if contributing_area_a is not None and contributing_area_b is not None:
        vals["contributing_area_diff"] = contributing_area_a - contributing_area_b

    signals = []
    if "upstream_built_diff" in vals and vals["upstream_built_diff"] > 0.1:
        signals.append("higher_upstream_built_fraction")
    if "contributing_area_diff" in vals and vals["contributing_area_diff"] > 0.2:
        signals.append("larger_contributing_area")

    score = _clamp(len(signals) * 0.35)
    confidence = _clamp(0.3 + len(signals) * 0.2)
    return MechanismScore(
        mechanism_type=MechanismType.RUNOFF_CONCENTRATION.value,
        score=score,
        confidence=confidence,
        explanation=f"Signals: {', '.join(signals) if signals else 'none detected'}",
        signal_values=vals,
    )


def score_drainage_capacity(
    capacity_a: float | None,
    capacity_b: float | None,
    width_diff: float | None,
    depth_diff: float | None,
    upstream_load_a: float | None,
    upstream_load_b: float | None,
) -> MechanismScore:
    vals: dict[str, Any] = {}
    if capacity_a is not None and capacity_b is not None:
        vals["capacity_ratio"] = capacity_a / max(capacity_b, 1e-9)
    if upstream_load_a is not None and upstream_load_b is not None:
        vals["upstream_load_diff"] = upstream_load_a - upstream_load_b

    signals = []
    if "capacity_ratio" in vals and vals["capacity_ratio"] < 0.8:
        signals.append("lower_effective_capacity")
    if "upstream_load_diff" in vals and vals["upstream_load_diff"] > 0:
        signals.append("higher_upstream_load")

    score = _clamp(len(signals) * 0.3)
    confidence = _clamp(0.3 + len(signals) * 0.2)
    return MechanismScore(
        mechanism_type=MechanismType.DRAINAGE_CAPACITY.value,
        score=score,
        confidence=confidence,
        explanation=f"Signals: {', '.join(signals) if signals else 'none detected'}",
        signal_values=vals,
    )


def score_drainage_connectivity(
    connected_a: bool | None,
    connected_b: bool | None,
    path_length_a: float | None,
    path_length_b: float | None,
    inferred_ratio_a: float | None,
) -> MechanismScore:
    vals: dict[str, Any] = {}
    if connected_a is not None and connected_b is not None:
        vals["connectivity_diff"] = int(connected_a) - int(connected_b)
    if path_length_a is not None and path_length_b is not None:
        vals["path_length_diff"] = path_length_a - path_length_b

    signals = []
    if vals.get("connectivity_diff") is not None and vals["connectivity_diff"] < 0:
        signals.append("disconnected_network")
    if "path_length_diff" in vals and vals["path_length_diff"] > 500:
        signals.append("long_path_to_outfall")
    if inferred_ratio_a is not None and inferred_ratio_a > 0.5:
        signals.append("inferred_geometry_dependency")

    score = _clamp(len(signals) * 0.3)
    confidence = _clamp(0.3 + len(signals) * 0.2)
    return MechanismScore(
        mechanism_type=MechanismType.DRAINAGE_CONNECTIVITY.value,
        score=score,
        confidence=confidence,
        explanation=f"Signals: {', '.join(signals) if signals else 'none detected'}",
        signal_values=vals,
    )


def score_terrain_depression(
    hand_a: float | None,
    hand_b: float | None,
    rel_elev_a: float | None,
    rel_elev_b: float | None,
) -> MechanismScore:
    vals: dict[str, Any] = {}
    if hand_a is not None and hand_b is not None:
        vals["hand_diff"] = hand_a - hand_b
    if rel_elev_a is not None and rel_elev_b is not None:
        vals["rel_elev_diff"] = rel_elev_a - rel_elev_b

    signals = []
    if "hand_diff" in vals and vals["hand_diff"] < -1.0:
        signals.append("lower_HAND")
    if "rel_elev_diff" in vals and vals["rel_elev_diff"] < -2.0:
        signals.append("local_terrain_basin")

    score = _clamp(len(signals) * 0.35)
    confidence = _clamp(0.3 + len(signals) * 0.2)
    return MechanismScore(
        mechanism_type=MechanismType.TERRAIN_DEPRESSION.value,
        score=score,
        confidence=confidence,
        explanation=f"Signals: {', '.join(signals) if signals else 'none detected'}",
        signal_values=vals,
    )


def score_outfall_restriction(
    distance_a: float | None,
    distance_b: float | None,
    downstream_length_a: float | None,
    downstream_length_b: float | None,
) -> MechanismScore:
    vals: dict[str, Any] = {}
    if distance_a is not None and distance_b is not None:
        vals["distance_diff"] = distance_a - distance_b
    if downstream_length_a is not None and downstream_length_b is not None:
        vals["downstream_length_diff"] = downstream_length_a - downstream_length_b

    signals = []
    if "distance_diff" in vals and vals["distance_diff"] > 500:
        signals.append("limited_outfall_access")
    if "downstream_length_diff" in vals and vals["downstream_length_diff"] > 1000:
        signals.append("long_downstream_path")

    score = _clamp(len(signals) * 0.3)
    confidence = _clamp(0.3 + len(signals) * 0.2)
    return MechanismScore(
        mechanism_type=MechanismType.OUTFALL_RESTRICTION.value,
        score=score,
        confidence=confidence,
        explanation=f"Signals: {', '.join(signals) if signals else 'none detected'}",
        signal_values=vals,
    )


def score_waterbody_interaction(
    water_fraction_a: float | None,
    water_fraction_b: float | None,
    distance_to_water_a: float | None,
    distance_to_water_b: float | None,
) -> MechanismScore:
    vals: dict[str, Any] = {}
    if water_fraction_a is not None and water_fraction_b is not None:
        vals["water_fraction_diff"] = water_fraction_a - water_fraction_b
    if distance_to_water_a is not None and distance_to_water_b is not None:
        vals["water_distance_diff"] = distance_to_water_a - distance_to_water_b

    signals = []
    if "water_fraction_diff" in vals and vals["water_fraction_diff"] > 0.05:
        signals.append("higher_water_fraction")
    if "water_distance_diff" in vals and vals["water_distance_diff"] < -100:
        signals.append("closer_to_waterbody")

    score = _clamp(len(signals) * 0.3)
    confidence = _clamp(0.3 + len(signals) * 0.2)
    return MechanismScore(
        mechanism_type=MechanismType.WATERBODY_INTERACTION.value,
        score=score,
        confidence=confidence,
        explanation=f"Signals: {', '.join(signals) if signals else 'none detected'}",
        signal_values=vals,
    )


def score_impervious_surface(
    builtup_a: float | None,
    builtup_b: float | None,
    vegetation_a: float | None,
    vegetation_b: float | None,
) -> MechanismScore:
    vals: dict[str, Any] = {}
    if builtup_a is not None and builtup_b is not None:
        vals["builtup_diff"] = builtup_a - builtup_b
    if vegetation_a is not None and vegetation_b is not None:
        vals["vegetation_diff"] = vegetation_a - vegetation_b

    # Evidence independence audit: builtup_fraction and vegetation_fraction originate from
    # the exact same 10m ESA WorldCover classification grid and are co-linear complements.
    # They CANNOT be counted as two independent lines of evidence.
    signals = []
    if "builtup_diff" in vals and vals["builtup_diff"] > 0.1:
        signals.append("higher_builtup_proxy")
        if "vegetation_diff" in vals and vals["vegetation_diff"] < -0.05:
            vals["corroborating_vegetation"] = "reduced_vegetation_colinear"

    # Single proxy signal score bounded to 0.35; confidence bounded to 0.40
    # reflecting that 10m WorldCover is an imperviousness proxy, not measured pavement
    score = _clamp(len(signals) * 0.35)
    confidence = _clamp(0.25 + len(signals) * 0.15) if signals else 0.25
    explanation = (
        f"Signals: {', '.join(signals)} (ESA WorldCover 10m proxy; reduced vegetation is co-linear, not independent)"
        if signals else "Signals: none detected"
    )
    return MechanismScore(
        mechanism_type=MechanismType.IMPERVIOUS_SURFACE.value,
        score=score,
        confidence=confidence,
        explanation=explanation,
        signal_values=vals,
    )


def score_insufficient_evidence(evidence_count: int) -> MechanismScore:
    score = _clamp(1.0 - evidence_count * 0.1) if evidence_count < 10 else 0.1
    return MechanismScore(
        mechanism_type=MechanismType.INSUFFICIENT_EVIDENCE.value,
        score=score,
        confidence=0.1 if evidence_count == 0 else 0.3,
        explanation=f"Evidence items available: {evidence_count}",
        signal_values={"evidence_count": evidence_count},
    )

