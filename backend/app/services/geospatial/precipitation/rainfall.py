"""Deterministic rainfall event feature computation and comparability engine.

Addresses Phase 1 Limitation L2:
- Evaluates station observations & spatial rainfall
- Computes cumulative rainfall, peak interval, intensity, duration, antecedent rainfall
- Explicitly classifies comparability between A and B as:
  COMPARABLE, PARTIALLY_COMPARABLE, or UNKNOWN
- Never claims street-level precision from coarse station data.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.flood_models import FloodEvent, RainfallObservation
from app.db.models.location_models import Place
from app.db.models.phase2_models import RainfallEventFeature


@dataclass
class RainfallComparabilityResult:
    status: str  # 'COMPARABLE', 'PARTIALLY_COMPARABLE', 'UNKNOWN'
    confidence: str  # 'HIGH', 'MODERATE', 'LOW', 'UNKNOWN'
    difference_mm: float | None
    relative_difference_pct: float | None
    explanation: str
    feature_a: dict[str, Any] | None = None
    feature_b: dict[str, Any] | None = None


def compute_rainfall_event_features_from_readings(
    readings: list[dict[str, Any]],
    event_id: UUID,
    place_id: UUID | None,
    source: str = "IMD Station Data",
    station_id: str | None = None,
    station_distance_m: float | None = None,
) -> RainfallEventFeature | None:
    """Compute event-level rainfall summary features from a series of interval readings."""
    if not readings:
        return None

    # Sort readings chronologically
    sorted_readings = sorted(
        readings,
        key=lambda r: r["observed_at"] if isinstance(r["observed_at"], datetime) else datetime.fromisoformat(str(r["observed_at"])),
    )

    window_start = sorted_readings[0]["observed_at"]
    window_end = sorted_readings[-1]["observed_at"]

    cumulative_mm = sum(float(r["rainfall_mm"]) for r in sorted_readings)
    peak_reading = max(sorted_readings, key=lambda r: float(r["rainfall_mm"]))
    peak_mm = float(peak_reading["rainfall_mm"])
    peak_hours = float(peak_reading.get("duration_hours") or 6.0)

    total_duration_hours = sum(float(r.get("duration_hours") or 6.0) for r in sorted_readings)
    mean_intensity = cumulative_mm / max(total_duration_hours, 1.0)
    max_intensity = peak_mm / max(peak_hours, 1.0)

    # Antecedent rainfall estimates (e.g. first 24h of window)
    early_24h = [
        float(r["rainfall_mm"]) for r in sorted_readings
        if (r["observed_at"] - window_start).total_seconds() <= 86400
    ]
    antecedent_24h = sum(early_24h) if early_24h else None

    # Confidence assessment based on station distance and data completeness
    if station_distance_m is not None:
        if station_distance_m < 2000 and len(sorted_readings) >= 4:
            confidence = "HIGH"
        elif station_distance_m < 7000:
            confidence = "MODERATE"
        else:
            confidence = "LOW"
    else:
        confidence = "MODERATE" if len(sorted_readings) >= 4 else "LOW"

    return RainfallEventFeature(
        event_id=event_id,
        place_id=place_id,
        station_id=station_id,
        source=source,
        spatial_method="station_nearest_neighbor",
        rainfall_window_start=window_start,
        rainfall_window_end=window_end,
        cumulative_rainfall_mm=round(cumulative_mm, 2),
        peak_interval_rainfall_mm=round(peak_mm, 2),
        peak_interval_hours=round(peak_hours, 2),
        mean_intensity_mm_per_hr=round(mean_intensity, 2),
        max_intensity_mm_per_hr=round(max_intensity, 2),
        duration_hours=round(total_duration_hours, 2),
        antecedent_rainfall_24h_mm=round(antecedent_24h, 2) if antecedent_24h is not None else None,
        antecedent_rainfall_72h_mm=round(cumulative_mm, 2),
        station_distance_m=round(station_distance_m, 1) if station_distance_m is not None else None,
        interpolation_uncertainty=0.15 if confidence == "HIGH" else 0.35,
        confidence_level=confidence,
    )


def assess_rainfall_comparability(
    feature_a: RainfallEventFeature | dict[str, Any] | None,
    feature_b: RainfallEventFeature | dict[str, Any] | None,
) -> RainfallComparabilityResult:
    """Explicitly determine whether rainfall is COMPARABLE, PARTIALLY_COMPARABLE, or UNKNOWN.

    Success Condition:
    - Never imply street-level precision that station data cannot provide.
    - If either feature is missing -> UNKNOWN.
    - If relative difference <= 15% -> COMPARABLE.
    - If relative difference <= 40% -> PARTIALLY_COMPARABLE.
    - Otherwise -> UNKNOWN / divergent event rainfall.
    """
    if not feature_a or not feature_b:
        return RainfallComparabilityResult(
            status="UNKNOWN",
            confidence="UNKNOWN",
            difference_mm=None,
            relative_difference_pct=None,
            explanation="Insufficient rainfall observations for one or both locations to assess comparability.",
        )

    def _get_val(f, key):
        if isinstance(f, dict):
            return f.get(key)
        return getattr(f, key, None)

    rain_a = _get_val(feature_a, "cumulative_rainfall_mm")
    rain_b = _get_val(feature_b, "cumulative_rainfall_mm")
    conf_a = _get_val(feature_a, "confidence_level") or "MODERATE"
    conf_b = _get_val(feature_b, "confidence_level") or "MODERATE"

    if rain_a is None or rain_b is None:
        return RainfallComparabilityResult(
            status="UNKNOWN",
            confidence="UNKNOWN",
            difference_mm=None,
            relative_difference_pct=None,
            explanation="Cumulative rainfall measurements are missing for location A or B.",
        )

    diff_mm = abs(rain_a - rain_b)
    denom = max(rain_a, rain_b, 1.0)
    rel_diff_pct = (diff_mm / denom) * 100.0

    # Overall confidence is the minimum of both
    conf_order = {"HIGH": 3, "MODERATE": 2, "LOW": 1, "UNKNOWN": 0}
    min_conf_num = min(conf_order.get(conf_a, 1), conf_order.get(conf_b, 1))
    overall_conf = [k for k, v in conf_order.items() if v == min_conf_num][0]

    dict_a = {
        "cumulative_mm": rain_a,
        "peak_mm": _get_val(feature_a, "peak_interval_rainfall_mm"),
        "confidence": conf_a,
    }
    dict_b = {
        "cumulative_mm": rain_b,
        "peak_mm": _get_val(feature_b, "peak_interval_rainfall_mm"),
        "confidence": conf_b,
    }

    if rel_diff_pct <= 15.0:
        return RainfallComparabilityResult(
            status="COMPARABLE",
            confidence=overall_conf,
            difference_mm=round(diff_mm, 2),
            relative_difference_pct=round(rel_diff_pct, 1),
            explanation=(
                f"Rainfall is COMPARABLE between A ({rain_a:.1f} mm) and B ({rain_b:.1f} mm) "
                f"with {rel_diff_pct:.1f}% relative difference. Observations originate from regional "
                f"IMD station monitoring (source resolution: 6-hour interval, point station)."
            ),
            feature_a=dict_a,
            feature_b=dict_b,
        )
    elif rel_diff_pct <= 40.0:
        return RainfallComparabilityResult(
            status="PARTIALLY_COMPARABLE",
            confidence=overall_conf,
            difference_mm=round(diff_mm, 2),
            relative_difference_pct=round(rel_diff_pct, 1),
            explanation=(
                f"Rainfall is PARTIALLY_COMPARABLE between A ({rain_a:.1f} mm) and B ({rain_b:.1f} mm) "
                f"with {rel_diff_pct:.1f}% difference ({diff_mm:.1f} mm delta). Spatial rainfall gradient "
                f"exists across wards but belongs to the same synoptic monsoon/storm event."
            ),
            feature_a=dict_a,
            feature_b=dict_b,
        )
    else:
        return RainfallComparabilityResult(
            status="UNKNOWN",
            confidence="LOW",
            difference_mm=round(diff_mm, 2),
            relative_difference_pct=round(rel_diff_pct, 1),
            explanation=(
                f"Rainfall comparison is marked UNKNOWN due to large rainfall disparity ({rel_diff_pct:.1f}% "
                f"difference, {diff_mm:.1f} mm delta). Micro-scale convective cells or distinct drainage basins."
            ),
            feature_a=dict_a,
            feature_b=dict_b,
        )


evaluate_rainfall_comparability = assess_rainfall_comparability

