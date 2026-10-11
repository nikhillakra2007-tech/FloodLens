import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class FloodEventV2(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "flood_events_v2"

    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    description: Mapped[str | None] = mapped_column(Text)
    rainfall_mm: Mapped[float | None] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(300), nullable=False)
    event_name: Mapped[str | None] = mapped_column(String(300))
    geographic_extent: Mapped[str | None] = mapped_column(String(500))
    affected_wards: Mapped[dict | None] = mapped_column(JSONB)
    damage_estimate_inr: Mapped[float | None] = mapped_column(Float)
    data_quality: Mapped[str | None] = mapped_column(String(50))

    __table_args__ = (
        CheckConstraint(
            "event_type IN ('monsoon', 'cyclone', 'extreme_rainfall', 'localised_rain', 'unknown')",
            name="ck_flood_events_v2_type",
        ),
        CheckConstraint("rainfall_mm IS NULL OR rainfall_mm >= 0", name="ck_flood_events_v2_rainfall"),
        CheckConstraint(
            "started_at IS NULL OR ended_at IS NULL OR ended_at >= started_at",
            name="ck_flood_events_v2_timestamps",
        ),
    )


class DatasetVersion(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "dataset_versions"

    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="RESTRICT"), nullable=False
    )
    version: Mapped[str] = mapped_column(String(100), nullable=False)
    valid_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    valid_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    description: Mapped[str | None] = mapped_column(Text)
    file_count: Mapped[int | None] = mapped_column()
    record_count: Mapped[int | None] = mapped_column()
    geometry_type: Mapped[str | None] = mapped_column(String(50))
    coverage_bbox: Mapped[dict | None] = mapped_column(JSONB)
    ingestion_run_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'superseded', 'deprecated')",
            name="ck_dataset_versions_status",
        ),
        UniqueConstraint("source_id", "version", name="uq_dataset_versions_source_version"),
    )

    source: Mapped["DataSource"] = relationship()


class FeatureDerivation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "feature_derivations"

    feature_type: Mapped[str] = mapped_column(String(100), nullable=False)
    place_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="SET NULL"), index=True
    )
    event_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("flood_events.id", ondelete="SET NULL"), index=True
    )
    input_source_file_ids: Mapped[dict] = mapped_column(JSONB, nullable=False)
    computation_method: Mapped[str] = mapped_column(String(200), nullable=False)
    computation_version: Mapped[str] = mapped_column(String(50), nullable=False)
    parameters: Mapped[dict | None] = mapped_column(JSONB)
    output_feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    output_value: Mapped[float | None] = mapped_column(Float)
    output_unit: Mapped[str | None] = mapped_column(String(50))
    spatial_extent: Mapped[dict | None] = mapped_column(JSONB)
    temporal_extent: Mapped[dict | None] = mapped_column(JSONB)
    uncertainty: Mapped[float | None] = mapped_column(Float)

    place: Mapped["Place"] = relationship()
    event: Mapped["FloodEvent"] = relationship()


class RainfallEventFeature(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "rainfall_event_features"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("flood_events.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    place_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="SET NULL"), index=True
    )
    station_id: Mapped[str | None] = mapped_column(String(100))
    source: Mapped[str] = mapped_column(String(300), nullable=False)
    spatial_method: Mapped[str | None] = mapped_column(String(100))
    rainfall_window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    rainfall_window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cumulative_rainfall_mm: Mapped[float | None] = mapped_column(Float)
    peak_interval_rainfall_mm: Mapped[float | None] = mapped_column(Float)
    peak_interval_hours: Mapped[float | None] = mapped_column(Float)
    mean_intensity_mm_per_hr: Mapped[float | None] = mapped_column(Float)
    max_intensity_mm_per_hr: Mapped[float | None] = mapped_column(Float)
    duration_hours: Mapped[float | None] = mapped_column(Float)
    antecedent_rainfall_24h_mm: Mapped[float | None] = mapped_column(Float)
    antecedent_rainfall_72h_mm: Mapped[float | None] = mapped_column(Float)
    station_distance_m: Mapped[float | None] = mapped_column(Float)
    interpolation_uncertainty: Mapped[float | None] = mapped_column(Float)
    confidence_level: Mapped[str] = mapped_column(String(20), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "confidence_level IN ('HIGH', 'MODERATE', 'LOW', 'UNKNOWN')",
            name="ck_rainfall_event_features_confidence",
        ),
    )

    event: Mapped["FloodEvent"] = relationship()
    place: Mapped["Place"] = relationship()


class ContributingAreaProxy(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "contributing_area_proxies"

    place_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    method: Mapped[str] = mapped_column(String(100), nullable=False)
    method_version: Mapped[str] = mapped_column(String(50), nullable=False)
    analysis_radius_m: Mapped[float | None] = mapped_column(Float)
    area_km2: Mapped[float | None] = mapped_column(Float)
    drainage_path_length_m: Mapped[float | None] = mapped_column(Float)
    outfall_count: Mapped[int | None] = mapped_column()
    upstream_drain_length_m: Mapped[float | None] = mapped_column(Float)
    upstream_builtup_fraction: Mapped[float | None] = mapped_column(Float)
    upstream_impervious_proxy: Mapped[float | None] = mapped_column(Float)
    flow_direction_proxy: Mapped[dict | None] = mapped_column(JSONB)
    depression_volume_m3: Mapped[float | None] = mapped_column(Float)
    uncertainty: Mapped[float | None] = mapped_column(Float)
    is_true_catchment: Mapped[bool] = mapped_column(nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint("place_id", "method", "method_version", name="uq_contributing_area_proxies_place_method_version"),
    )

    place: Mapped["Place"] = relationship()


class DrainageNetworkVersion(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "drainage_network_versions"

    version: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    survey_year: Mapped[int | None] = mapped_column()
    survey_source: Mapped[str | None] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text)
    segment_count: Mapped[int | None] = mapped_column()
    node_count: Mapped[int | None] = mapped_column()
    outfall_count: Mapped[int | None] = mapped_column()
    total_length_m: Mapped[float | None] = mapped_column(Float)
    wards_covered: Mapped[dict | None] = mapped_column(JSONB)
    geometry_provenance: Mapped[dict | None] = mapped_column(JSONB)
    is_event_aligned: Mapped[bool] = mapped_column(nullable=False, default=False)
    aligned_event_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("flood_events.id", ondelete="SET NULL")
    )

    __table_args__ = (
        UniqueConstraint("version", name="uq_drainage_network_versions_version"),
    )

    aligned_event: Mapped["FloodEvent"] = relationship()


class ComparisonExplanation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "comparison_explanations"

    comparison_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("comparisons.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    feature_category: Mapped[str] = mapped_column(String(50), nullable=False)
    value_a: Mapped[float | None] = mapped_column(Float)
    value_b: Mapped[float | None] = mapped_column(Float)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    weighted_contribution: Mapped[float] = mapped_column(Float, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text)
    data_quality: Mapped[str | None] = mapped_column(String(20))

    __table_args__ = (
        CheckConstraint("similarity_score >= 0 AND similarity_score <= 1", name="ck_comparison_explanations_similarity"),
        CheckConstraint("weighted_contribution >= 0 AND weighted_contribution <= 1", name="ck_comparison_explanations_weighted"),
    )

    comparison: Mapped["Comparison"] = relationship()


class ValidationRun(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "validation_runs"

    investigation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    proposed_mechanism: Mapped[str | None] = mapped_column(String(50))
    event_count: Mapped[int] = mapped_column(default=0)
    supporting_event_count: Mapped[int] = mapped_column(default=0)
    contradicting_event_count: Mapped[int] = mapped_column(default=0)
    inconclusive_event_count: Mapped[int] = mapped_column(default=0)
    result: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float)
    recurring_mechanisms: Mapped[dict | None] = mapped_column(JSONB)
    explanation: Mapped[str | None] = mapped_column(Text)
    method_version: Mapped[str] = mapped_column(String(50), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "result IN ('STRONG_SUPPORT', 'MODERATE_SUPPORT', 'WEAK_SUPPORT', 'MIXED', 'INSUFFICIENT_DATA')",
            name="ck_validation_runs_result",
        ),
    )

    investigation: Mapped["Investigation"] = relationship()