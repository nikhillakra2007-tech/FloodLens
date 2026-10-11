"""Unit and regression tests for Phase 2 Final Scientific Audit and Limitation Closure."""

from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from geoalchemy2.elements import WKTElement

from app.core.database import get_db
from app.db.models.flood_models import FloodEvent, FloodObservation
from app.db.models.location_models import LandcoverFeature, Place, TerrainFeature
from app.db.models.phase2_models import DrainageNetworkVersion, RainfallEventFeature
from app.main import app
from app.services.counterfactual.model import CounterfactualBaseline
from app.services.counterfactual.sensitivity import run_counterfactual_sensitivity
from app.services.investigation.evidence import build_evidence_for_mechanism
from app.services.investigation.mechanisms import score_impervious_surface
from app.services.validation.data_quality import run_data_quality_audit
from app.services.validation.defensibility import evaluate_defensibility
from app.services.validation.multi_event import evaluate_event_recurrence, validate_multi_event


def test_impervious_surface_independence_not_double_counted():
    """Verify builtup_fraction and vegetation_fraction from WorldCover are not double-counted as 2 signals."""
    result = score_impervious_surface(
        builtup_a=0.78,
        builtup_b=0.65,
        vegetation_a=0.12,
        vegetation_b=0.22,
    )
    # Must NOT be 0.70! A single proxy contrast must yield score = 0.35 and confidence <= 0.40
    assert result.score == 0.35
    assert result.confidence <= 0.40
    assert "ESA WorldCover 10m proxy" in result.explanation
    assert result.signal_values.get("corroborating_vegetation") == "reduced_vegetation_colinear"


def test_impervious_surface_evidence_is_supported_not_fact():
    """Verify impervious surface proxy is classified as SUPPORTED, not FACT, and uses proxy terminology."""
    items = build_evidence_for_mechanism(
        "IMPERVIOUS_SURFACE",
        {"builtup_diff": 0.13},
        source="test_engine",
    )
    assert len(items) == 1
    item = items[0]
    assert item.certainty_level == "SUPPORTED"
    assert item.certainty_level != "FACT"
    assert "proxy" in item.claim.lower()
    assert item.support_score <= 0.60


def test_multi_event_recurrence_requires_differential_depth(db):
    """Verify that uniform regional flooding is not falsely counted as supporting differential vulnerability."""
    p1 = Place(name="Audit Recur A", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    p2 = Place(name="Audit Recur B", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    db.add_all([p1, p2])
    db.flush()

    e = FloodEvent(event_type="extreme_rainfall", started_at=datetime(2015, 11, 30, tzinfo=timezone.utc), source="test")
    db.add(e)
    db.flush()

    # Both flooded with virtually identical depth (30cm vs 28cm)
    db.add_all([
        FloodObservation(event_id=e.id, place_id=p1.id, depth_cm=30.0, source="test"),
        FloodObservation(event_id=e.id, place_id=p2.id, depth_cm=28.0, source="test"),
    ])
    db.flush()

    evals = evaluate_event_recurrence(db, p1.id, p2.id, "TERRAIN_DEPRESSION")
    assert len(evals) == 1
    # Because depths are within 10cm, must NOT support differential mechanism
    assert evals[0].supports_mechanism is False
    assert "Inconclusive" in evals[0].notes


def test_multi_event_validation_bounds_static_landcover(db):
    """Verify 3 events with static landcover returns MODERATE_SUPPORT and confidence <= 0.60, never STRONG_SUPPORT."""
    p1 = Place(name="Audit Val A", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    p2 = Place(name="Audit Val B", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    db.add_all([p1, p2])
    db.flush()

    e1 = FloodEvent(event_type="extreme_rainfall", started_at=datetime(2015, 11, 30, tzinfo=timezone.utc), source="test")
    e2 = FloodEvent(event_type="monsoon", started_at=datetime(2021, 11, 6, tzinfo=timezone.utc), source="test")
    e3 = FloodEvent(event_type="cyclone", started_at=datetime(2023, 12, 3, tzinfo=timezone.utc), source="test")
    db.add_all([e1, e2, e3])
    db.flush()

    # Place A flooded deeper than Place B in all 3 events
    db.add_all([
        FloodObservation(event_id=e1.id, place_id=p1.id, depth_cm=45.0, source="test"),
        FloodObservation(event_id=e1.id, place_id=p2.id, depth_cm=15.0, source="test"),
        FloodObservation(event_id=e2.id, place_id=p1.id, depth_cm=35.0, source="test"),
        FloodObservation(event_id=e2.id, place_id=p2.id, depth_cm=12.0, source="test"),
        FloodObservation(event_id=e3.id, place_id=p1.id, depth_cm=40.0, source="test"),
        FloodObservation(event_id=e3.id, place_id=p2.id, depth_cm=18.0, source="test"),
    ])
    db.flush()

    res = validate_multi_event(
        db=db,
        investigation_id=uuid4(),
        place_a_id=p1.id,
        place_b_id=p2.id,
        proposed_mechanism="IMPERVIOUS_SURFACE",
    )
    assert res.result == "MODERATE_SUPPORT"
    assert res.result != "STRONG_SUPPORT"
    assert res.confidence <= 0.60
    assert "static 2020 land-cover" in res.explanation


def test_defensibility_gate_evaluator(db):
    """Verify that Defensibility Evaluator tests all 8 gates and identifies material limitations."""
    p1 = Place(name="Gate Place A", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    p2 = Place(name="Gate Place B", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    db.add_all([p1, p2])
    db.flush()

    # Add observations
    e = FloodEvent(event_type="extreme_rainfall", started_at=datetime(2015, 11, 30, tzinfo=timezone.utc), source="test")
    db.add(e)
    db.flush()
    db.add_all([
        FloodObservation(event_id=e.id, place_id=p1.id, depth_cm=45.0, source="test"),
        FloodObservation(event_id=e.id, place_id=p2.id, depth_cm=15.0, source="test"),
        TerrainFeature(place_id=p1.id, mean_elevation=6.2, hand=2.1, relative_elevation=1.3, source="dem", computation_version="v1"),
        TerrainFeature(place_id=p2.id, mean_elevation=8.5, hand=4.5, relative_elevation=2.5, source="dem", computation_version="v1"),
        LandcoverFeature(place_id=p1.id, builtup_fraction=0.78, vegetation_fraction=0.12, water_fraction=0.03, source="lc", computation_version="v1"),
        LandcoverFeature(place_id=p2.id, builtup_fraction=0.65, vegetation_fraction=0.22, water_fraction=0.05, source="lc", computation_version="v1"),
        DrainageNetworkVersion(version="TEST_GATE_NET", survey_year=2015, is_event_aligned=True),
    ])
    db.flush()

    assessment = evaluate_defensibility(
        db=db,
        investigation_id=uuid4(),
        place_a_id=p1.id,
        place_b_id=p2.id,
        proposed_mechanism="IMPERVIOUS_SURFACE",
        event_year=2015,
    )
    assert assessment.total_gates == 8
    # Must NOT be unhedged DEFENSIBLE; must carry material limitations
    assert assessment.verdict in ("DEFENSIBLE_WITH_MATERIAL_LIMITATIONS", "INSUFFICIENT_EVIDENCE")
    assert "direct_flood_observation" in assessment.gates
    assert assessment.gates["direct_flood_observation"].status == "PASS"
    assert assessment.gates["independent_mechanism_evidence"].status == "FAIL"


def test_counterfactual_sensitivity_analysis():
    """Verify counterfactual sensitivity analysis runs across 15 parameter variations and checks stability."""
    baseline = CounterfactualBaseline(
        rainfall_mm=393.0,
        contributing_area_km2=0.812,
        runoff_coefficient=0.78,
        effective_capacity=100.0,
    )
    report = run_counterfactual_sensitivity(baseline, "test_reduce_runoff", 0.2)
    assert report.total_variations_tested == 15
    assert report.is_qualitatively_stable is True
    assert report.reductions_count == 15
    assert report.mean_percent_change is not None
    assert report.mean_percent_change < 0
    assert "proxy" in report.disclaimer.lower()


def test_data_quality_audit_runner(db):
    """Verify that Data Quality Audit runs cleanly against active database."""
    from app.db.models.source_models import DataSource, SourceFile
    from app.db.models.phase2_models import FeatureDerivation

    src = DataSource(name="Audit Test Source", trust_level="official")
    db.add(src)
    db.flush()
    sf = SourceFile(
        source_id=src.id,
        file_path="test.csv",
        sha256="abc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
        validation_status="valid",
        ingested_at=datetime.now(timezone.utc),
    )
    db.add(sf)
    db.flush()
    fd = FeatureDerivation(
        feature_type="terrain",
        input_source_file_ids={"test": str(sf.id)},
        computation_method="test",
        computation_version="v1",
        output_feature_name="mean_elevation",
    )
    db.add(fd)
    db.flush()

    report = run_data_quality_audit(db)
    assert report.total_checks == 8
    assert report.checks_failed == 0
    assert report.is_audit_clean is True
    categories = {r.category for r in report.results}
    assert "spatial" in categories
    assert "temporal" in categories
    assert "physical" in categories
    assert "duplicate" in categories
    assert "provenance" in categories


def test_defensibility_and_sensitivity_endpoints(db):
    """Integration test: verify new Phase 2 audit endpoints respond correctly."""
    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    client = TestClient(app)

    try:
        p1 = Place(name="Endp Place A", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
        p2 = Place(name="Endp Place B", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
        db.add_all([p1, p2])
        db.flush()

        comp_resp = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
        assert comp_resp.status_code == 200
        comp_id = comp_resp.json()["id"]

        inv_resp = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
        assert inv_resp.status_code == 200
        inv_id = inv_resp.json()["id"]

        # 1. Defensibility endpoint
        def_resp = client.get(f"/api/v1/investigations/{inv_id}/defensibility")
        assert def_resp.status_code == 200
        def_data = def_resp.json()
        assert "verdict" in def_data
        assert "gates" in def_data
        assert def_data["total_gates"] == 8

        # 2. Counterfactual sensitivity endpoint
        sens_resp = client.post(
            f"/api/v1/investigations/{inv_id}/counterfactual/sensitivity",
            json={
                "scenario_name": "test_sensitivity",
                "runoff_coefficient": 0.78,
                "contributing_area_km2": 0.812,
                "effective_capacity": 100.0,
                "rainfall_mm": 393.0,
                "upstream_impervious_fraction": 0.6,
                "drainage_path_km": 1.2,
            },
        )
        assert sens_resp.status_code == 200
        sens_data = sens_resp.json()
        assert sens_data["total_variations_tested"] == 15
        assert sens_data["is_qualitatively_stable"] is True
        assert len(sens_data["variations"]) == 15
    finally:
        app.dependency_overrides.clear()
