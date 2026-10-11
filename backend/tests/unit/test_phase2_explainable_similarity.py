"""Unit tests for explainable similarity calculation and decomposition."""

from geoalchemy2.elements import WKTElement

from app.db.models.location_models import LandcoverFeature, Place, TerrainFeature
from app.services.comparison.explainable import CATEGORY_WEIGHTS, compute_explainable_similarity


def test_category_weights_sum_to_one():
    total_weight = sum(CATEGORY_WEIGHTS.values())
    assert abs(total_weight - 1.0) < 1e-6


def test_explainable_similarity_components(db):
    p1 = Place(name="Expl Place A", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    p2 = Place(name="Expl Place B", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    db.add_all([p1, p2])
    db.flush()

    db.add_all([
        TerrainFeature(place_id=p1.id, mean_elevation=6.0, hand=1.5, relative_elevation=-1.0, source="dem", computation_version="v1"),
        TerrainFeature(place_id=p2.id, mean_elevation=7.0, hand=2.0, relative_elevation=-0.5, source="dem", computation_version="v1"),
        LandcoverFeature(place_id=p1.id, builtup_fraction=0.8, vegetation_fraction=0.1, water_fraction=0.02, source="lc", computation_version="v1"),
        LandcoverFeature(place_id=p2.id, builtup_fraction=0.75, vegetation_fraction=0.15, water_fraction=0.03, source="lc", computation_version="v1"),
    ])
    db.flush()

    score, explanations, reasons = compute_explainable_similarity(
        db=db,
        place_a=p1,
        place_b=p2,
        rainfall_a_mm=450.0,
        rainfall_b_mm=420.0,
    )

    assert 0.0 <= score <= 1.0
    assert len(explanations) == 6
    categories = {e.feature_category for e in explanations}
    assert "spatial_proximity" in categories
    assert "rainfall_similarity" in categories
    assert "terrain_similarity" in categories
    assert "drainage_similarity" in categories
    assert "landcover_similarity" in categories
    assert "event_similarity" in categories

    # Contributions sum correctly
    expected_sum = sum(e.weighted_contribution for e in explanations)
    assert abs(score - expected_sum) < 0.01
