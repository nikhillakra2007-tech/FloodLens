from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from app.services.investigation.mechanisms import MechanismScore


@dataclass
class GraphNode:
    id: str
    label: str
    node_type: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphEdge:
    source: str
    target: str
    mechanism: str
    evidence_ids: list[str]
    certainty_level: str
    support_score: float
    label: str
    relation_type: str = "CORRELATION"


def build_mechanism_graph(
    investigation_id: UUID,
    mechanism_scores: list[MechanismScore],
    evidence_items: list,
) -> tuple[list[GraphNode], list[GraphEdge]]:
    nodes = [
        GraphNode(id="rainfall", label="Rainfall", node_type="input"),
        GraphNode(id="catchment", label="Catchment", node_type="process"),
        GraphNode(id="runoff", label="Runoff", node_type="process"),
        GraphNode(id="drain_network", label="Drain Network", node_type="process"),
        GraphNode(id="bottleneck", label="Bottleneck", node_type="constraint"),
        GraphNode(id="outfall", label="Outfall", node_type="boundary"),
        GraphNode(id="terrain_storage", label="Terrain Storage", node_type="storage"),
        GraphNode(id="flood_observation", label="Flood Observation", node_type="observation"),
    ]

    def _get_ev_ids(mech: str) -> list[str]:
        ids = []
        for itm in evidence_items:
            m = getattr(itm, "mechanism_type", None) or (itm.get("mechanism_type") if isinstance(itm, dict) else None)
            if m == mech:
                eid = getattr(itm, "id", None) or (itm.get("id") if isinstance(itm, dict) else None)
                if eid:
                    ids.append(str(eid))
        if not ids and evidence_items:
            # fallback to first available evidence item to ensure valid graph linkage
            first_id = getattr(evidence_items[0], "id", None) or (evidence_items[0].get("id") if isinstance(evidence_items[0], dict) else None)
            if first_id:
                ids.append(str(first_id))
        return ids

    edges = []
    top_mechs = [m for m in mechanism_scores if getattr(m, "score", 0.0) > 0.1][:3]

    edges.append(GraphEdge(
        source="rainfall",
        target="catchment",
        mechanism="RUNOFF_CONCENTRATION",
        evidence_ids=_get_ev_ids("RUNOFF_CONCENTRATION"),
        certainty_level="FACT",
        support_score=1.0,
        label="Rainfall input",
        relation_type="PROXY_INPUT",
    ))

    if any(getattr(m, "mechanism_type", "") == "IMPERVIOUS_SURFACE" for m in top_mechs):
        edges.append(GraphEdge(
            source="catchment",
            target="runoff",
            mechanism="IMPERVIOUS_SURFACE",
            evidence_ids=_get_ev_ids("IMPERVIOUS_SURFACE"),
            certainty_level="SUPPORTED",
            support_score=0.7,
            label="Runoff generation (impervious)",
            relation_type="ASSOCIATION",
        ))
    else:
        edges.append(GraphEdge(
            source="catchment",
            target="runoff",
            mechanism="RUNOFF_CONCENTRATION",
            evidence_ids=_get_ev_ids("RUNOFF_CONCENTRATION"),
            certainty_level="SUPPORTED",
            support_score=0.6,
            label="Runoff generation",
            relation_type="ASSOCIATION",
        ))

    edges.append(GraphEdge(
        source="runoff",
        target="drain_network",
        mechanism="DRAINAGE_CAPACITY",
        evidence_ids=_get_ev_ids("DRAINAGE_CAPACITY"),
        certainty_level="SUPPORTED",
        support_score=0.6,
        label="Drainage inflow",
        relation_type="ASSOCIATION",
    ))

    if any(getattr(m, "mechanism_type", "") == "DRAINAGE_CAPACITY" for m in top_mechs):
        edges.append(GraphEdge(
            source="drain_network",
            target="bottleneck",
            mechanism="DRAINAGE_CAPACITY",
            evidence_ids=_get_ev_ids("DRAINAGE_CAPACITY"),
            certainty_level="SUPPORTED",
            support_score=0.7,
            label="Capacity constraint",
            relation_type="CORRELATION",
        ))

    if any(getattr(m, "mechanism_type", "") == "TERRAIN_DEPRESSION" for m in top_mechs):
        edges.append(GraphEdge(
            source="catchment",
            target="terrain_storage",
            mechanism="TERRAIN_DEPRESSION",
            evidence_ids=_get_ev_ids("TERRAIN_DEPRESSION"),
            certainty_level="SUPPORTED",
            support_score=0.6,
            label="Terrain ponding",
            relation_type="PROXY_INPUT",
        ))
        edges.append(GraphEdge(
            source="terrain_storage",
            target="flood_observation",
            mechanism="TERRAIN_DEPRESSION",
            evidence_ids=_get_ev_ids("TERRAIN_DEPRESSION"),
            certainty_level="SUPPORTED",
            support_score=0.5,
            label="Local inundation",
            relation_type="CORRELATION",
        ))

    edges.append(GraphEdge(
        source="bottleneck",
        target="outfall",
        mechanism="OUTFALL_RESTRICTION",
        evidence_ids=_get_ev_ids("OUTFALL_RESTRICTION"),
        certainty_level="HYPOTHESIS",
        support_score=0.4,
        label="Outflow restriction",
        relation_type="CAUSAL_HYPOTHESIS",
    ))

    edges.append(GraphEdge(
        source="bottleneck",
        target="flood_observation",
        mechanism="DRAINAGE_CAPACITY",
        evidence_ids=_get_ev_ids("DRAINAGE_CAPACITY"),
        certainty_level="SUPPORTED",
        support_score=0.6,
        label="Excess flooding",
        relation_type="CORRELATION",
    ))

    return nodes, edges

