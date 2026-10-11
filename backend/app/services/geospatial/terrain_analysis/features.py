from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models.location_models import LandcoverFeature, LocationFeature, TerrainFeature
from app.repositories.drainage import drain_stats, outfalls_near
from app.repositories.locations import get_landcover, get_terrain
from app.services.geospatial.drainage import drain_density, effective_capacity


def compute_all_features(db: Session, place_id: UUID, source: str = "demo_seed") -> dict:
    settings = get_settings()
    version = settings.feature_version

    from shapely import wkb

    place = db.scalar(__import__("app.db.models.location_models", fromlist=["Place"]).Place.__table__.select()) if False else None
    from app.db.models.location_models import Place
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        return {}

    lon, lat = 0.0, 0.0
    try:
        pt = wkb.loads(bytes(place.geom.data))
        lon, lat = pt.x, pt.y
    except Exception:
        pass

    terrain = get_terrain(db, place_id)
    landcover = get_landcover(db, place_id)
    dstats = drain_stats(db, place.ward)
    outfalls = outfalls_near(db, lon, lat, 5000)
    nearest_outfall_m = None
    if outfalls:
        from app.services.geospatial.geometry import point_distance_m
        nearest_outfall_m = min(
            point_distance_m((lon, lat), _outfall_coords(o)) for o in outfalls
        )

    area_km2 = 10.0
    dd = drain_density(dstats.__dict__ if hasattr(dstats, "__dict__") else type("obj", (), dstats), area_km2)

    loc_features = [
        LocationFeature(
            place_id=place_id,
            feature_name="drain_density",
            value=dd,
            unit="km/km2",
            source=source,
            computation_version=version,
            is_inferred=dstats.get("inferred_count", 0) > 0,
        ),
        LocationFeature(
            place_id=place_id,
            feature_name="nearest_outfall_distance",
            value=nearest_outfall_m,
            unit="m",
            source=source,
            computation_version=version,
            is_inferred=len(outfalls) > 0 and all(o.is_inferred for o in outfalls),
        ),
        LocationFeature(
            place_id=place_id,
            feature_name="upstream_drainage_length",
            value=dstats.get("total_length_m", 0.0),
            unit="m",
            source=source,
            computation_version=version,
            is_inferred=dstats.get("inferred_count", 0) > 0,
        ),
    ]
    db.add_all(loc_features)
    db.commit()

    return {
        "place_id": place_id,
        "version": version,
        "terrain": terrain,
        "landcover": landcover,
        "location_features": loc_features,
        "drainage_stats": dstats,
    }


def _outfall_coords(outfall):
    from shapely import wkb
    try:
        pt = wkb.loads(bytes(outfall.geom.data))
        return (pt.x, pt.y)
    except Exception:
        return (0.0, 0.0)

