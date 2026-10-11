from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_places_endpoint():
    response = client.get("/api/v1/locations/places")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_place_not_found():
    response = client.get("/api/v1/locations/places/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_flood_events_endpoint():
    response = client.get("/api/v1/locations/flood-events")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_map_drains_endpoint_requires_params():
    """Test that /map/drains returns 422 when required params are missing."""
    response = client.get("/api/v1/map/drains")
    assert response.status_code == 422


def test_map_drains_endpoint_with_valid_params():
    """Test /map/drains with valid query parameters matching frontend usage."""
    # Chennai center coordinates (lon, lat)
    response = client.get("/api/v1/map/drains?lon=80.2707&lat=13.0827&radius_m=2000")
    assert response.status_code == 200
    data = response.json()
    assert "drains" in data
    assert isinstance(data["drains"], list)


def test_map_flood_observations_endpoint_with_valid_params():
    """Test /map/flood-observations with valid query parameters matching frontend usage."""
    response = client.get("/api/v1/map/flood-observations?lon=80.2707&lat=13.0827&radius_m=3000")
    assert response.status_code == 200
    data = response.json()
    assert "observations" in data
    assert isinstance(data["observations"], list)
