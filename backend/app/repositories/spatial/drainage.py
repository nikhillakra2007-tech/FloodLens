from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models.drainage_models import DrainNode, DrainSegment, Outfall


def segments_near(db: Session, lon: float, lat: float, radius_m: float = 2000) -> list[DrainSegment]:
    point = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)
    point_geo = func.ST_Transform(point, 3857)
    return list(
        db.scalars(
            select(DrainSegment).where(
                func.ST_DWithin(
                    func.ST_Transform(DrainSegment.geom, 3857), point_geo, radius_m
                )
            )
        ).all()
    )


def outfalls_near(db: Session, lon: float, lat: float, radius_m: float = 5000) -> list[Outfall]:
    point = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)
    point_geo = func.ST_Transform(point, 3857)
    return list(
        db.scalars(
            select(Outfall).where(
                func.ST_DWithin(func.ST_Transform(Outfall.geom, 3857), point_geo, radius_m)
            )
        ).all()
    )


def drain_stats(db: Session, ward: str | None = None) -> dict:
    stmt = select(func.count(DrainSegment.id), func.coalesce(func.sum(DrainSegment.length_m), 0.0))
    if ward:
        stmt = stmt.where(DrainSegment.ward == ward)
    count, total_length = db.execute(stmt).one()
    inferred_stmt = select(func.count(DrainSegment.id)).where(DrainSegment.is_inferred == True)
    if ward:
        inferred_stmt = inferred_stmt.where(DrainSegment.ward == ward)
    inferred_count = db.execute(inferred_stmt).scalar_one()
    return {
        "segment_count": count,
        "total_length_m": float(total_length),
        "inferred_count": inferred_count,
    }
