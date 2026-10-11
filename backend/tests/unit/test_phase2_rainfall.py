"""Unit tests for Phase 2 rainfall features and comparability engine."""

from datetime import datetime, timezone
from uuid import uuid4

from app.services.geospatial.rainfall import (
    assess_rainfall_comparability,
    compute_rainfall_event_features_from_readings,
)


def test_rainfall_feature_computation():
    event_id = uuid4()
    place_id = uuid4()
    readings = [
        {"observed_at": datetime(2015, 11, 30, 0, 0, tzinfo=timezone.utc), "rainfall_mm": 15.0, "duration_hours": 6.0},
        {"observed_at": datetime(2015, 11, 30, 6, 0, tzinfo=timezone.utc), "rainfall_mm": 25.0, "duration_hours": 6.0},
        {"observed_at": datetime(2015, 11, 30, 12, 0, tzinfo=timezone.utc), "rainfall_mm": 50.0, "duration_hours": 6.0},
        {"observed_at": datetime(2015, 11, 30, 18, 0, tzinfo=timezone.utc), "rainfall_mm": 60.0, "duration_hours": 6.0},
    ]

    feat = compute_rainfall_event_features_from_readings(
        readings=readings,
        event_id=event_id,
        place_id=place_id,
        source="IMD Station Data",
        station_id="IMD_TEST",
        station_distance_m=1500.0,
    )

    assert feat is not None
    assert feat.cumulative_rainfall_mm == 150.0
    assert feat.peak_interval_rainfall_mm == 60.0
    assert feat.duration_hours == 24.0
    assert feat.confidence_level == "HIGH"  # Distance < 2000m and >= 4 readings


def test_rainfall_comparability_comparable():
    feat_a = {"cumulative_rainfall_mm": 210.0, "confidence_level": "HIGH", "peak_interval_rainfall_mm": 60.0}
    feat_b = {"cumulative_rainfall_mm": 200.0, "confidence_level": "HIGH", "peak_interval_rainfall_mm": 55.0}

    result = assess_rainfall_comparability(feat_a, feat_b)
    assert result.status == "COMPARABLE"
    assert result.confidence == "HIGH"
    assert result.difference_mm == 10.0
    assert result.relative_difference_pct is not None
    assert result.relative_difference_pct < 15.0


def test_rainfall_comparability_partially_comparable():
    feat_a = {"cumulative_rainfall_mm": 250.0, "confidence_level": "MODERATE", "peak_interval_rainfall_mm": 70.0}
    feat_b = {"cumulative_rainfall_mm": 190.0, "confidence_level": "MODERATE", "peak_interval_rainfall_mm": 50.0}

    result = assess_rainfall_comparability(feat_a, feat_b)
    assert result.status == "PARTIALLY_COMPARABLE"
    assert result.confidence == "MODERATE"
    assert "PARTIALLY_COMPARABLE" in result.explanation


def test_rainfall_comparability_unknown_when_divergent():
    feat_a = {"cumulative_rainfall_mm": 400.0, "confidence_level": "MODERATE"}
    feat_b = {"cumulative_rainfall_mm": 150.0, "confidence_level": "MODERATE"}

    result = assess_rainfall_comparability(feat_a, feat_b)
    assert result.status == "UNKNOWN"


def test_rainfall_comparability_missing_data():
    result = assess_rainfall_comparability(None, {"cumulative_rainfall_mm": 200.0})
    assert result.status == "UNKNOWN"
    assert "Insufficient rainfall observations" in result.explanation
