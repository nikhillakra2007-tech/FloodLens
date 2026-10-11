from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.floods import list_events, list_observations, rainfall_for_place
from app.repositories.locations import get_landcover, get_place, get_terrain, list_places
from app.schemas.flood import FloodEventResponse, FloodObservationResponse, RainfallObservationResponse
from app.schemas.location import (
    CandidatePlaceResponse,
    ComparablesResponse,
    ComputedFeaturesResponse,
    LandcoverFeatureResponse,
    LocationCompareResponse,
    LocationFeaturesBundle,
    PlaceResponse,
    TerrainFeatureResponse,
)
from app.services.comparison.comparator import compare_locations
from app.services.comparison.candidates import find_candidates
from app.services.comparison.similarity import FeatureVector, DEFAULT_WEIGHTS
from app.services.geospatial.features import compute_all_features

router = APIRouter()


@router.get("/places")
def get_places(db: Session = Depends(get_db)) -> list[PlaceResponse]:
    return list_places(db)


@router.get("/places/{place_id}", response_model=PlaceResponse)
def get_place_by_id(place_id: UUID, db: Session = Depends(get_db)) -> PlaceResponse:
    place = get_place(db, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place


@router.get("/places/{place_id}/features", response_model=LocationFeaturesBundle)
def get_features(place_id: UUID, db: Session = Depends(get_db)) -> LocationFeaturesBundle:
    place = get_place(db, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    terrain = get_terrain(db, place_id)
    landcover = get_landcover(db, place_id)
    return LocationFeaturesBundle(
        place_id=place_id,
        terrain=TerrainFeatureResponse.model_validate(terrain) if terrain else None,
        landcover=LandcoverFeatureResponse.model_validate(landcover) if landcover else None,
        location_features=[],
    )


@router.post("/places/{place_id}/compute-features", response_model=ComputedFeaturesResponse)
def compute_features(place_id: UUID, db: Session = Depends(get_db)) -> ComputedFeaturesResponse:
    place = get_place(db, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    feats = compute_all_features(db, place_id)
    return ComputedFeaturesResponse(place_id=str(place_id), features=feats)


@router.get("/places/{place_id}/comparables", response_model=ComparablesResponse)
def get_comparables(place_id: UUID, top_k: int = 5, db: Session = Depends(get_db)) -> ComparablesResponse:
    place = get_place(db, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    from app.services.comparison.comparator import build_feature_vector
    target_vec = build_feature_vector(db, place)
    all_places = list_places(db)
    all_vectors = {p.id: build_feature_vector(db, p) for p in all_places if p.id != place_id}
    candidates = find_candidates(db, place, target_vec, all_vectors, top_k, DEFAULT_WEIGHTS)
    place_map = {p.id: p for p in all_places}
    return ComparablesResponse(
        candidates=[
            CandidatePlaceResponse(
                place_id=str(pid),
                name=place_map[pid].name if pid in place_map else "Unknown",
                similarity_score=score,
                feature_similarities=feats,
            )
            for pid, score, feats in candidates
        ]
    )


@router.post("/compare", response_model=LocationCompareResponse)
def compare(place_a_id: UUID, place_b_id: UUID, db: Session = Depends(get_db)) -> LocationCompareResponse:
    place_a = get_place(db, place_a_id)
    place_b = get_place(db, place_b_id)
    if not place_a or not place_b:
        raise HTTPException(status_code=404, detail="Place not found")
    result = compare_locations(db, place_a, place_b)
    return LocationCompareResponse(
        place_a_id=result.place_a_id,
        place_b_id=result.place_b_id,
        similarity_score=result.similarity_score,
        feature_similarities=result.feature_similarities,
        reasons=result.reasons,
    )


@router.get("/flood-events", response_model=list[FloodEventResponse])
def get_flood_events(db: Session = Depends(get_db)) -> list[FloodEventResponse]:
    return list_events(db)


@router.get("/flood-events/{event_id}", response_model=FloodEventResponse)
def get_flood_event(event_id: UUID, db: Session = Depends(get_db)) -> FloodEventResponse:
    from app.repositories.floods import get_event
    event = get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Flood event not found")
    return event


@router.get("/flood-observations", response_model=list[FloodObservationResponse])
def get_flood_observations(event_id: UUID | None = None, db: Session = Depends(get_db)) -> list[FloodObservationResponse]:
    return list_observations(db, event_id)


@router.get("/rainfall/{place_id}", response_model=list[RainfallObservationResponse])
def get_rainfall(place_id: UUID, db: Session = Depends(get_db)) -> list[RainfallObservationResponse]:
    return rainfall_for_place(db, place_id)
