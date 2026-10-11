from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from app.db.models.evidence_models import EvidenceItem

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

INVESTIGATION_STATUSES = ("queued", "running", "completed", "failed")
MECHANISMS = (
    "RUNOFF_CONCENTRATION",
    "DRAINAGE_CAPACITY",
    "DRAINAGE_CONNECTIVITY",
    "TERRAIN_DEPRESSION",
    "OUTFALL_RESTRICTION",
    "WATERBODY_INTERACTION",
    "IMPERVIOUS_SURFACE",
    "INSUFFICIENT_EVIDENCE",
)


class Comparison(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "comparisons"

    place_a_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    place_b_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    weights_version: Mapped[str] = mapped_column(String(50), nullable=False)
    feature_similarities: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    reasons: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)

    __table_args__ = (
        CheckConstraint(
            "place_a_id <> place_b_id", name="ck_comparisons_distinct_places"
        ),
        CheckConstraint(
            "similarity_score >= 0 AND similarity_score <= 1", name="ck_comparisons_score"
        ),
        UniqueConstraint("place_a_id", "place_b_id", name="uq_comparisons_pair"),
    )


class Mechanism(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mechanisms"

    comparison_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("comparisons.id", ondelete="RESTRICT"), nullable=False
    )
    mechanism_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    rank: Mapped[int | None] = mapped_column()
    explanation: Mapped[str | None] = mapped_column(Text)
    signal_values: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    __table_args__ = (
        CheckConstraint(
            "mechanism_type IN ('RUNOFF_CONCENTRATION', 'DRAINAGE_CAPACITY', "
            "'DRAINAGE_CONNECTIVITY', 'TERRAIN_DEPRESSION', 'OUTFALL_RESTRICTION', "
            "'WATERBODY_INTERACTION', 'IMPERVIOUS_SURFACE', 'INSUFFICIENT_EVIDENCE')",
            name="ck_mechanisms_type",
        ),
        CheckConstraint("score >= 0 AND score <= 1", name="ck_mechanisms_score"),
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_mechanisms_confidence"),
    )

    comparison: Mapped[Comparison] = relationship()


class Investigation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "investigations"

    comparison_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("comparisons.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued")
    agent_mode: Mapped[str] = mapped_column(String(50), nullable=False, default="local")
    summary: Mapped[str | None] = mapped_column(Text)
    strongest_mechanism: Mapped[str | None] = mapped_column(String(50))
    agent_response: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    error_message: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed')",
            name="ck_investigations_status",
        ),
    )

    comparison: Mapped[Comparison] = relationship()
    evidence_items: Mapped[list["EvidenceItem"]] = relationship(back_populates="investigation")
    counterfactual_runs: Mapped[list["CounterfactualRun"]] = relationship(
        back_populates="investigation"
    )


class CounterfactualRun(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "counterfactual_runs"

    investigation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="RESTRICT"), nullable=False
    )
    scenario_name: Mapped[str] = mapped_column(String(200), nullable=False)
    parameters: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    baseline_output: Mapped[float] = mapped_column(Float, nullable=False)
    counterfactual_output: Mapped[float] = mapped_column(Float, nullable=False)
    delta: Mapped[float] = mapped_column(Float, nullable=False)
    percent_change: Mapped[float | None] = mapped_column(Float)
    disclaimer: Mapped[str] = mapped_column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "investigation_id", "scenario_name", name="uq_counterfactual_runs_investigation_scenario"
        ),
    )

    investigation: Mapped[Investigation] = relationship(back_populates="counterfactual_runs")


class AuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    actor_type: Mapped[str] = mapped_column(String(20), nullable=False)
    actor_id: Mapped[str | None] = mapped_column(String(200))
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str | None] = mapped_column(String(100))
    entity_id: Mapped[str | None] = mapped_column(String(100))
    investigation_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    __table_args__ = (
        CheckConstraint(
            "actor_type IN ('user', 'agent', 'system')", name="ck_audit_logs_actor_type"
        ),
    )
