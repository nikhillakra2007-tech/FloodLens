"""Unit tests for Phase 2 catchment classification and contributing area proxies."""

from app.services.geospatial.catchment import classify_catchment_boundary


def test_classify_true_catchment():
    cls = classify_catchment_boundary(is_true_catchment=True, method="calibrated_delineation")
    assert cls.classification_type == "true_catchment"
    assert cls.is_true_catchment is True


def test_classify_contributing_area_proxy():
    cls = classify_catchment_boundary(is_true_catchment=False, method="dem_hand_drainage_topology")
    assert cls.classification_type == "contributing_area_proxy"
    assert cls.is_true_catchment is False
    assert len(cls.limitations) > 0


def test_classify_analysis_window():
    cls = classify_catchment_boundary(is_true_catchment=False, method="circular_buffer_500m")
    assert cls.classification_type == "analysis_window"
    assert cls.is_true_catchment is False
    assert "Analysis window only" in cls.limitations[0]
