"""Unit tests for Phase 2 multi-event historical validation."""

from datetime import datetime, timezone
from uuid import uuid4

from geoalchemy2.elements import WKTElement

from app.db.models.flood_models import FloodEvent, FloodObservation
from app.db.models.location_models import Place
from app.services.validation.multi_event import validate_multi_event


def test_multi_event_validation_insufficient_evidence():
    inv_id = uuid4()
    p1_id = uuid4()
    p2_id = uuid4()

    # When proposed mechanism is INSUFFICIENT_EVIDENCE
    res = validate_multi_event(
        db=None,  # Not hit when mechanism is INSUFFICIENT_EVIDENCE
        investigation_id=inv_id,
        place_a_id=p1_id,
        place_b_id=p2_id,
        proposed_mechanism="INSUFFICIENT_EVIDENCE",
    )
    assert res.result == "INSUFFICIENT_DATA"
    assert res.confidence == 0.1


def test_multi_event_validation_with_recurring_events(db):
    p1 = Place(name="Val Place A", ward="101", geom=WKTElement("POINT(80.210 13.085)", srid=4326))
    p2 = Place(name="Val Place B", ward="102", geom=WKTElement("POINT(80.220 13.045)", srid=4326))
    db.add_all([p1, p2])
    db.flush()

    e2015 = FloodEvent(event_type="extreme_rainfall", started_at=datetime(2015, 11, 30, tzinfo=timezone.utc), source="test")
    e2021 = FloodEvent(event_type="monsoon", started_at=datetime(2021, 11, 6, tzinfo=timezone.utc), source="test")
    e2023 = FloodEvent(event_type="cyclone", started_at=datetime(2023, 12, 3, tzinfo=timezone.utc), source="test")
    db.add_all([e2015, e2021, e2023])
    db.flush()

    # Place A flooded in all 3 events; Place B only flooded in 2015
    db.add_all([
        FloodObservation(event_id=e2015.id, place_id=p1.id, depth_cm=45.0, source="test"),
        FloodObservation(event_id=e2015.id, place_id=p2.id, depth_cm=10.0, source="test"),
        FloodObservation(event_id=e2021.id, place_id=p1.id, depth_cm=35.0, source="test"),
        FloodObservation(event_id=e2021.id, place_id=p2.id, depth_cm=5.0, source="test"),
        FloodObservation(event_id=e2023.id, place_id=p1.id, depth_cm=42.0, source="test"),
        FloodObservation(event_id=e2023.id, place_id=p2.id, depth_cm=8.0, source="test"),
    ])
    db.flush()

    res = validate_multi_event(
        db=db,
        investigation_id=uuid4(),
        place_a_id=p1.id,
        place_b_id=p2.id,
        proposed_mechanism="TERRAIN_DEPRESSION",
    )

    assert res.event_count == 3
    assert res.supporting_event_count >= 2
    assert res.result in ("STRONG_SUPPORT", "MODERATE_SUPPORT")
    assert res.confidence >= 0.6
