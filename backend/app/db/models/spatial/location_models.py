import uuid

from geoalchemy2 import Geometry
from sqlalchemy import String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


class Place(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "places"

    name: Mapped[str] = mapped_column(String(300), nullable=False)
    ward: Mapped[str | None] = mapped_column(String(100))
    zone: Mapped[str | None] = mapped_column(String(100))
    place_type: Mapped[str] = mapped_column(String(50), nullable=False, default="point")
    description: Mapped[str | None] = mapped_column(Text)
    geom: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)

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

    __table_args__ = (
        UniqueConstraint("name", "ward", name="uq_places_name_ward"),
    )


class LocationFeature(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "location_features"

    place_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float | None] = mapped_column()
    unit: Mapped[str | None] = mapped_column(String(50))
    source: Mapped[str] = mapped_column(String(300), nullable=False)
    computation_version: Mapped[str] = mapped_column(String(50), nullable=False)
    is_inferred: Mapped[bool] = mapped_column(nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint(
            "place_id", "feature_name", "computation_version",
            name="uq_location_features_place_feature_version",
        ),
    )


class TerrainFeature(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "terrain_features"

    place_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    mean_elevation: Mapped[float | None] = mapped_column()
    min_elevation: Mapped[float | None] = mapped_column()
    max_elevation: Mapped[float | None] = mapped_column()
    mean_slope: Mapped[float | None] = mapped_column()
    hand: Mapped[float | None] = mapped_column()
    relative_elevation: Mapped[float | None] = mapped_column()
    source: Mapped[str] = mapped_column(String(300), nullable=False)
    computation_version: Mapped[str] = mapped_column(String(50), nullable=False)

    __table_args__ = (
        UniqueConstraint("place_id", "computation_version", name="uq_terrain_features_place_version"),
    )


class LandcoverFeature(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "landcover_features"

    place_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    builtup_fraction: Mapped[float | None] = mapped_column()
    vegetation_fraction: Mapped[float | None] = mapped_column()
    water_fraction: Mapped[float | None] = mapped_column()
    source: Mapped[str] = mapped_column(String(300), nullable=False)
    computation_version: Mapped[str] = mapped_column(String(50), nullable=False)

    __table_args__ = (
        UniqueConstraint("place_id", "computation_version", name="uq_landcover_features_place_version"),
    )
