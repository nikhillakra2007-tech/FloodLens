"""API router for flood observations."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.models.flood_models import FloodObservation
from app.schemas.flood import FloodObservationResponse

router = APIRouter()


@router.get("", response_model=list[FloodObservationResponse])
@router.get("/", response_model=list[FloodObservationResponse])
def list_flood_observations(
    event_id: UUID | None = Query(None, description="Filter by flood event ID"),
    place_id: UUID | None = Query(None, description="Filter by place ID"),
    ward: str | None = Query(None, description="Filter by ward number"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db),
) -> list[FloodObservationResponse]:
    stmt = select(FloodObservation)
    if event_id:
        stmt = stmt.where(FloodObservation.event_id == event_id)
    if place_id:
        stmt = stmt.where(FloodObservation.place_id == place_id)
    if ward:
        stmt = stmt.where(FloodObservation.ward == ward)

    observations = list(db.scalars(stmt.order_by(FloodObservation.observed_at.desc()).offset(offset).limit(limit)).all())
    results = []
    for o in observations:
        resp = FloodObservationResponse.model_validate(o)
        if o.geom:
            from geoalchemy2.shape import to_shape
            pt = to_shape(o.geom)
            resp.longitude = pt.x
            resp.latitude = pt.y
        results.append(resp)
    return results
