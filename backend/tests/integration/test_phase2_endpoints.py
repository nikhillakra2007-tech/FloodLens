"""Integration tests for Phase 2 API endpoints."""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from geoalchemy2.elements import WKTElement

from app.core.database import get_db
from app.db.models.drainage_models import DrainSegment, Outfall
from app.db.models.flood_models import FloodEvent, FloodObservation, RainfallObservation
from app.db.models.location_models import Place, TerrainFeature
from app.db.models.phase2_models import (
    ContributingAreaProxy,
    DrainageNetworkVersion,
    RainfallEventFeature,
)
from app.db.models.source_models import DataSource, SourceFile
from app.main import app


def _override_get_db(db):
    def _get_db():
        try:
            yield db
        finally:
            pass
    return _get_db


def test_phase2_events_and_observations_api(db):
    # Seed events
    e1 = FloodEvent(event_type="extreme_rainfall", description="2015 Flood", rainfall_mm=494.0, source="test", started_at=datetime(2015, 11, 30, tzinfo=timezone.utc))
    e2 = FloodEvent(event_type="cyclone", description="2023 Michaung", rainfall_mm=450.0, source="test", started_at=datetime(2023, 12, 3, tzinfo=timezone.utc))
    p = Place(name="API Test Place", ward="101", geom=WKTElement("POINT(80.21 13.08)", srid=4326))
    db.add_all([e1, e2, p])
    db.flush()

    obs = FloodObservation(event_id=e1.id, place_id=p.id, ward="101", depth_cm=40.0, source="test", geom=WKTElement("POINT(80.21 13.08)", srid=4326))
    db.add(obs)
    db.commit()

    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    try:
        # GET /api/v1/events
        resp = client.get("/api/v1/events")
        assert resp.status_code == 200
        events_list = resp.json()
        assert len(events_list) >= 2

        # GET /api/v1/events/{id}
        resp = client.get(f"/api/v1/events/{e1.id}")
        assert resp.status_code == 200
        detail = resp.json()
        assert detail["description"] == "2015 Flood"
        assert len(detail["observations"]) >= 1

        # GET /api/v1/flood-observations
        resp = client.get(f"/api/v1/flood-observations?event_id={e1.id}")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1
    finally:
        app.dependency_overrides.clear()


def test_phase2_drainage_and_terrain_api(db):
    v = DrainageNetworkVersion(version="TEST_DRAIN_V1", survey_year=2023, is_event_aligned=True)
    db.add(v)
    p = Place(name="Drain Test Place", ward="102", geom=WKTElement("POINT(80.22 13.04)", srid=4326))
    db.add(p)
    db.flush()

    cap = ContributingAreaProxy(
        place_id=p.id,
        method="DEM_HAND_DRAINAGE_TOPOLOGY",
        method_version="v2",
        area_km2=1.2,
        is_true_catchment=False,
    )
    db.add(cap)
    db.commit()

    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    try:
        # GET /api/v1/drainage/versions
        resp = client.get("/api/v1/drainage/versions")
        assert resp.status_code == 200
        versions = resp.json()
        assert any(ver["version"] == "TEST_DRAIN_V1" for ver in versions)

        # GET /api/v1/terrain/contributing-area
        resp = client.get(f"/api/v1/terrain/contributing-area?place_id={p.id}")
        assert resp.status_code == 200
        proxies = resp.json()
        assert len(proxies) >= 1
        assert proxies[0]["is_true_catchment"] is False
    finally:
        app.dependency_overrides.clear()


def test_phase2_investigation_validation_endpoint(db):
    p1 = Place(name="Val Endp A", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    p2 = Place(name="Val Endp B", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    db.add_all([p1, p2])
    db.flush()

    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)

    try:
        # Create comparison
        comp_resp = client.post(f"/api/v1/investigations/comparisons?place_a_id={p1.id}&place_b_id={p2.id}")
        assert comp_resp.status_code == 200
        comp_id = comp_resp.json()["id"]

        # Check explanations endpoint
        exp_resp = client.get(f"/api/v1/investigations/comparisons/{comp_id}/explanations")
        assert exp_resp.status_code == 200
        exps = exp_resp.json()
        assert len(exps) == 6

        # Create investigation
        inv_resp = client.post(f"/api/v1/investigations?comparison_id={comp_id}")
        assert inv_resp.status_code == 200
        inv_id = inv_resp.json()["id"]

        # Check validation endpoint (multi-event)
        val_resp = client.get(f"/api/v1/investigations/{inv_id}/validation")
        assert val_resp.status_code == 200
        val_data = val_resp.json()
        assert "result" in val_data
        assert val_data["result"] in ("STRONG_SUPPORT", "MODERATE_SUPPORT", "WEAK_SUPPORT", "MIXED", "INSUFFICIENT_DATA")

        # Check mechanisms endpoint
        mech_resp = client.get(f"/api/v1/investigations/{inv_id}/mechanisms")
        assert mech_resp.status_code == 200
        assert len(mech_resp.json()) >= 1
    finally:
        app.dependency_overrides.clear()
