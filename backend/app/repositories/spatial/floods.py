from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.flood_models import FloodEvent, FloodObservation, RainfallObservation


def list_events(db: Session) -> list[FloodEvent]:
    return list(db.scalars(select(FloodEvent).order_by(FloodEvent.started_at.desc())).all())


def get_event(db: Session, event_id: UUID) -> FloodEvent | None:
    return db.scalar(select(FloodEvent).where(FloodEvent.id == event_id))


def list_observations(db: Session, event_id: UUID | None = None) -> list[FloodObservation]:
    stmt = select(FloodObservation)
    if event_id:
        stmt = stmt.where(FloodObservation.event_id == event_id)
    return list(db.scalars(stmt.order_by(FloodObservation.observed_at.desc())).all())


def observations_near(db: Session, lon: float, lat: float, radius_m: float = 3000) -> list[FloodObservation]:
    from sqlalchemy import func

    point = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)
    point_geo = func.ST_Transform(point, 3857)
    return list(
        db.scalars(
            select(FloodObservation).where(
                FloodObservation.geom.is_not(None),
                func.ST_DWithin(
                    func.ST_Transform(FloodObservation.geom, 3857), point_geo, radius_m
                ),
            )
        ).all()
    )


def rainfall_for_place(db: Session, place_id: UUID) -> list[RainfallObservation]:
    return list(
        db.scalars(
            select(RainfallObservation)
            .where(RainfallObservation.place_id == place_id)
            .order_by(RainfallObservation.observed_at.desc())
        ).all()
    )
