"""API router for drainage infrastructure and network versions."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.models.drainage_models import DrainNode, DrainSegment, Outfall
from app.db.models.phase2_models import DrainageNetworkVersion
from app.repositories.drainage import drain_stats
from app.schemas.phase2 import (
    DrainageNetworkVersionResponse,
    DrainageSegmentResponse,
    DrainageStatsResponse,
    OutfallResponse,
)

router = APIRouter()


@router.get("/versions", response_model=list[DrainageNetworkVersionResponse])
def list_drainage_versions(db: Session = Depends(get_db)) -> list[DrainageNetworkVersionResponse]:
    versions = list(db.scalars(select(DrainageNetworkVersion).order_by(DrainageNetworkVersion.survey_year.asc())).all())
    return [DrainageNetworkVersionResponse.model_validate(v) for v in versions]


@router.get("/segments", response_model=list[DrainageSegmentResponse])
def list_drainage_segments(
    ward: str | None = Query(None, description="Filter by ward number"),
    provenance: str | None = Query(None, description="Filter by geometry provenance (DIRECT, INFERRED)"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db),
) -> list[DrainageSegmentResponse]:
    stmt = select(DrainSegment)
    if ward:
        stmt = stmt.where(DrainSegment.ward == ward)
    if provenance:
        stmt = stmt.where(DrainSegment.geometry_provenance == provenance)

    segments = list(db.scalars(stmt.offset(offset).limit(limit)).all())
    return [DrainageSegmentResponse.model_validate(s) for s in segments]


@router.get("/outfalls", response_model=list[OutfallResponse])
def list_outfalls(
    ward: str | None = Query(None, description="Filter by ward number"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db),
) -> list[OutfallResponse]:
    stmt = select(Outfall)
    if ward:
        stmt = stmt.where(Outfall.ward == ward)

    outfalls = list(db.scalars(stmt.offset(offset).limit(limit)).all())
    return [OutfallResponse.model_validate(o) for o in outfalls]


@router.get("/stats", response_model=DrainageStatsResponse)
def get_drainage_statistics(
    ward: str = Query(..., description="Ward number"),
    db: Session = Depends(get_db),
) -> DrainageStatsResponse:
    stats = drain_stats(db, ward)
    return DrainageStatsResponse(
        ward=ward,
        segment_count=stats["segment_count"],
        total_length_m=stats["total_length_m"],
        inferred_count=stats["inferred_count"],
    )
