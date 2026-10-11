"""Integration test: full investigation flow from comparison to agent output."""

import pytest
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal, get_db
from app.db.models.location_models import Place
from app.db.models.flood_models import FloodEvent, RainfallObservation, FloodObservation
from app.db.models.location_models import TerrainFeature, LandcoverFeature
from geoalchemy2.elements import WKTElement


def _seed_test_data(db):
    """Seed minimal test data within the test transaction."""
    p1 = Place(
        name="Integration Test Place A",
        ward="test_a",
        zone="test",
        geom=WKTElement("POINT(80.21 13.08)", srid=4326),
    )
    p2 = Place(
        name="Integration Test Place B",
        ward="test_b",
        zone="test",
        geom=WKTElement("POINT(80.22 13.04)", srid=4326),
    )
    db.add_all([p1, p2])
    db.flush()
    
    # Add terrain features
    db.add_all([
        TerrainFeature(place_id=p1.id, mean_elevation=6.0, hand=2.0, relative_elevation=-1.0, source="test", computation_version="v1"),
        TerrainFeature(place_id=p2.id, mean_elevation=8.0, hand=4.0, relative_elevation=1.0, source="test", computation_version="v1"),
    ])
    
    # Add landcover features
    db.add_all([
        LandcoverFeature(place_id=p1.id, builtup_fraction=0.78, vegetation_fraction=0.12, water_fraction=0.03, source="test", computation_version="v1"),
        LandcoverFeature(place_id=p2.id, builtup_fraction=0.65, vegetation_fraction=0.22, water_fraction=0.05, source="test", computation_version="v1"),
    ])
    
    db.commit()
    return p1, p2


def _override_get_db(db):
    """Override get_db to use the test session."""
    def _get_db():
        try:
            yield db
        finally:
            pass
    return _get_db


def test_full_investigation_flow(db):
    place_a, place_b = _seed_test_data(db)
    
    # Override the database dependency to use the test session
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)
    
    try:
        resp = client.post(
            f"/api/v1/investigations/comparisons?place_a_id={place_a.id}&place_b_id={place_b.id}"
        )
        assert resp.status_code == 200
        comp_data = resp.json()
        assert "id" in comp_data

        resp = client.post(f"/api/v1/investigations?comparison_id={comp_data['id']}")
        assert resp.status_code == 200
        inv_data = resp.json()
        assert inv_data["status"] in ("completed", "failed")
        assert inv_data["agent_mode"] == "local"

        inv_id = inv_data["id"]

        resp = client.get(f"/api/v1/investigations/{inv_id}")
        assert resp.status_code == 200
        detail = resp.json()
        assert "mechanisms" in detail
        assert "evidence" in detail

        resp = client.get(f"/api/v1/investigations/{inv_id}/evidence")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

        resp = client.get(f"/api/v1/investigations/{inv_id}/graph")
        assert resp.status_code == 200
        graph = resp.json()
        assert "nodes" in graph
        assert "edges" in graph

        resp = client.get(f"/api/v1/investigations/{inv_id}/history")
        assert resp.status_code == 200
        history = resp.json()
        assert "result" in history
    finally:
        app.dependency_overrides.clear()


def test_counterfactual_endpoint(db):
    place_a, place_b = _seed_test_data(db)
    
    # Override the database dependency to use the test session
    app.dependency_overrides[get_db] = _override_get_db(db)
    client = TestClient(app)
    
    try:
        resp = client.post(
            f"/api/v1/investigations/comparisons?place_a_id={place_a.id}&place_b_id={place_b.id}"
        )
        assert resp.status_code == 200
        comp_data = resp.json()

        resp = client.post(f"/api/v1/investigations?comparison_id={comp_data['id']}")
        assert resp.status_code == 200
        inv_data = resp.json()
        inv_id = inv_data["id"]

        cf_resp = client.post(
            f"/api/v1/investigations/{inv_id}/counterfactual",
            json={
                "scenario_name": "reduce_runoff_test",
                "runoff_coefficient": 0.7,
                "contributing_area_km2": 5.0,
                "effective_capacity": 100.0,
                "rainfall_mm": 100.0,
                "upstream_impervious_fraction": 0.6,
                "drainage_path_km": 2.0,
            },
        )
        assert cf_resp.status_code == 200
        cf_data = cf_resp.json()
        assert "baseline_output" in cf_data
        assert "counterfactual_output" in cf_data
        assert "disclaimer" in cf_data
        assert "proxy" in cf_data["disclaimer"].lower()
    finally:
        app.dependency_overrides.clear()
