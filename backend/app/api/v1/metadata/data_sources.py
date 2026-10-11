"""API router for data sources, dataset versions, and provenance lineage."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.models.phase2_models import DatasetVersion, FeatureDerivation
from app.db.models.source_models import DataSource, SourceFile
from app.schemas.phase2 import (
    DataSourceResponse,
    DatasetVersionResponse,
    FeatureDerivationResponse,
    SourceFileResponse,
)
from app.services.ingestion.lineage import get_feature_lineage

router = APIRouter()


@router.get("", response_model=list[DataSourceResponse])
@router.get("/", response_model=list[DataSourceResponse])
def list_data_sources(db: Session = Depends(get_db)) -> list[DataSourceResponse]:
    sources = list(db.scalars(select(DataSource).order_by(DataSource.name.asc())).all())
    if not sources:
        return []

    source_ids = [s.id for s in sources]
    all_files = list(db.scalars(select(SourceFile).where(SourceFile.source_id.in_(source_ids))).all())
    all_versions = list(db.scalars(select(DatasetVersion).where(DatasetVersion.source_id.in_(source_ids))).all())

    files_by_source: dict[UUID, list[SourceFileResponse]] = {sid: [] for sid in source_ids}
    for f in all_files:
        files_by_source[f.source_id].append(SourceFileResponse.model_validate(f))

    versions_by_source: dict[UUID, list[DatasetVersionResponse]] = {sid: [] for sid in source_ids}
    for v in all_versions:
        versions_by_source[v.source_id].append(DatasetVersionResponse.model_validate(v))

    results = []
    for s in sources:
        resp = DataSourceResponse(
            id=s.id,
            name=s.name,
            trust_level=s.trust_level,
            license=s.license,
            attribution=s.attribution,
            url=s.url,
            description=s.description,
            version=s.version,
            files=files_by_source.get(s.id, []),
            versions=versions_by_source.get(s.id, []),
        )
        results.append(resp)
    return results


@router.get("/lineage", response_model=list[FeatureDerivationResponse])
def get_feature_derivations(
    feature_type: str | None = Query(None, description="Filter by feature type"),
    place_id: UUID | None = Query(None, description="Filter by place ID"),
    event_id: UUID | None = Query(None, description="Filter by event ID"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db),
) -> list[FeatureDerivationResponse]:
    stmt = select(FeatureDerivation)
    if feature_type:
        stmt = stmt.where(FeatureDerivation.feature_type == feature_type)
    if place_id:
        stmt = stmt.where(FeatureDerivation.place_id == place_id)
    if event_id:
        stmt = stmt.where(FeatureDerivation.event_id == event_id)

    derivations = list(db.scalars(stmt.order_by(FeatureDerivation.created_at.desc()).offset(offset).limit(limit)).all())
    return [FeatureDerivationResponse.model_validate(d) for d in derivations]
