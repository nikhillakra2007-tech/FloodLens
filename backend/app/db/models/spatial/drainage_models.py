import uuid

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, CheckConstraint, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class DrainNode(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "drain_nodes"

    node_type: Mapped[str] = mapped_column(String(50), nullable=False)
    label: Mapped[str | None] = mapped_column(String(300))
    ward: Mapped[str | None] = mapped_column(String(100), index=True)
    zone: Mapped[str | None] = mapped_column(String(100))
    is_inferred: Mapped[bool] = mapped_column(nullable=False, default=False)
    condition_status: Mapped[str | None] = mapped_column(String(100))
    geom: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    geometry_provenance: Mapped[str | None] = mapped_column(String(50))
    network_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("drainage_network_versions.id", ondelete="SET NULL")
    )

    __table_args__ = (
        CheckConstraint(
            "node_type IN ('junction', 'outfall', 'inlet', 'storage')",
            name="ck_drain_nodes_type",
        ),
    )

    segments_start: Mapped[list["DrainSegment"]] = relationship(
        foreign_keys="DrainSegment.start_node_id", back_populates="start_node"
    )
    segments_end: Mapped[list["DrainSegment"]] = relationship(
        foreign_keys="DrainSegment.end_node_id", back_populates="end_node"
    )
    network_version: Mapped["DrainageNetworkVersion"] = relationship()


class DrainSegment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "drain_segments"

    start_node_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("drain_nodes.id", ondelete="RESTRICT"), nullable=False
    )
    end_node_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("drain_nodes.id", ondelete="RESTRICT"), nullable=False
    )
    drain_type: Mapped[str] = mapped_column(String(50), nullable=False)
    ward: Mapped[str | None] = mapped_column(String(100), index=True)
    zone: Mapped[str | None] = mapped_column(String(100))
    street_name: Mapped[str | None] = mapped_column(String(300))
    material: Mapped[str | None] = mapped_column(String(100))
    is_open: Mapped[bool | None] = mapped_column()
    is_inferred: Mapped[bool] = mapped_column(nullable=False, default=False)
    depth_m: Mapped[float | None] = mapped_column()
    width_m: Mapped[float | None] = mapped_column()
    length_m: Mapped[float | None] = mapped_column()
    condition_status: Mapped[str | None] = mapped_column(String(100))
    source_file_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("source_files.id", ondelete="SET NULL")
    )
    geom: Mapped[str] = mapped_column(Geometry("LINESTRING", srid=4326), nullable=False)
    geometry_provenance: Mapped[str | None] = mapped_column(String(50))
    network_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("drainage_network_versions.id", ondelete="SET NULL")
    )

    __table_args__ = (
        CheckConstraint(
            "drain_type IN ('SWD', 'side_drain', 'open_drain', 'macro', 'micro', 'other')",
            name="ck_drain_segments_type",
        ),
        CheckConstraint("depth_m IS NULL OR depth_m >= 0", name="ck_drain_segments_depth"),
        CheckConstraint("width_m IS NULL OR width_m >= 0", name="ck_drain_segments_width"),
        CheckConstraint("length_m IS NULL OR length_m >= 0", name="ck_drain_segments_length"),
    )

    start_node: Mapped[DrainNode] = relationship(
        foreign_keys=[start_node_id], back_populates="segments_start"
    )
    end_node: Mapped[DrainNode] = relationship(
        foreign_keys=[end_node_id], back_populates="segments_end"
    )
    network_version: Mapped["DrainageNetworkVersion"] = relationship()


class Outfall(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "outfalls"

    name: Mapped[str] = mapped_column(String(300), nullable=False)
    waterbody: Mapped[str | None] = mapped_column(String(300))
    ward: Mapped[str | None] = mapped_column(String(100), index=True)
    is_inferred: Mapped[bool] = mapped_column(nullable=False, default=False)
    geom: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    geometry_provenance: Mapped[str | None] = mapped_column(String(50))
    network_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("drainage_network_versions.id", ondelete="SET NULL")
    )

    network_version: Mapped["DrainageNetworkVersion"] = relationship()

    @property
    def longitude(self) -> float:
        from geoalchemy2.shape import to_shape
        try:
            return to_shape(self.geom).x
        except Exception:
            return 0.0

    @property
    def latitude(self) -> float:
        from geoalchemy2.shape import to_shape
        try:
            return to_shape(self.geom).y
        except Exception:
            return 0.0
