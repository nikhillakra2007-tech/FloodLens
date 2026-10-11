from fastapi import APIRouter

from app.api.v1 import (
    counterfactuals,
    data_sources,
    drainage,
    events,
    flood_observations,
    investigations,
    locations,
    map,
    rainfall,
    terrain,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(investigations.router, prefix="/investigations", tags=["investigations"])
api_router.include_router(counterfactuals.router, prefix="/investigations", tags=["counterfactuals"])
api_router.include_router(map.router, prefix="/map", tags=["map"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(flood_observations.router, prefix="/flood-observations", tags=["flood-observations"])
api_router.include_router(rainfall.router, prefix="/rainfall", tags=["rainfall"])
api_router.include_router(drainage.router, prefix="/drainage", tags=["drainage"])
api_router.include_router(terrain.router, prefix="/terrain", tags=["terrain"])
api_router.include_router(data_sources.router, prefix="/data-sources", tags=["data-sources"])
