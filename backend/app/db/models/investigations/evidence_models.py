import uuid

from sqlalchemy import CheckConstraint, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

CERTAINTY_LEVELS = ("FACT", "SUPPORTED", "HYPOTHESIS", "UNKNOWN")


class EvidenceItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "evidence_items"

    investigation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="RESTRICT"), nullable=False
    )
    mechanism_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    certainty_level: Mapped[str] = mapped_column(String(20), nullable=False)
    claim: Mapped[str] = mapped_column(Text, nullable=False)
    value: Mapped[float | None] = mapped_column(Float)
    unit: Mapped[str | None] = mapped_column(String(50))
    source: Mapped[str] = mapped_column(String(300), nullable=False)
    spatial_ref: Mapped[str | None] = mapped_column(String(500))
    temporal_ref: Mapped[str | None] = mapped_column(String(500))
    support_score: Mapped[float] = mapped_column(Float, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text)
    extra_data: Mapped[dict | None] = mapped_column("metadata", JSONB)

    __table_args__ = (
        CheckConstraint(
            "certainty_level IN ('FACT', 'SUPPORTED', 'HYPOTHESIS', 'UNKNOWN')",
            name="ck_evidence_items_certainty",
        ),
        CheckConstraint(
            "support_score >= 0 AND support_score <= 1", name="ck_evidence_items_support"
        ),
    )

    investigation: Mapped["Investigation"] = relationship(back_populates="evidence_items")

