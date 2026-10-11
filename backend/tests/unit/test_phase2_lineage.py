"""Unit tests for Phase 2 data lineage and provenance tracking."""

from uuid import uuid4

from app.db.models.source_models import DataSource
from app.services.ingestion.lineage import (
    get_feature_lineage,
    record_feature_derivation,
    register_dataset_version,
)


def test_dataset_version_registration(db):
    src = DataSource(name="Lineage Test Source", trust_level="official")
    db.add(src)
    db.flush()

    ver = register_dataset_version(
        db=db,
        source_name="Lineage Test Source",
        version="v2023.1",
        description="Test version registration",
        file_count=2,
        record_count=100,
    )

    assert ver.version == "v2023.1"
    assert ver.status == "active"


def test_feature_derivation_tracking(db):
    from geoalchemy2.elements import WKTElement
    from app.db.models.location_models import Place
    p = Place(name="Lineage Place", ward="101", geom=WKTElement("POINT(80.21 13.08)", srid=4326))
    db.add(p)
    db.flush()
    place_id = p.id
    deriv = record_feature_derivation(
        db=db,
        feature_type="terrain_analysis",
        output_feature_name="depression_depth_m",
        output_value=1.85,
        computation_method="dem_hand_subtraction",
        computation_version="v2",
        input_source_files=["dem_raw.tif", "hand_raw.tif"],
        place_id=place_id,
        output_unit="m",
        uncertainty=0.15,
        parameters={"kernel_size": 3},
    )

    assert deriv.output_feature_name == "depression_depth_m"
    assert deriv.output_value == 1.85
    assert deriv.uncertainty == 0.15

    lineage = get_feature_lineage(db, "depression_depth_m", place_id)
    assert len(lineage) == 1
    assert lineage[0]["computation_method"] == "dem_hand_subtraction"
