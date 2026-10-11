"""API router for rainfall observations and event-level features."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.models.flood_models import RainfallObservation
from app.db.models.phase2_models import RainfallEventFeature
from app.schemas.flood import RainfallObservationResponse
from app.schemas.phase2 import RainfallComparabilityResponse, RainfallEventFeatureResponse
from app.services.geospatial.rainfall import assess_rainfall_comparability

router = APIRouter()


@router.get("/observations", response_model=list[RainfallObservationResponse])
def list_rainfall_observations(
    place_id: UUID | None = Query(None, description="Filter by place ID"),
    ward: str | None = Query(None, description="Filter by ward number"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db),
) -> list[RainfallObservationResponse]:
    stmt = select(RainfallObservation)
    if place_id:
        stmt = stmt.where(RainfallObservation.place_id == place_id)
    if ward:
        stmt = stmt.where(RainfallObservation.ward == ward)

    observations = list(db.scalars(stmt.order_by(RainfallObservation.observed_at.desc()).offset(offset).limit(limit)).all())
    return [RainfallObservationResponse.model_validate(o) for o in observations]


@router.get("/event-features", response_model=list[RainfallEventFeatureResponse])
def list_rainfall_event_features(
    event_id: UUID | None = Query(None, description="Filter by flood event ID"),
    place_id: UUID | None = Query(None, description="Filter by place ID"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db),
) -> list[RainfallEventFeatureResponse]:
    stmt = select(RainfallEventFeature)
    if event_id:
        stmt = stmt.where(RainfallEventFeature.event_id == event_id)
    if place_id:
        stmt = stmt.where(RainfallEventFeature.place_id == place_id)

    features = list(db.scalars(stmt.order_by(RainfallEventFeature.rainfall_window_start.desc()).offset(offset).limit(limit)).all())
    return [RainfallEventFeatureResponse.model_validate(f) for f in features]


@router.get("/compare", response_model=RainfallComparabilityResponse)
def compare_event_rainfall(
    event_id: UUID = Query(..., description="Flood event ID"),
    place_a_id: UUID = Query(..., description="Place A ID"),
    place_b_id: UUID = Query(..., description="Place B ID"),
    db: Session = Depends(get_db),
) -> RainfallComparabilityResponse:
    feat_a = db.query(RainfallEventFeature).filter_by(event_id=event_id, place_id=place_a_id).first()
    feat_b = db.query(RainfallEventFeature).filter_by(event_id=event_id, place_id=place_b_id).first()

    result = assess_rainfall_comparability(feat_a, feat_b)
    return RainfallComparabilityResponse(
        status=result.status,
        confidence=result.confidence,
        difference_mm=result.difference_mm,
        relative_difference_pct=result.relative_difference_pct,
        explanation=result.explanation,
        feature_a=result.feature_a,
        feature_b=result.feature_b,
    )
