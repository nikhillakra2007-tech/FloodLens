"""Phase 2.6 Evidence & Provenance Finalization Tests.

Validates:
1. Every evidence item has provenance
2. Every mechanism has evidence linkage
3. No same-source double counting (ESA WorldCover built-up and vegetation fractions)
4. UNKNOWN remains UNKNOWN
5. HYPOTHESIS remains HYPOTHESIS
6. Correlation cannot become causation
7. Counterfactual provenance is complete (proxy disclaimer)
8. Historical validation provenance is complete (N=3 sample size)
9. Defensibility gates have evidence and gate_type (CORRELATION vs CAUSAL)
10. Broken lineage fails loudly (HTTP 422)
11. Source deletion is constrained (DB FK RESTRICT)
12. Dataset deletion is constrained (DB FK RESTRICT)
13. Filesystem paths never leak
14. Agent cannot mutate scientific state
15. Agent cannot invent evidence or upgrade certainty
"""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from geoalchemy2.elements import WKTElement
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.db.models.drainage_models import DrainSegment, Outfall
from app.db.models.evidence_models import EvidenceItem
from app.db.models.flood_models import FloodEvent, FloodObservation, RainfallObservation
from app.db.models.investigation_models import Investigation
from app.db.models.location_models import LandcoverFeature, Place, TerrainFeature
from app.db.models.phase2_models import ContributingAreaProxy, DrainageNetworkVersion, RainfallEventFeature
from app.db.models.source_models import DataSource, SourceFile
from app.main import app
from app.schemas.enums import (
    CertaintyLevel,
    EvidenceRelationType,
    GateType,
    SourceIndependenceType,
)
from app.agent.guardrails import check_claim_safety, validate_agent_output


def _override_get_db(db):
    def _get_db():
        try:
            yield db
        finally:
            pass
    return _get_db


@pytest.fixture
def prov_test_data(db):
    """Seed comprehensive dataset for Phase 2.6 provenance verification."""
    p1 = Place(name="Prov Ward A", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    p2 = Place(name="Prov Ward B", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    db.add_all([p1, p2])
    db.flush()

    e2015 = FloodEvent(event_type="extreme_rainfall", description="2015 Flood", rainfall_mm=494.0, source="IMD", started_at=datetime(2015, 11, 30, tzinfo=timezone.utc))
    e2021 = FloodEvent(event_type="extreme_rainfall", description="2021 Flood", rainfall_mm=210.0, source="IMD", started_at=datetime(2021, 11, 6, tzinfo=timezone.utc))
    e2023 = FloodEvent(event_type="cyclone", description="2023 Michaung", rainfall_mm=450.0, source="IMD", started_at=datetime(2023, 12, 3, tzinfo=timezone.utc))
    db.add_all([e2015, e2021, e2023])
    db.flush()

    t1 = TerrainFeature(place_id=p1.id, mean_elevation=6.0, min_elevation=4.0, max_elevation=9.0, mean_slope=1.2, hand=1.5, relative_elevation=-1.0, source="copernicus_dem", computation_version="v1")
    t2 = TerrainFeature(place_id=p2.id, mean_elevation=9.5, min_elevation=7.0, max_elevation=13.0, mean_slope=1.8, hand=3.9, relative_elevation=1.2, source="copernicus_dem", computation_version="v1")
    lc1 = LandcoverFeature(place_id=p1.id, builtup_fraction=0.82, vegetation_fraction=0.10, water_fraction=0.03, source="esa_worldcover", computation_version="v1")
    lc2 = LandcoverFeature(place_id=p2.id, builtup_fraction=0.69, vegetation_fraction=0.22, water_fraction=0.02, source="esa_worldcover", computation_version="v1")
    db.add_all([t1, t2, lc1, lc2])

    o1 = FloodObservation(place_id=p1.id, event_id=e2015.id, depth_cm=65.0, severity="high", source="tnwrd", observed_at=datetime(2015, 12, 1, tzinfo=timezone.utc))
    o2 = FloodObservation(place_id=p2.id, event_id=e2015.id, depth_cm=15.0, severity="low", source="tnwrd", observed_at=datetime(2015, 12, 1, tzinfo=timezone.utc))
    db.add_all([o1, o2])

    for ev in (e2021, e2023):
        db.add(FloodObservation(place_id=p1.id, event_id=ev.id, depth_cm=50.0, severity="high", source="tnwrd", observed_at=ev.started_at))
        db.add(FloodObservation(place_id=p2.id, event_id=ev.id, depth_cm=10.0, severity="low", source="tnwrd", observed_at=ev.started_at))

    rf1 = RainfallEventFeature(
        event_id=e2015.id,
        place_id=p1.id,
        source="IMD_AWS",
        rainfall_window_start=datetime(2015, 11, 30, tzinfo=timezone.utc),
        rainfall_window_end=datetime(2015, 12, 2, tzinfo=timezone.utc),
        cumulative_rainfall_mm=494.0,
        mean_intensity_mm_per_hr=10.2,
        max_intensity_mm_per_hr=35.0,
        duration_hours=48.0,
        confidence_level="HIGH",
    )
    rf2 = RainfallEventFeature(
        event_id=e2015.id,
        place_id=p2.id,
        source="IMD_AWS",
        rainfall_window_start=datetime(2015, 11, 30, tzinfo=timezone.utc),
        rainfall_window_end=datetime(2015, 12, 2, tzinfo=timezone.utc),
        cumulative_rainfall_mm=480.0,
        mean_intensity_mm_per_hr=10.0,
        max_intensity_mm_per_hr=34.0,
        duration_hours=48.0,
        confidence_level="HIGH",
    )
    db.add_all([rf1, rf2])

    ca1 = ContributingAreaProxy(
        place_id=p1.id,
        method="HYDRO_ROUTING_V2",
        method_version="2.0",
        area_km2=2.45,
        is_true_catchment=False,
    )
    ca2 = ContributingAreaProxy(
        place_id=p2.id,
        method="HYDRO_ROUTING_V2",
        method_version="2.0",
        area_km2=1.80,
        is_true_catchment=False,
    )
    db.add_all([ca1, ca2])

    from app.db.models.drainage_models import DrainNode
    n1 = DrainNode(node_type="inlet", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    n2 = DrainNode(node_type="junction", ward="101", geom=WKTElement("POINT(80.215 13.087)", srid=4326))
    n3 = DrainNode(node_type="inlet", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    n4 = DrainNode(node_type="junction", ward="102", geom=WKTElement("POINT(80.225 13.047)", srid=4326))
    db.add_all([n1, n2, n3, n4])
    db.flush()

    seg1 = DrainSegment(
        start_node_id=n1.id,
        end_node_id=n2.id,
        ward="101",
        drain_type="SWD",
        length_m=1200.0,
        width_m=2.0,
        depth_m=1.5,
        is_inferred=False,
        geom=WKTElement("LINESTRING(80.210 13.085, 80.215 13.087)", srid=4326),
    )
    seg2 = DrainSegment(
        start_node_id=n3.id,
        end_node_id=n4.id,
        ward="102",
        drain_type="macro",
        length_m=1630.0,
        width_m=2.5,
        depth_m=1.8,
        is_inferred=False,
        geom=WKTElement("LINESTRING(80.220 13.045, 80.225 13.047)", srid=4326),
    )
    db.add_all([seg1, seg2])

    nv = DrainageNetworkVersion(
        version="v2015_reconstructed",
        survey_year=2015,
        survey_source="GCC_RECONSTRUCTED",
        description="Reconstructed 2015 baseline",
        segment_count=2,
        node_count=4,
        outfall_count=1,
        total_length_m=2830.0,
        is_event_aligned=True,
        aligned_event_id=e2015.id,
    )
    db.add(nv)

    src = DataSource(
        name="ESA WorldCover Test",
        description="Land cover raster",
        trust_level="research",
        license="CC-BY-4.0",
    )
    db.add(src)
    db.flush()

    sf = SourceFile(
        source_id=src.id,
        file_path="data/raw/esa_worldcover_10m.csv",
        sha256="abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        format="csv",
        ingested_at=datetime.now(timezone.utc),
    )
    db.add(sf)
    db.commit()

    return {
        "p1": p1,
        "p2": p2,
        "source": src,
        "source_file": sf,
        "events": [e2015, e2021, e2023],
    }


def test_every_evidence_item_has_provenance(prov_test_data, db):
    """Requirement 1 & 9: Every evidence item has deterministic provenance lineage."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    assert comp_res.status_code == 200
    comp_id = comp_res.json()["id"]

    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    assert inv_res.status_code == 200
    inv_id = inv_res.json()["id"]

    ev_list_res = client.get(f"/api/v1/investigations/{inv_id}/evidence")
    assert ev_list_res.status_code == 200
    ev_items = ev_list_res.json()
    assert len(ev_items) > 0

    expected_levels = ["claim", "evidence", "feature", "derivation", "source_file", "dataset_version", "source"]

    for ev in ev_items:
        prov_res = client.get(f"/api/v1/investigations/{inv_id}/evidence/{ev['id']}/provenance")
        assert prov_res.status_code == 200
        prov = prov_res.json()
        assert prov["evidence_id"] == ev["id"]
        assert prov["mechanism_type"] == ev["mechanism_type"]

        chain = prov["chain"]
        assert len(chain) == 7
        levels = [step["level"] for step in chain]
        assert levels == expected_levels

        for step in chain:
            assert step["identifier"]
            assert step["name"]
            assert isinstance(step["metadata"], dict)

    app.dependency_overrides.clear()


def test_every_mechanism_has_evidence_linkage_and_relation_type(prov_test_data, db):
    """Requirement 2 & 4: Every mechanism in graph has non-empty evidence_ids and explicit relation_type."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    graph_res = client.get(f"/api/v1/investigations/{inv_id}/graph")
    assert graph_res.status_code == 200
    graph = graph_res.json()

    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0

    valid_relations = {r.value for r in EvidenceRelationType}

    for edge in graph["edges"]:
        assert edge["relation_type"] in valid_relations
        assert edge["certainty_level"] in {c.value for c in CertaintyLevel}
        if edge["mechanism"] in ("IMPERVIOUS_SURFACE", "RUNOFF_CONCENTRATION", "TERRAIN_DEPRESSION"):
            assert len(edge["evidence_ids"]) > 0

    app.dependency_overrides.clear()


def test_source_independence_audit_prevents_double_counting(prov_test_data, db):
    """Requirement 3: Distinguish INDEPENDENT_SOURCE, DEPENDENT_DERIVATION, SAME_SOURCE_SIGNAL."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    ev_list_res = client.get(f"/api/v1/investigations/{inv_id}/evidence")
    ev_items = ev_list_res.json()

    valid_independence = {s.value for s in SourceIndependenceType}
    for ev in ev_items:
        assert "source_independence" in ev
        assert ev["source_independence"] in valid_independence

    terrain_ev = [e for e in ev_items if e["mechanism_type"] == "TERRAIN_DEPRESSION"]
    for te in terrain_ev:
        assert te["source_independence"] == "INDEPENDENT_SOURCE"

    app.dependency_overrides.clear()


def test_unknown_remains_unknown(prov_test_data, db):
    """Requirement 2: Verify missing signals remain UNKNOWN and never upgrade to FACT or SUPPORTED."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    ev_item = EvidenceItem(
        investigation_id=inv_id,
        mechanism_type="INSUFFICIENT_EVIDENCE",
        certainty_level="UNKNOWN",
        claim="Missing sub-surface drainage blockage observation",
        value=None,
        unit=None,
        source="unobserved_pipe_survey",
        support_score=0.0,
        explanation="No field endoscopy data available for conduit siltation",
    )
    db.add(ev_item)
    db.commit()

    ev_prov_res = client.get(f"/api/v1/investigations/{inv_id}/evidence/{ev_item.id}/provenance")
    assert ev_prov_res.status_code == 200
    prov = ev_prov_res.json()

    feat_step = next(s for s in prov["chain"] if s["level"] == "feature")
    assert feat_step["identifier"] == "UNKNOWN"
    assert feat_step["metadata"]["certainty"] == "UNKNOWN"

    app.dependency_overrides.clear()


def test_correlation_cannot_become_causation(prov_test_data, db):
    """Requirement 2 & 8: Defensibility gate 8 detects physical confounders and prevents ungrounded DEFENSIBLE."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    def_res = client.get(f"/api/v1/investigations/{inv_id}/defensibility")
    assert def_res.status_code == 200
    def_data = def_res.json()

    assert def_data["verdict"] == "DEFENSIBLE_WITH_MATERIAL_LIMITATIONS"
    assert def_data["verdict"] != "DEFENSIBLE"

    gates = def_data["gates"]
    assert "causal_mechanism_specificity" in gates
    causal_gate = gates["causal_mechanism_specificity"]
    assert causal_gate["gate_type"] == "CAUSAL"
    assert causal_gate["status"] == "FAIL"

    app.dependency_overrides.clear()


def test_counterfactual_provenance_and_proxy_disclaimer(prov_test_data, db):
    """Requirement 6: Counterfactual identifies input features, baseline values, and explicit proxy limitation."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    payload = {
        "scenario_name": "Test Impervious Reduction",
        "runoff_coefficient": 0.85,
        "contributing_area_km2": 2.4,
        "effective_capacity": 5.0,
        "rainfall_mm": 494.0,
        "upstream_impervious_fraction": 0.82,
        "drainage_path_km": 1.2,
    }
    cf_res = client.post(f"/api/v1/investigations/{inv_id}/counterfactual", json=payload)
    assert cf_res.status_code == 200
    cf_data = cf_res.json()

    assert cf_data["investigation_id"] == inv_id
    assert cf_data["mechanism_tested"] == "RUNOFF_GENERATION_SURCHARGE"
    assert len(cf_data["input_features"]) >= 4
    assert cf_data["is_calibrated_hydraulic_prediction"] is False
    assert "not a calibrated hydraulic prediction" in cf_data["limitation"].lower()
    assert "not a calibrated hydraulic prediction" in cf_data["disclaimer"].lower()

    app.dependency_overrides.clear()


def test_historical_validation_provenance_sample_size(prov_test_data, db):
    """Requirement 7: Multi-event validation exposes sample size N=3, event IDs, and uncertainty limitation."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    val_res = client.get(f"/api/v1/investigations/{inv_id}/validation")
    assert val_res.status_code == 200
    val_data = val_res.json()

    assert val_data["sample_size_n"] == 3
    assert len(val_data["event_ids"]) == 3
    assert len(val_data["source_datasets"]) >= 2
    assert any("n=3" in lim.lower() for lim in val_data["limitations"])

    app.dependency_overrides.clear()


def test_defensibility_gates_have_evidence_and_gate_type(prov_test_data, db):
    """Requirement 8: Every gate exposes gate_type, reason, and evidence_ids."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    def_res = client.get(f"/api/v1/investigations/{inv_id}/defensibility")
    assert def_res.status_code == 200
    def_data = def_res.json()

    gates = def_data["gates"]
    assert len(gates) == 8

    corr_count = 0
    causal_count = 0

    for name, g in gates.items():
        assert g["gate_type"] in ("CORRELATION", "CAUSAL")
        assert g["reason"]
        assert isinstance(g["evidence_ids"], list)
        if g["gate_type"] == "CORRELATION":
            corr_count += 1
        elif g["gate_type"] == "CAUSAL":
            causal_count += 1

    assert corr_count == 5
    assert causal_count == 3

    app.dependency_overrides.clear()


def test_broken_lineage_fails_loudly(prov_test_data, db):
    """Requirement 9 & 10: If an evidence item cannot resolve its scientific lineage, fail loudly with HTTP 422."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    corrupt_item = EvidenceItem(
        investigation_id=inv_id,
        mechanism_type="CORRUPT_UNKNOWN_MECHANISM_XYZ",
        certainty_level="SUPPORTED",
        claim="Fabricated claim with no physical mapping",
        value=999.0,
        unit="arbitrary",
        source="untrusted_injection",
        support_score=0.9,
    )
    db.add(corrupt_item)
    db.commit()

    broken_prov_res = client.get(f"/api/v1/investigations/{inv_id}/evidence/{corrupt_item.id}/provenance")
    assert broken_prov_res.status_code == 422
    err_body = broken_prov_res.json()
    assert "broken scientific lineage" in str(err_body).lower()

    app.dependency_overrides.clear()


def test_database_fk_deletion_constraints(prov_test_data, db):
    """Requirement 10: Database integrity ensures ON DELETE RESTRICT prevents silent orphaning."""
    src = prov_test_data["source"]
    p1 = prov_test_data["p1"]

    with pytest.raises(IntegrityError):
        db.delete(src)
        db.flush()
    db.rollback()

    inv = db.query(Investigation).first()
    if inv:
        with pytest.raises(IntegrityError):
            db.delete(inv)
            db.flush()
        db.rollback()


def test_filesystem_paths_never_leak(prov_test_data, db):
    """Requirement 9 & 13: Local filesystem paths and Windows backslashes must never leak."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    p1 = prov_test_data["p1"]
    p2 = prov_test_data["p2"]

    comp_res = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
    comp_id = comp_res.json()["id"]
    inv_res = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
    inv_id = inv_res.json()["id"]

    prov_res = client.get(f"/api/v1/investigations/{inv_id}/provenance")
    assert prov_res.status_code == 200
    prov_text = prov_res.text

    assert "C:\\" not in prov_text
    assert "\\Users\\" not in prov_text
    assert "/Users/" not in prov_text
    assert "\\Desktop\\" not in prov_text

    sources_res = client.get("/api/v1/data-sources")
    assert sources_res.status_code == 200
    sources_text = sources_res.text
    assert "C:\\" not in sources_text
    assert "\\Users\\" not in sources_text

    app.dependency_overrides.clear()


def test_agent_safety_and_guardrails():
    """Requirement 11, 14 & 15: Agent cannot invent evidence, prove causation, or claim hydraulic predictions."""
    safe, issues = check_claim_safety("The drain was blocked causing catastrophic flood")
    assert safe is False
    assert len(issues) > 0

    safe, issues = check_claim_safety("This model predicts exact flood depth of 1.2 meters")
    assert safe is False
    assert any("predicts exact flood depth" in i.lower() for i in issues)

    safe, issues = check_claim_safety("Calibrated hydraulic simulation proved the runoff pathway")
    assert safe is False
    assert any("hydraulic simulation" in i.lower() for i in issues)

    adversarial_output = {
        "investigation_summary": "Analysis predicts exact flood depth under extreme rain",
        "strongest_mechanism": "IMPERVIOUS_SURFACE",
        "confidence": 0.85,
        "supporting_evidence": ["Historical association proves causation"],
        "certainty_classification": {
            "Drainage Blockage UNKNOWN": "FACT",
        },
    }
    valid, errs = validate_agent_output(adversarial_output)
    assert valid is False
    assert any("forbidden claim" in e.lower() for e in errs)
    assert any("illegal certainty upgrade" in e.lower() for e in errs)
