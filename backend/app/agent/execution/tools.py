from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.locations import get_landcover, get_place, get_terrain
from app.repositories.floods import list_events, observations_near
from app.repositories.investigations import get_comparison, get_evidence, get_mechanisms
from app.repositories.drainage import drain_stats
from app.services.comparison.comparator import build_feature_vector


def find_comparable_locations(db: Session, place_id: UUID, top_k: int = 5) -> dict[str, Any]:
    from app.db.models.location_models import Place
    target = get_place(db, place_id)
    if not target:
        return {"error": "Place not found", "candidates": []}
    all_places = db.query(Place).filter(Place.id != place_id).all()
    target_vec = build_feature_vector(db, target)
    candidates = []
    from app.services.comparison.similarity import weighted_similarity
    for p in all_places:
        vec = build_feature_vector(db, p)
        score, feats = weighted_similarity(target_vec, vec)
        candidates.append({
            "place_id": str(p.id),
            "name": p.name,
            "ward": p.ward,
            "similarity_score": score,
            "feature_similarities": feats,
        })
    candidates.sort(key=lambda c: c["similarity_score"], reverse=True)
    return {"candidates": candidates[:top_k]}


def get_location_features_tool(db: Session, place_id: UUID) -> dict[str, Any]:
    place = get_place(db, place_id)
    if not place:
        return {"error": "Place not found"}
    terrain = get_terrain(db, place_id)
    landcover = get_landcover(db, place_id)
    dstats = drain_stats(db, place.ward)
    return {
        "place_id": str(place_id),
        "name": place.name,
        "ward": place.ward,
        "terrain": {
            "mean_elevation": terrain.mean_elevation if terrain else None,
            "hand": terrain.hand if terrain else None,
            "relative_elevation": terrain.relative_elevation if terrain else None,
        },
        "landcover": {
            "builtup_fraction": landcover.builtup_fraction if landcover else None,
            "vegetation_fraction": landcover.vegetation_fraction if landcover else None,
            "water_fraction": landcover.water_fraction if landcover else None,
        },
        "drainage": dstats,
    }


def compare_locations_tool(db: Session, place_a_id: UUID, place_b_id: UUID) -> dict[str, Any]:
    place_a = get_place(db, place_a_id)
    place_b = get_place(db, place_b_id)
    if not place_a or not place_b:
        return {"error": "Place not found"}
    vec_a = build_feature_vector(db, place_a)
    vec_b = build_feature_vector(db, place_b)
    from app.services.comparison.similarity import per_feature_similarity, weighted_similarity
    score, feats = weighted_similarity(vec_a, vec_b)
    diffs = {}
    for key in vec_a.__dataclass_fields__ if hasattr(vec_a, "__dataclass_fields__") else {}:
        va = getattr(vec_a, key, None)
        vb = getattr(vec_b, key, None)
        if va is not None and vb is not None:
            diffs[key] = va - vb
    return {
        "place_a": place_a.name,
        "place_b": place_b.name,
        "similarity_score": score,
        "feature_similarities": feats,
        "differences": diffs,
    }


def get_historical_events_tool(db: Session, place_id: UUID) -> dict[str, Any]:
    place = get_place(db, place_id)
    if not place:
        return {"error": "Place not found", "events": []}
    from shapely import wkb
    lon, lat = 0.0, 0.0
    try:
        pt = wkb.loads(bytes(place.geom.data))
        lon, lat = pt.x, pt.y
    except Exception:
        pass
    obs = observations_near(db, lon, lat, 3000)
    events = list_events(db)
    return {
        "events": [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "rainfall_mm": e.rainfall_mm,
                "description": e.description,
            }
            for e in events
        ],
        "nearby_observations": [
            {
                "id": str(o.id),
                "event_id": str(o.event_id),
                "severity": o.severity,
                "depth_cm": o.depth_cm,
            }
            for o in obs
        ],
    }


def get_evidence_tool(db: Session, investigation_id: UUID) -> dict[str, Any]:
    items = get_evidence(db, investigation_id)
    return {
        "evidence": [
            {
                "id": str(i.id),
                "mechanism_type": i.mechanism_type,
                "certainty_level": i.certainty_level,
                "claim": i.claim,
                "value": i.value,
                "support_score": i.support_score,
            }
            for i in items
        ]
    }


def rank_mechanisms_tool(db: Session, comparison_id: UUID) -> dict[str, Any]:
    mechs = get_mechanisms(db, comparison_id)
    return {
        "mechanisms": [
            {
                "mechanism_type": m.mechanism_type,
                "score": m.score,
                "confidence": m.confidence,
                "rank": m.rank,
                "explanation": m.explanation,
            }
            for m in mechs
        ]
    }


def get_mechanism_graph_tool(db: Session, investigation_id: UUID) -> dict[str, Any]:
    from app.services.investigation.graph import build_mechanism_graph
    from app.repositories.investigations import get_investigation
    inv = get_investigation(db, investigation_id)
    if not inv:
        return {"error": "Investigation not found"}
    mechs = get_mechanisms(db, inv.comparison_id)
    evidence = get_evidence(db, investigation_id)
    nodes, edges = build_mechanism_graph(investigation_id, mechs, evidence)
    return {
        "nodes": [{"id": n.id, "label": n.label, "type": n.node_type} for n in nodes],
        "edges": [
            {
                "source": e.source,
                "target": e.target,
                "mechanism": e.mechanism,
                "certainty": e.certainty_level,
                "support": e.support_score,
            }
            for e in edges
        ],
    }


def run_counterfactual_tool(
    db: Session,
    investigation_id: UUID,
    scenario_name: str,
    baseline: dict[str, Any],
    modified: dict[str, Any],
) -> dict[str, Any]:
    from app.services.counterfactual.model import CounterfactualBaseline
    from app.services.counterfactual.runner import run_counterfactual_scenario
    b = CounterfactualBaseline(**baseline)
    m = CounterfactualBaseline(**modified)
    return run_counterfactual_scenario(investigation_id, scenario_name, b, m)


def validate_historical_pattern_tool(
    db: Session,
    investigation_id: UUID,
    proposed_mechanism: str | None = None,
) -> dict[str, Any]:
    from app.services.validation.historical import (
        HistoricalEventAssessment,
        validate_historical_pattern,
    )
    events = list_events(db)
    assessments = [
        HistoricalEventAssessment(
            event_id=e.id,
            event_type=e.event_type,
            rainfall_mm=e.rainfall_mm,
            observed_flood=True,
            mechanism_signals={},
        )
        for e in events
    ]
    result = validate_historical_pattern(investigation_id, assessments, proposed_mechanism)
    return {
        "result": result.result,
        "event_count": result.event_count,
        "recurring_mechanisms": result.recurring_mechanisms,
        "confidence": result.confidence,
        "explanation": result.explanation,
    }
