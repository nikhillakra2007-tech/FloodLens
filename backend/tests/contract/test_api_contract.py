"""Phase 2.5 API Contract Hardening Tests.

Validates:
1. Unified investigation response schema with complete context
2. Scientific status enums (certainty, validation, defensibility, comparability, alignment, provenance)
3. Explicit physical units in response schemas
4. Limitations endpoint and 8 canonical Case 001 limitations
5. Deterministic claim provenance lineage without filesystem path leakage
6. Standardized error contract format ({"error": {"code": "...", "message": "...", "details": {...}}})
7. Explainable similarity breakdown
8. Mechanisms with confidence meaning and evidence linking
"""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from geoalchemy2.elements import WKTElement

from app.core.database import get_db
from app.db.models.drainage_models import DrainSegment, Outfall
from app.db.models.flood_models import FloodEvent, FloodObservation, RainfallObservation
from app.db.models.location_models import LandcoverFeature, Place, TerrainFeature
from app.db.models.phase2_models import ContributingAreaProxy, DrainageNetworkVersion, RainfallEventFeature
from app.main import app
from app.schemas.enums import (
    CertaintyLevel,
    DefensibilityVerdict,
    DrainageAlignmentStatus,
    GeometryProvenance,
    LimitationSeverity,
    RainfallComparabilityStatus,
    ValidationStatus,
)


def _override_get_db(db):
    def _get_db():
        try:
            yield db
        finally:
            pass
    return _get_db


@pytest.fixture
def api_test_data(db):
    """Seed comprehensive dataset for API contract verification."""
    p1 = Place(name="Contract Ward 101", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    p2 = Place(name="Contract Ward 102", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    db.add_all([p1, p2])
    db.flush()

    e2015 = FloodEvent(event_type="extreme_rainfall", description="2015 Flood", rainfall_mm=494.0, source="IMD", started_at=datetime(2015, 11, 30, tzinfo=timezone.utc))
    e2021 = FloodEvent(event_type="extreme_rainfall", description="2021 Flood", rainfall_mm=210.0, source="IMD", started_at=datetime(2021, 11, 6, tzinfo=timezone.utc))
    e2023 = FloodEvent(event_type="cyclone", description="2023 Michaung", rainfall_mm=450.0, source="IMD", started_at=datetime(2023, 12, 3, tzinfo=timezone.utc))
    db.add_all([e2015, e2021, e2023])
    db.flush()

    # Terrain
    t1 = TerrainFeature(place_id=p1.id, mean_elevation=6.0, min_elevation=4.0, max_elevation=9.0, mean_slope=1.2, hand=1.5, relative_elevation=-1.0, source="copernicus_dem", computation_version="v1")
    t2 = TerrainFeature(place_id=p2.id, mean_elevation=9.0, min_elevation=7.0, max_elevation=12.0, mean_slope=1.8, hand=3.5, relative_elevation=1.5, source="copernicus_dem", computation_version="v1")
    # Landcover
    lc1 = LandcoverFeature(place_id=p1.id, builtup_fraction=0.82, vegetation_fraction=0.10, water_fraction=0.04, source="esa_worldcover", computation_version="v1")
    lc2 = LandcoverFeature(place_id=p2.id, builtup_fraction=0.45, vegetation_fraction=0.40, water_fraction=0.08, source="esa_worldcover", computation_version="v1")
    # Contributing area
    cap1 = ContributingAreaProxy(place_id=p1.id, method="DEM_HAND_DRAINAGE_TOPOLOGY", method_version="v2", area_km2=0.82, is_true_catchment=False)
    cap2 = ContributingAreaProxy(place_id=p2.id, method="DEM_HAND_DRAINAGE_TOPOLOGY", method_version="v2", area_km2=0.40, is_true_catchment=False)
    # Rainfall features
    rf1 = RainfallEventFeature(event_id=e2015.id, place_id=p1.id, source="IMD", rainfall_window_start=datetime(2015, 11, 30, tzinfo=timezone.utc), rainfall_window_end=datetime(2015, 12, 2, tzinfo=timezone.utc), cumulative_rainfall_mm=390.0, confidence_level="HIGH")
    rf2 = RainfallEventFeature(event_id=e2015.id, place_id=p2.id, source="IMD", rainfall_window_start=datetime(2015, 11, 30, tzinfo=timezone.utc), rainfall_window_end=datetime(2015, 12, 2, tzinfo=timezone.utc), cumulative_rainfall_mm=380.0, confidence_level="HIGH")
    # Drainage nodes & segments
    from app.db.models.drainage_models import DrainNode
    n1 = DrainNode(node_type="inlet", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    n2 = DrainNode(node_type="junction", ward="101", geom=WKTElement("POINT(80.211 13.086)", srid=4326))
    n3 = DrainNode(node_type="inlet", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    n4 = DrainNode(node_type="junction", ward="102", geom=WKTElement("POINT(80.221 13.046)", srid=4326))
    db.add_all([n1, n2, n3, n4])
    db.flush()

    seg1 = DrainSegment(start_node_id=n1.id, end_node_id=n2.id, ward="101", street_name="Road A", drain_type="SWD", is_inferred=False, length_m=350.0, depth_m=1.2, width_m=1.5, geometry_provenance="DIRECT", geom=WKTElement("LINESTRING(80.210 13.085, 80.211 13.086)", srid=4326))
    seg2 = DrainSegment(start_node_id=n3.id, end_node_id=n4.id, ward="102", street_name="Road B", drain_type="macro", is_inferred=False, length_m=500.0, depth_m=0.8, width_m=1.0, geometry_provenance="DIRECT", geom=WKTElement("LINESTRING(80.220 13.045, 80.221 13.046)", srid=4326))
    # Flood observations
    obs1 = FloodObservation(event_id=e2015.id, place_id=p1.id, ward="101", depth_cm=45.0, severity="severe", source="field_obs", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    obs2 = FloodObservation(event_id=e2015.id, place_id=p2.id, ward="102", depth_cm=15.0, severity="moderate", source="field_obs", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    obs3 = FloodObservation(event_id=e2021.id, place_id=p1.id, ward="101", depth_cm=35.0, severity="moderate", source="field_obs", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    obs4 = FloodObservation(event_id=e2021.id, place_id=p2.id, ward="102", depth_cm=10.0, severity="minor", source="field_obs", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    obs5 = FloodObservation(event_id=e2023.id, place_id=p1.id, ward="101", depth_cm=50.0, severity="severe", source="field_obs", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    obs6 = FloodObservation(event_id=e2023.id, place_id=p2.id, ward="102", depth_cm=20.0, severity="moderate", source="field_obs", geom=WKTElement("POINT(80.220 13.045)", srid=4326))

    db.add_all([t1, t2, lc1, lc2, cap1, cap2, rf1, rf2, seg1, seg2, obs1, obs2, obs3, obs4, obs5, obs6])
    db.commit()

    return {"p1": p1, "p2": p2, "e2015": e2015}


def test_standardized_error_contract_format(db):
    """Verify 404, 422, and invalid requests adhere strictly to {"error": {"code", "message", "details"}}."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)
    try:
        # 1. 404 Resource Not Found
        resp = client.get("/api/v1/locations/places/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404
        data = resp.json()
        assert "error" in data
        assert data["error"]["code"] == "RESOURCE_NOT_FOUND"
        assert "Place not found" in data["error"]["message"]
        assert isinstance(data["error"]["details"], dict)

        # 2. 422 Request Validation Failure
        resp = client.get("/api/v1/map/drains")  # missing required query params
        assert resp.status_code == 422
        data = resp.json()
        assert "error" in data
        assert data["error"]["code"] == "VALIDATION_ERROR"
        assert "validation" in data["error"]["message"].lower()
        assert "validation_errors" in data["error"]["details"]
        assert len(data["error"]["details"]["validation_errors"]) >= 1

        # 3. Missing investigation 404
        resp = client.get("/api/v1/investigations/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404
        assert resp.json()["error"]["code"] == "RESOURCE_NOT_FOUND"
    finally:
        app.dependency_overrides.clear()


def test_unified_investigation_response_contract(db, api_test_data):
    """Verify the unified investigation endpoint provides all frontend-required sections."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)
    try:
        p1 = api_test_data["p1"]
        p2 = api_test_data["p2"]

        # Create comparison
        comp_resp = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
        assert comp_resp.status_code == 200
        comp_data = comp_resp.json()
        assert "similarity_breakdown" in comp_data
        assert comp_data["similarity_breakdown"]["rainfall_similarity"] is not None
        comp_id = comp_data["id"]

        # Create investigation
        inv_resp = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
        assert inv_resp.status_code == 200
        inv_id = inv_resp.json()["id"]

        # Query Unified Investigation Detail
        detail_resp = client.get(f"/api/v1/investigations/{inv_id}")
        assert detail_resp.status_code == 200
        d = detail_resp.json()

        # Contract checks
        assert d["id"] == inv_id
        assert d["investigation_id"] == inv_id
        assert d["status"] in ("completed", "running")
        assert d["place_a"]["name"] == "Contract Ward 101"
        assert d["place_b"]["name"] == "Contract Ward 102"
        assert d["comparison"]["id"] == comp_id

        # Mechanisms
        assert len(d["mechanisms"]) >= 1
        for m in d["mechanisms"]:
            assert "mechanism_type" in m
            assert "score" in m
            assert "confidence" in m
            assert "certainty" in m
            assert "confidence_meaning" in m
            assert m["confidence_meaning"] is not None
            assert isinstance(m["supporting_evidence_ids"], list)
            assert isinstance(m["limiting_evidence_ids"], list)

        # Evidence
        assert len(d["evidence"]) >= 1
        for e in d["evidence"]:
            assert "evidence_id" in e
            assert e["evidence_id"] == e["id"]
            assert "mechanism_type" in e
            assert "claim" in e
            assert "certainty_level" in e
            assert e["certainty_level"] in [c.value for c in CertaintyLevel]
            assert "limitations" in e
            assert isinstance(e["limitations"], list)

        # Defensibility
        assert d["defensibility"] is not None
        def_data = d["defensibility"]
        assert "verdict" in def_data
        assert def_data["verdict"] in [v.value for v in DefensibilityVerdict]
        assert "gates" in def_data
        assert "correlation_gates" in def_data
        assert "causal_gates" in def_data
        assert def_data["total_gates"] == 8
        assert "material_limitations" in def_data
        assert len(def_data["material_limitations"]) >= 1
        assert def_data["has_material_limitations"] is True

        # Limitations
        assert len(d["limitations"]) == 8
        lim_names = [lim["limitation"] for lim in d["limitations"]]
        assert "rainfall_spatial_resolution" in lim_names
        assert "dem_micro_topography" in lim_names
        assert "contributing_area_proxy" in lim_names
        assert "drainage_temporal_mismatch" in lim_names
        assert "static_land_cover" in lim_names
        assert "drain_blockage_unknown" in lim_names
        assert "historical_sample_size" in lim_names
        assert "no_calibrated_hydraulic_model" in lim_names

        # Lineage summary
        assert "provenance_summary" in d
        assert d["provenance_summary"]["lineage_available"] is True
    finally:
        app.dependency_overrides.clear()


def test_investigation_sub_endpoints_and_provenance(db, api_test_data):
    """Verify granular sub-endpoints (/mechanisms, /evidence, /limitations, /provenance)."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)
    try:
        p1 = api_test_data["p1"]
        p2 = api_test_data["p2"]
        comp_resp = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
        comp_id = comp_resp.json()["id"]
        inv_resp = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
        inv_id = inv_resp.json()["id"]

        # 1. /mechanisms
        mech_resp = client.get(f"/api/v1/investigations/{inv_id}/mechanisms")
        assert mech_resp.status_code == 200
        mechs = mech_resp.json()
        assert len(mechs) >= 1
        assert all("confidence_meaning" in m for m in mechs)

        # 2. /evidence
        evi_resp = client.get(f"/api/v1/investigations/{inv_id}/evidence")
        assert evi_resp.status_code == 200
        evidence_list = evi_resp.json()
        assert len(evidence_list) >= 1
        ev0 = evidence_list[0]
        ev_id = ev0["id"]

        # 3. /limitations
        lim_resp = client.get(f"/api/v1/investigations/{inv_id}/limitations")
        assert lim_resp.status_code == 200
        lims = lim_resp.json()
        assert len(lims) == 8
        for lim in lims:
            assert lim["severity"] in ("HIGH", "MEDIUM", "LOW")
            assert "affected_feature" in lim
            assert "explanation" in lim

        # 4. /evidence/{evidence_id}/provenance
        prov_resp = client.get(f"/api/v1/investigations/{inv_id}/evidence/{ev_id}/provenance")
        assert prov_resp.status_code == 200
        prov = prov_resp.json()
        assert prov["investigation_id"] == inv_id
        assert prov["evidence_id"] == ev_id
        assert "chain" in prov
        chain_levels = [step["level"] for step in prov["chain"]]
        assert chain_levels == ["claim", "evidence", "feature", "derivation", "source_file", "dataset_version", "source"]

        # Verify NO filesystem path is leaked in provenance
        for step in prov["chain"]:
            step_str = str(step)
            assert "C:\\" not in step_str
            assert "Users\\" not in step_str

        # 5. /provenance (primary claim)
        pri_prov_resp = client.get(f"/api/v1/investigations/{inv_id}/provenance")
        assert pri_prov_resp.status_code == 200
        assert len(pri_prov_resp.json()["chain"]) == 7
    finally:
        app.dependency_overrides.clear()


def test_explicit_units_and_schema_types(db, api_test_data):
    """Verify physical units are explicitly declared on geospatial and drainage endpoints."""
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)
    try:
        p1 = api_test_data["p1"]

        # 1. Terrain features
        tf_resp = client.get(f"/api/v1/terrain/features?place_id={p1.id}")
        assert tf_resp.status_code == 200
        tf_list = tf_resp.json()
        assert len(tf_list) >= 1
        tf = tf_list[0]
        assert "elevation_mean_m" in tf
        assert "hand_m" in tf
        assert "mean_slope_degrees" in tf
        assert tf["elevation_mean_m"] == tf["mean_elevation"]
        assert tf["hand_m"] == tf["hand"]

        # 2. Drainage stats
        ds_resp = client.get("/api/v1/drainage/stats?ward=101")
        assert ds_resp.status_code == 200
        ds = ds_resp.json()
        assert "total_length_m" in ds
        assert "segment_count" in ds
        assert "inferred_count" in ds

        # 3. Map drains
        md_resp = client.get("/api/v1/map/drains?lon=80.210&lat=13.085&radius_m=1000")
        assert md_resp.status_code == 200
        md = md_resp.json()
        assert "drains" in md
        assert len(md["drains"]) >= 1
        assert "length_m" in md["drains"][0]

        # 4. Map flood observations
        mo_resp = client.get("/api/v1/map/flood-observations?lon=80.210&lat=13.085&radius_m=1000")
        assert mo_resp.status_code == 200
        mo = mo_resp.json()
        assert "observations" in mo
        assert len(mo["observations"]) >= 1
        assert "depth_cm" in mo["observations"][0]
    finally:
        app.dependency_overrides.clear()
