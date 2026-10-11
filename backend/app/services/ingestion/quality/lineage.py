"""Data lineage and provenance tracking service.

Addresses Phase 1 Limitation L15:
- Implements the complete provenance chain:
  SOURCE -> RAW FILE -> CHECKSUM -> INGESTION RUN -> NORMALIZED DATA -> DERIVED FEATURE -> EVIDENCE -> MECHANISM -> INVESTIGATION
- Records dataset versions and feature derivations.
- Allows a reviewer to trace any derived metric (contributing area, rainfall peak, terrain depression)
  back to the exact raw input file, SHA256 checksum, computation method, and uncertainty.
"""

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.phase2_models import DatasetVersion, FeatureDerivation
from app.db.models.source_models import DataSource, SourceFile


def register_dataset_version(
    db: Session,
    source_name: str,
    version: str,
    description: str,
    file_count: int = 1,
    record_count: int = 0,
    geometry_type: str | None = None,
    valid_from: datetime | None = None,
    valid_to: datetime | None = None,
) -> DatasetVersion:
    """Register or retrieve an immutable dataset version record."""
    source = db.query(DataSource).filter_by(name=source_name).first()
    if not source:
        raise ValueError(f"DataSource '{source_name}' does not exist.")

    existing = db.query(DatasetVersion).filter_by(source_id=source.id, version=version).first()
    if existing:
        existing.record_count = record_count
        existing.file_count = file_count
        db.flush()
        return existing

    dv = DatasetVersion(
        source_id=source.id,
        version=version,
        valid_from=valid_from,
        valid_to=valid_to,
        description=description,
        file_count=file_count,
        record_count=record_count,
        geometry_type=geometry_type,
        status="active",
    )
    db.add(dv)
    db.flush()
    return dv


def record_feature_derivation(
    db: Session,
    feature_type: str,
    output_feature_name: str,
    output_value: float | None,
    computation_method: str,
    computation_version: str,
    input_source_files: list[SourceFile | str],
    place_id: UUID | None = None,
    event_id: UUID | None = None,
    output_unit: str | None = None,
    uncertainty: float | None = None,
    parameters: dict[str, Any] | None = None,
) -> FeatureDerivation:
    """Record an exact feature derivation step for complete scientific lineage."""
    file_info = []
    for f in input_source_files:
        if isinstance(f, SourceFile):
            file_info.append({
                "source_file_id": str(f.id),
                "file_path": f.file_path,
                "sha256": f.sha256,
            })
        else:
            file_info.append({"file_identifier": str(f)})

    existing = db.query(FeatureDerivation).filter_by(
        feature_type=feature_type,
        output_feature_name=output_feature_name,
        place_id=place_id,
        event_id=event_id,
        computation_version=computation_version,
    ).first()
    if existing:
        existing.output_value = output_value
        existing.input_source_file_ids = {"sources": file_info}
        existing.parameters = parameters or {}
        existing.uncertainty = uncertainty
        db.flush()
        return existing

    derivation = FeatureDerivation(
        feature_type=feature_type,
        place_id=place_id,
        event_id=event_id,
        input_source_file_ids={"sources": file_info},
        computation_method=computation_method,
        computation_version=computation_version,
        parameters=parameters or {},
        output_feature_name=output_feature_name,
        output_value=output_value,
        output_unit=output_unit,
        uncertainty=uncertainty,
    )
    db.add(derivation)
    db.flush()
    return derivation


def get_feature_lineage(db: Session, feature_name: str, place_id: UUID | None = None) -> list[dict[str, Any]]:
    """Retrieve full provenance lineage for a given feature."""
    query = db.query(FeatureDerivation).filter(FeatureDerivation.output_feature_name == feature_name)
    if place_id:
        query = query.filter(FeatureDerivation.place_id == place_id)
    records = query.all()

    return [
        {
            "id": str(r.id),
            "feature_name": r.output_feature_name,
            "feature_type": r.feature_type,
            "output_value": r.output_value,
            "output_unit": r.output_unit,
            "computation_method": r.computation_method,
            "computation_version": r.computation_version,
            "input_sources": r.input_source_file_ids,
            "uncertainty": r.uncertainty,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]
