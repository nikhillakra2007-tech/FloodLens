"""Adversarial and guardrail tests for Phase 2 scientific integrity."""

import pytest
from uuid import uuid4

from app.db.models.phase2_models import ContributingAreaProxy, ValidationRun
from app.services.geospatial.catchment import classify_catchment_boundary
from app.services.validation.historical import validate_historical_pattern


def test_catchment_guardrail_never_renames_proxy_as_true():
    """Ensure that derived proxies are never claimed as true catchments."""
    classification = classify_catchment_boundary(is_true_catchment=False, method="dem_hand_drainage_topology")
    assert classification.is_true_catchment is False
    assert classification.classification_type != "true_catchment"
    assert "Not a calibrated hydrological watershed boundary" in classification.limitations[0]


def test_unobserved_event_is_not_fabricated_as_negative():
    """Missing observations must yield INSUFFICIENT_DATA or UNKNOWN, never fabricated negative proof."""
    res = validate_historical_pattern(
        investigation_id=uuid4(),
        events=[],
        proposed_mechanism="DRAINAGE_CAPACITY",
    )
    assert res.result == "INSUFFICIENT_DATA"
    assert res.confidence == 0.0


def test_validation_run_db_check_constraint_rejects_invalid_result(db):
    """Ensure database rejects invalid validation run outcomes."""
    with pytest.raises(Exception):
        bad_run = ValidationRun(
            investigation_id=uuid4(),
            result="PROVED_BEYOND_DOUBT",  # Invalid!
            method_version="v2",
        )
        db.add(bad_run)
        db.commit()
    db.rollback()


def test_contributing_area_proxy_db_rejects_empty_method(db):
    """Ensure database constraints enforce method and place references."""
    with pytest.raises(Exception):
        bad_proxy = ContributingAreaProxy(
            place_id=None,  # Not null!
            method="TEST",
            method_version="v2",
        )
        db.add(bad_proxy)
        db.commit()
    db.rollback()
