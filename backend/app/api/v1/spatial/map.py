from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.drainage import segments_near
from app.repositories.floods import observations_near
from app.schemas.location import (
    MapDrainSegmentResponse,
    MapDrainsResponse,
    MapFloodObservationItem,
    MapFloodObservationsResponse,
    MapTerrainResponse,
)

router = APIRouter()


@router.get("/drains", response_model=MapDrainsResponse)
def get_drains(
    lon: float = Query(..., ge=-180, le=180, description="Longitude in WGS84"),
    lat: float = Query(..., ge=-90, le=90, description="Latitude in WGS84"),
    radius_m: float = Query(2000, gt=0, le=50000, description="Search radius in meters"),
    db: Session = Depends(get_db),
) -> MapDrainsResponse:
    segments = segments_near(db, lon, lat, radius_m)
    return MapDrainsResponse(
        drains=[
            MapDrainSegmentResponse(
                id=str(s.id),
                drain_type=s.drain_type,
                ward=s.ward,
                street_name=s.street_name,
                is_inferred=s.is_inferred,
                length_m=s.length_m,
            )
            for s in segments
        ]
    )


@router.get("/flood-observations", response_model=MapFloodObservationsResponse)
def get_flood_obs(
    lon: float = Query(..., ge=-180, le=180, description="Longitude in WGS84"),
    lat: float = Query(..., ge=-90, le=90, description="Latitude in WGS84"),
    radius_m: float = Query(3000, gt=0, le=50000, description="Search radius in meters"),
    db: Session = Depends(get_db),
) -> MapFloodObservationsResponse:
    obs = observations_near(db, lon, lat, radius_m)
    return MapFloodObservationsResponse(
        observations=[
            MapFloodObservationItem(
                id=str(o.id),
                event_id=str(o.event_id),
                severity=o.severity,
                depth_cm=o.depth_cm,
                ward=o.ward,
            )
            for o in obs
        ]
    )


@router.get("/terrain", response_model=MapTerrainResponse)
def get_terrain(
    lon: float = Query(..., ge=-180, le=180, description="Longitude in WGS84"),
    lat: float = Query(..., ge=-90, le=90, description="Latitude in WGS84"),
    db: Session = Depends(get_db),
) -> MapTerrainResponse:
    return MapTerrainResponse(
        elevation_m=None,
        slope_degrees=None,
        source="Copernicus DEM GLO-30",
        note="Terrain raster lookup requires DEM tile ingestion or local synthetic proxy",
    )
