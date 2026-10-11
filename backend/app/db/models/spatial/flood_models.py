import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

EVENT_TYPES = ("monsoon", "cyclone", "extreme_rainfall", "localised_rain", "unknown")


class FloodEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "flood_events"

    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    description: Mapped[str | None] = mapped_column(Text)
    rainfall_mm: Mapped[float | None] = mapped_column()
    source: Mapped[str] = mapped_column(String(300), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "event_type IN ('monsoon', 'cyclone', 'extreme_rainfall', 'localised_rain', 'unknown')",
            name="ck_flood_events_type",
        ),
        CheckConstraint("rainfall_mm IS NULL OR rainfall_mm >= 0", name="ck_flood_events_rainfall"),
        CheckConstraint(
            "started_at IS NULL OR ended_at IS NULL OR ended_at >= started_at",
            name="ck_flood_events_timestamps",
        ),
    )

    observations: Mapped[list["FloodObservation"]] = relationship(back_populates="event")


class FloodObservation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "flood_observations"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("flood_events.id", ondelete="RESTRICT"), nullable=False
    )
    place_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    ward: Mapped[str | None] = mapped_column(String(100), index=True)
    observed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    severity: Mapped[str | None] = mapped_column(String(50))
    depth_cm: Mapped[float | None] = mapped_column()
    notes: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(300), nullable=False)
    geom: Mapped[str | None] = mapped_column(Geometry("POINT", srid=4326))

    __table_args__ = (
        CheckConstraint("depth_cm IS NULL OR depth_cm >= 0", name="ck_flood_observations_depth"),
    )

    event: Mapped[FloodEvent] = relationship(back_populates="observations")


class RainfallObservation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "rainfall_observations"

    place_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    ward: Mapped[str | None] = mapped_column(String(100), index=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    rainfall_mm: Mapped[float] = mapped_column(Float, nullable=False)
    duration_hours: Mapped[float | None] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(300), nullable=False)
    geom: Mapped[str | None] = mapped_column(Geometry("POINT", srid=4326))

    __table_args__ = (
        CheckConstraint("rainfall_mm >= 0", name="ck_rainfall_observations_value"),
        CheckConstraint(
            "duration_hours IS NULL OR duration_hours > 0", name="ck_rainfall_observations_duration"
        ),
        UniqueConstraint(
            "place_id", "observed_at", "source", name="uq_rainfall_observations_place_time_source"
        ),
    )
