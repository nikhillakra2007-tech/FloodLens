from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.location_models import LandcoverFeature, Place, TerrainFeature


def get_place(db: Session, place_id: UUID) -> Place | None:
    return db.scalar(select(Place).where(Place.id == place_id))


def list_places(db: Session) -> list[Place]:
    return list(db.scalars(select(Place)).all())


def get_terrain(db: Session, place_id: UUID) -> TerrainFeature | None:
    return db.scalar(
        select(TerrainFeature)
        .where(TerrainFeature.place_id == place_id)
        .order_by(TerrainFeature.computation_version.desc())
    )


def get_landcover(db: Session, place_id: UUID) -> LandcoverFeature | None:
    return db.scalar(
        select(LandcoverFeature)
        .where(LandcoverFeature.place_id == place_id)
        .order_by(LandcoverFeature.computation_version.desc())
    )
