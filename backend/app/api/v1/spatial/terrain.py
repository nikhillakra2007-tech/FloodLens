"""API router for terrain features and contributing area proxies."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.models.location_models import TerrainFeature
from app.db.models.phase2_models import ContributingAreaProxy
from app.schemas.location import TerrainFeatureResponse
from app.schemas.phase2 import ContributingAreaProxyResponse

router = APIRouter()


@router.get("/features", response_model=list[TerrainFeatureResponse])
def list_terrain_features(
    place_id: UUID | None = Query(None, description="Filter by place ID"),
    db: Session = Depends(get_db),
) -> list[TerrainFeatureResponse]:
    stmt = select(TerrainFeature)
    if place_id:
        stmt = stmt.where(TerrainFeature.place_id == place_id)
    features = list(db.scalars(stmt).all())
    return [TerrainFeatureResponse.model_validate(f) for f in features]


@router.get("/contributing-area", response_model=list[ContributingAreaProxyResponse])
def list_contributing_area_proxies(
    place_id: UUID | None = Query(None, description="Filter by place ID"),
    db: Session = Depends(get_db),
) -> list[ContributingAreaProxyResponse]:
    stmt = select(ContributingAreaProxy)
    if place_id:
        stmt = stmt.where(ContributingAreaProxy.place_id == place_id)
    proxies = list(db.scalars(stmt).all())
    return [ContributingAreaProxyResponse.model_validate(p) for p in proxies]
