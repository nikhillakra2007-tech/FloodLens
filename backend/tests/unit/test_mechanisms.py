from app.services.investigation.mechanisms import (
    score_runoff_concentration,
    score_drainage_capacity,
    score_drainage_connectivity,
    score_terrain_depression,
    score_impervious_surface,
    score_insufficient_evidence,
)


def test_runoff_concentration_high_builtup_difference():
    result = score_runoff_concentration(0.8, 0.5, 10.0, 5.0, 100.0, 80.0)
    assert result.score > 0.0
    assert result.confidence > 0.3
    assert "upstream_built_diff" in result.signal_values


def test_runoff_concentration_no_difference():
    result = score_runoff_concentration(0.5, 0.5, 5.0, 5.0, 100.0, 100.0)
    assert result.score == 0.0


def test_drainage_capacity_lower_capacity_scores():
    result = score_drainage_capacity(100.0, 200.0, None, None, 50.0, 30.0)
    assert result.score > 0.0
    assert "capacity_ratio" in result.signal_values


def test_drainage_connectivity_disconnected_scores():
    result = score_drainage_connectivity(False, True, 1000.0, 200.0, 0.6)
    assert result.score > 0.0
    assert "connectivity_diff" in result.signal_values


def test_terrain_depression_lower_hand_scores():
    result = score_terrain_depression(1.0, 5.0, -2.0, 1.0)
    assert result.score > 0.0
    assert "hand_diff" in result.signal_values


def test_impervious_surface_higher_builtup_scores():
    result = score_impervious_surface(0.8, 0.5, 0.1, 0.2)
    assert result.score > 0.0
    assert "builtup_diff" in result.signal_values


def test_insufficient_evidence_low_evidence_count():
    result = score_insufficient_evidence(0)
    assert result.score > 0.5
    assert result.confidence < 0.3


def test_insufficient_evidence_high_evidence_count():
    result = score_insufficient_evidence(10)
    assert result.score < 0.2
