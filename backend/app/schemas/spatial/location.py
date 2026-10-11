from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class PlaceBase(BaseModel):
    name: str
    ward: str | None = None
    zone: str | None = None
    place_type: str = "point"
    description: str | None = None
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)


class PlaceCreate(PlaceBase):
    pass


class PlaceResponse(PlaceBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class LocationFeatureResponse(BaseModel):
    id: UUID
    place_id: UUID
    feature_name: str
    value: float | None = None
    unit: str | None = None
    source: str
    computation_version: str
    is_inferred: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TerrainFeatureResponse(BaseModel):
    id: UUID
    place_id: UUID
    mean_elevation: float | None = None
    min_elevation: float | None = None
    max_elevation: float | None = None
    mean_slope: float | None = None
    hand: float | None = None
    relative_elevation: float | None = None
    # Explicit physical unit fields
    elevation_mean_m: float | None = None
    elevation_min_m: float | None = None
    elevation_max_m: float | None = None
    mean_slope_degrees: float | None = None
    hand_m: float | None = None
    relative_elevation_m: float | None = None
    source: str
    computation_version: str
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def sync_unit_fields(self) -> "TerrainFeatureResponse":
        if self.elevation_mean_m is None and self.mean_elevation is not None:
            self.elevation_mean_m = self.mean_elevation
        if self.elevation_min_m is None and self.min_elevation is not None:
            self.elevation_min_m = self.min_elevation
        if self.elevation_max_m is None and self.max_elevation is not None:
            self.elevation_max_m = self.max_elevation
        if self.mean_slope_degrees is None and self.mean_slope is not None:
            self.mean_slope_degrees = self.mean_slope
        if self.hand_m is None and self.hand is not None:
            self.hand_m = self.hand
        if self.relative_elevation_m is None and self.relative_elevation is not None:
            self.relative_elevation_m = self.relative_elevation
        return self


class LandcoverFeatureResponse(BaseModel):
    id: UUID
    place_id: UUID
    builtup_fraction: float | None = None
    vegetation_fraction: float | None = None
    water_fraction: float | None = None
    source: str
    computation_version: str
    created_at: datetime

    model_config = {"from_attributes": True}


class LocationFeaturesBundle(BaseModel):
    place_id: UUID
    terrain: TerrainFeatureResponse | None = None
    landcover: LandcoverFeatureResponse | None = None
    location_features: list[LocationFeatureResponse] = []


class CandidatePlaceResponse(BaseModel):
    place_id: str
    name: str
    similarity_score: float
    feature_similarities: dict[str, float] = Field(default_factory=dict)


class ComparablesResponse(BaseModel):
    candidates: list[CandidatePlaceResponse] = Field(default_factory=list)


class LocationCompareResponse(BaseModel):
    place_a_id: UUID
    place_b_id: UUID
    similarity_score: float
    feature_similarities: dict[str, float] = Field(default_factory=dict)
    reasons: list[str] = Field(default_factory=list)


class ComputedFeaturesResponse(BaseModel):
    place_id: str
    features: dict[str, Any] = Field(default_factory=dict)


class MapDrainSegmentResponse(BaseModel):
    id: str
    drain_type: str
    ward: str | None = None
    street_name: str | None = None
    is_inferred: bool
    length_m: float | None = None


class MapDrainsResponse(BaseModel):
    drains: list[MapDrainSegmentResponse] = Field(default_factory=list)


class MapFloodObservationItem(BaseModel):
    id: str
    event_id: str
    severity: str | None = None
    depth_cm: float | None = None
    ward: str | None = None


class MapFloodObservationsResponse(BaseModel):
    observations: list[MapFloodObservationItem] = Field(default_factory=list)


class MapTerrainResponse(BaseModel):
    elevation_m: float | None = None
    slope_degrees: float | None = None
    source: str
    note: str
