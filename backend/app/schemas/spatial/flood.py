from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class FloodEventResponse(BaseModel):
    id: UUID
    event_type: str
    started_at: datetime | None
    ended_at: datetime | None
    description: str | None
    rainfall_mm: float | None
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FloodObservationResponse(BaseModel):
    id: UUID
    event_id: UUID
    place_id: UUID | None
    ward: str | None
    observed_at: datetime | None
    severity: str | None
    depth_cm: float | None
    notes: str | None
    source: str
    longitude: float | None = None
    latitude: float | None = None

    model_config = {"from_attributes": True}


class RainfallObservationResponse(BaseModel):
    id: UUID
    place_id: UUID | None
    ward: str | None
    observed_at: datetime
    rainfall_mm: float
    duration_hours: float | None
    source: str

    model_config = {"from_attributes": True}


class FloodEventDetailResponse(FloodEventResponse):
    observations: list[FloodObservationResponse] = []
