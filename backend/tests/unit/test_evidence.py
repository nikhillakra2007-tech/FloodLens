from app.services.investigation.evidence import build_evidence_for_mechanism


def test_runoff_concentration_produces_supported_evidence():
    items = build_evidence_for_mechanism(
        "RUNOFF_CONCENTRATION",
        {"upstream_built_diff": 0.3},
        "test_source",
    )
    assert len(items) > 0
    assert items[0].certainty_level == "SUPPORTED"
    assert items[0].mechanism_type == "RUNOFF_CONCENTRATION"


def test_terrain_depression_produces_fact_evidence():
    items = build_evidence_for_mechanism(
        "TERRAIN_DEPRESSION",
        {"hand_diff": -2.0},
        "test_source",
    )
    assert len(items) > 0
    assert items[0].certainty_level == "FACT"


def test_unknown_mechanism_produces_unknown_evidence():
    items = build_evidence_for_mechanism(
        "DRAINAGE_CAPACITY",
        {},
        "test_source",
    )
    assert len(items) > 0
    assert items[0].certainty_level == "UNKNOWN"
