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

TRUST_LEVELS = ("official", "research", "community", "derived")


class DataSource(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "data_sources"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    trust_level: Mapped[str] = mapped_column(String(20), nullable=False)
    license: Mapped[str | None] = mapped_column(String(500))
    attribution: Mapped[str | None] = mapped_column(Text)
    url: Mapped[str | None] = mapped_column(String(1000))
    version: Mapped[str | None] = mapped_column(String(100))

    __table_args__ = (
        CheckConstraint(
            "trust_level IN ('official', 'research', 'community', 'derived')",
            name="ck_data_sources_trust_level",
        ),
    )

    files: Mapped[list["SourceFile"]] = relationship(back_populates="source")


class SourceFile(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "source_files"

    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="RESTRICT"), nullable=False
    )
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column()
    format: Mapped[str | None] = mapped_column(String(50))
    record_count: Mapped[int | None] = mapped_column()
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    validation_status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    validation_report: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        UniqueConstraint("sha256", name="uq_source_files_sha256"),
        CheckConstraint(
            "validation_status IN ('pending', 'valid', 'quarantined', 'invalid')",
            name="ck_source_files_validation_status",
        ),
    )

    source: Mapped[DataSource] = relationship(back_populates="files")
