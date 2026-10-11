"""API router for flood events."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.models.flood_models import FloodEvent, FloodObservation
from app.schemas.flood import FloodEventDetailResponse, FloodEventResponse, FloodObservationResponse

router = APIRouter()


@router.get("", response_model=list[FloodEventResponse])
@router.get("/", response_model=list[FloodEventResponse])
def list_flood_events(db: Session = Depends(get_db)) -> list[FloodEventResponse]:
    events = list(db.scalars(select(FloodEvent).order_by(FloodEvent.started_at.desc())).all())
    return [FloodEventResponse.model_validate(e) for e in events]


@router.get("/{event_id}", response_model=FloodEventDetailResponse)
def get_flood_event_detail(event_id: UUID, db: Session = Depends(get_db)) -> FloodEventDetailResponse:
    event = db.get(FloodEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Flood event not found")

    obs = list(db.scalars(
        select(FloodObservation).where(FloodObservation.event_id == event_id).order_by(FloodObservation.observed_at.desc())
    ).all())

    obs_responses = []
    for o in obs:
        resp = FloodObservationResponse.model_validate(o)
        if o.geom:
            from geoalchemy2.shape import to_shape
            pt = to_shape(o.geom)
            resp.longitude = pt.x
            resp.latitude = pt.y
        obs_responses.append(resp)

    event_resp = FloodEventResponse.model_validate(event)
    return FloodEventDetailResponse(
        **event_resp.model_dump(),
        observations=obs_responses,
    )
