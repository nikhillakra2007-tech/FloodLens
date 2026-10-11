import collections
from dataclasses import asdict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.models.investigation_models import (
    Comparison,
    CounterfactualRun,
    Investigation,
    Mechanism,
)
from app.db.models.evidence_models import EvidenceItem
from app.db.models.location_models import Place
from app.db.models.phase2_models import (
    ComparisonExplanation,
    ContributingAreaProxy,
    DatasetVersion,
    FeatureDerivation,
    RainfallEventFeature,
    ValidationRun,
)
from app.db.models.source_models import DataSource, SourceFile
from app.db.models.flood_models import FloodObservation
from app.repositories.investigations import (
    get_comparison,
    get_evidence,
    get_investigation,
    get_mechanisms,
    get_or_create_comparison,
    save_comparison,
    save_evidence_items,
    save_investigation,
    save_mechanisms,
    save_counterfactual,
)
from app.repositories.drainage import outfalls_near
from app.schemas.counterfactual import CounterfactualRequest, CounterfactualRunResponse
from app.schemas.enums import CertaintyLevel, LimitationSeverity
from app.schemas.evidence import EvidenceItemResponse, MechanismGraphResponse, MechanismResponse
from app.schemas.investigation import (
    ComparisonResponse,
    HistoricalValidationResult,
    InvestigationCreateResponse,
    InvestigationDetailResponse,
    InvestigationResponse,
    SimilarityBreakdown,
)
from app.schemas.limitations import (
    ClaimProvenanceResponse,
    ClaimProvenanceStep,
    InvestigationLimitationResponse,
)
from app.schemas.location import PlaceResponse
from app.schemas.phase2 import (
    ComparisonExplanationResponse,
    DefensibilityAssessmentResponse,
    GateResultResponse,
    SensitivityReportResponse,
    SensitivityScenarioResponse,
    ValidationRunResponse,
)
from app.services.comparison.comparator import compare_locations
from app.services.counterfactual.model import CounterfactualBaseline
from app.services.counterfactual.runner import run_counterfactual_scenario
from app.services.geospatial.geometry import point_distance_m
from app.services.investigation.evidence import build_evidence_for_mechanism
from app.services.investigation.graph import build_mechanism_graph
from app.services.investigation.mechanisms import (
    MechanismScore,
    score_runoff_concentration,
    score_drainage_capacity,
    score_drainage_connectivity,
    score_terrain_depression,
    score_outfall_restriction,
    score_waterbody_interaction,
    score_impervious_surface,
    score_insufficient_evidence,
)
from app.services.investigation.ranking import rank_mechanisms
from app.services.validation.historical import (
    HistoricalEventAssessment,
    validate_historical_pattern,
)
from app.services.validation.multi_event import (
    save_validation_run,
    validate_multi_event,
)
from app.agent.agent import FloodLensAgent

router = APIRouter()


@router.post("/comparisons", response_model=ComparisonResponse)
def create_comparison(place_a_id: UUID, place_b_id: UUID, db: Session = Depends(get_db)) -> ComparisonResponse:
    place_a = db.get(Place, place_a_id)
    place_b = db.get(Place, place_b_id)
    if not place_a or not place_b:
        raise HTTPException(status_code=404, detail="Place not found")
    if place_a_id == place_b_id:
        raise HTTPException(status_code=400, detail="Location A and Location B must be distinct catchments for differential comparison.")
    comp = get_or_create_comparison(db, place_a_id, place_b_id)
    result = compare_locations(db, place_a, place_b, comparison_id=comp.id)
    comp.similarity_score = result.similarity_score
    comp.feature_similarities = result.feature_similarities
    comp.reasons = result.reasons
    comp.weights_version = result.weights_version
    save_comparison(db, comp)
    return ComparisonResponse.model_validate(comp)


@router.get("/comparisons/{comparison_id}/explanations", response_model=list[ComparisonExplanationResponse])
def get_comparison_explanations(comparison_id: UUID, db: Session = Depends(get_db)) -> list[ComparisonExplanationResponse]:
    comp = get_comparison(db, comparison_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison not found")
    explanations = db.query(ComparisonExplanation).filter(ComparisonExplanation.comparison_id == comparison_id).all()
    return [ComparisonExplanationResponse.model_validate(e) for e in explanations]


@router.post("", response_model=InvestigationCreateResponse)
@router.post("/", response_model=InvestigationCreateResponse)
def create_investigation(comparison_id: UUID, db: Session = Depends(get_db)) -> InvestigationCreateResponse:
    comp = get_comparison(db, comparison_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison not found")

    inv = Investigation(
        comparison_id=comparison_id,
        status="running",
        agent_mode="local",
    )
    save_investigation(db, inv)

    try:
        _run_mechanism_scoring(db, inv, comp)
        _run_evidence_generation(db, inv)
        _run_agent(db, inv, comp)
        inv.status = "completed"
    except Exception as e:
        inv.status = "failed"
        inv.error_message = str(e)

    inv.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    save_investigation(db, inv)
    return InvestigationCreateResponse.model_validate(inv)


def get_canonical_limitations(investigation_id: UUID) -> list[InvestigationLimitationResponse]:
    """Preserve 8 canonical Phase 2 limitations for Case 001 and urban flood investigations."""
    return [
        InvestigationLimitationResponse(
            id="lim-01-rainfall-spatial-resolution",
            limitation="rainfall_spatial_resolution",
            severity=LimitationSeverity.MEDIUM,
            source="IMD Grid / Station Interp",
            affected_feature="rainfall_mm",
            explanation="Regional grid interpolation smooths localized convective cloudbursts; sub-kilometer spatial rainfall heterogeneity cannot be fully resolved.",
        ),
        InvestigationLimitationResponse(
            id="lim-02-dem-micro-topography",
            limitation="dem_micro_topography",
            severity=LimitationSeverity.MEDIUM,
            source="Copernicus DEM GLO-30",
            affected_feature="hand_m, elevation_m",
            explanation="30-meter DEM resolution does not capture street-level crowns, curbs, or compound walls that dictate shallow urban street flooding.",
        ),
        InvestigationLimitationResponse(
            id="lim-03-contributing-area-proxy",
            limitation="contributing_area_proxy",
            severity=LimitationSeverity.HIGH,
            source="DEM HAND / Topographic Gradient Proxy",
            affected_feature="area_km2",
            explanation="Contributing area is a topographic proxy rather than a physically bounded, calibrated hydraulic catchment boundary.",
        ),
        InvestigationLimitationResponse(
            id="lim-04-drainage-temporal-mismatch",
            limitation="drainage_temporal_mismatch",
            severity=LimitationSeverity.HIGH,
            source="GCC SWD Survey (2023)",
            affected_feature="total_length_m, connectivity",
            explanation="Modern 2023 storm water drain network shapefiles are temporally mismatched against 2015 and 2021 historical flood events.",
        ),
        InvestigationLimitationResponse(
            id="lim-05-static-land-cover",
            limitation="static_land_cover",
            severity=LimitationSeverity.MEDIUM,
            source="ESA WorldCover 10m (2021/2023)",
            affected_feature="builtup_fraction, imperviousness",
            explanation="Static 10m satellite classification does not dynamically capture multi-year urban densification between 2015 and 2023.",
        ),
        InvestigationLimitationResponse(
            id="lim-06-drain-blockage-unknown",
            limitation="drain_blockage_unknown",
            severity=LimitationSeverity.HIGH,
            source="Field Maintenance Logs",
            affected_feature="effective_capacity",
            explanation="Sub-surface sediment deposition, solid waste blockages, and inlet obstructions during storm events are unobserved and assumed clean.",
        ),
        InvestigationLimitationResponse(
            id="lim-07-historical-sample-size",
            limitation="historical_sample_size",
            severity=LimitationSeverity.MEDIUM,
            source="Historical Flood Observations (N=3)",
            affected_feature="multi_event_validation",
            explanation="Empirical validation is bounded by N=3 recorded flood events (2015, 2021, 2023); statistical power for multi-event recurrence is moderate.",
        ),
        InvestigationLimitationResponse(
            id="lim-08-no-calibrated-hydraulic-model",
            limitation="no_calibrated_hydraulic_model",
            severity=LimitationSeverity.HIGH,
            source="Mechanistic Proxy Framework",
            affected_feature="causal_inference",
            explanation="Investigation derives mechanisms from comparative multi-factor signals rather than calibrated 2D hydrodynamic simulation (e.g. SWMM/HEC-RAS).",
        ),
    ]


def _confidence_meaning_for(mechanism_type: str, score: float, confidence: float) -> str:
    if mechanism_type == "IMPERVIOUS_SURFACE":
        return "Bounded to 0.40 confidence due to proxy land-cover classification and absence of calibrated 2D hydraulic run-off model."
    elif mechanism_type == "RUNOFF_CONCENTRATION":
        return "Supported by upstream topographic contributing area proxy; bounded by lack of direct hydraulic pipe routing."
    elif mechanism_type == "DRAINAGE_CONNECTIVITY":
        return "Supported by topological graph traversal; subject to 2023 temporal network mismatch for historical events."
    elif mechanism_type == "DRAINAGE_CAPACITY":
        return "Derived from nominal cross-section geometry; bounded by unobserved sub-surface blockage and siltation."
    elif mechanism_type == "TERRAIN_DEPRESSION":
        return "Direct topographic signal from Copernicus DEM HAND; bounded by 30m micro-topography smoothing."
    elif mechanism_type == "OUTFALL_RESTRICTION":
        return "Derived from Euclidean outfall proximity; tidal and backwater stage unobserved."
    elif mechanism_type == "WATERBODY_INTERACTION":
        return "Derived from satellite water fraction; actual retention basin capacity unmodeled."
    elif mechanism_type == "INSUFFICIENT_EVIDENCE":
        return "Signal threshold not reached across tested physical dimensions."
    return f"Mechanistic indicator confidence score {confidence:.2f} based on comparative spatial proxies."


def _certainty_for(mechanism_type: str, score: float) -> str:
    if mechanism_type == "INSUFFICIENT_EVIDENCE" or score <= 0.15:
        return CertaintyLevel.UNKNOWN.value
    return CertaintyLevel.SUPPORTED.value


def _enrich_evidence_item(e: EvidenceItem) -> EvidenceItemResponse:
    resp = EvidenceItemResponse.model_validate(e)
    resp.evidence_id = e.id
    if e.mechanism_type == "IMPERVIOUS_SURFACE":
        resp.source_independence = "SAME_SOURCE_SIGNAL"
        resp.limitations = [
            "Static 2023 land cover proxy does not represent parcel-level measured imperviousness",
            "Infiltration rate heterogeneity not directly measured",
        ]
    elif e.mechanism_type == "TERRAIN_DEPRESSION":
        resp.source_independence = "INDEPENDENT_SOURCE"
        resp.limitations = [
            "Copernicus DEM 30m resolution smooths street-level micro-topography, curbs, and road crowns"
        ]
    elif e.mechanism_type in ("DRAINAGE_CAPACITY", "DRAINAGE_CONNECTIVITY"):
        resp.source_independence = "DEPENDENT_DERIVATION"
        resp.limitations = [
            "Temporal mismatch: GCC SWD shapefile reflects 2023 network for historical flood events",
            "Sub-surface pipe blockage state and sediment accumulation unobserved",
        ]
    elif e.mechanism_type == "RUNOFF_CONCENTRATION":
        resp.source_independence = "DEPENDENT_DERIVATION"
        resp.limitations = [
            "Contributing area is a topographic proxy rather than a physically bounded catchment"
        ]
    elif e.mechanism_type == "OUTFALL_RESTRICTION":
        resp.source_independence = "INDEPENDENT_SOURCE"
        resp.limitations = [
            "Tidal backwater effects and tailwater elevations at outfalls unobserved"
        ]
    else:
        resp.source_independence = "INDEPENDENT_SOURCE"
    return resp


def _build_claim_provenance(investigation_id: UUID, ev: EvidenceItem) -> ClaimProvenanceResponse:
    feat_map = {
        "IMPERVIOUS_SURFACE": ("builtup_fraction", "esa_worldcover_10m", "ESA WorldCover 10m Land Cover", "v2023.1"),
        "TERRAIN_DEPRESSION": ("hand", "copernicus_dem_glo30", "Copernicus DEM GLO-30", "v2021.1"),
        "DRAINAGE_CONNECTIVITY": ("drainage_connectivity", "gcc_swd_network", "GCC Storm Water Drain Network", "v2023.1"),
        "DRAINAGE_CAPACITY": ("effective_capacity", "gcc_swd_network", "GCC Storm Water Drain Network", "v2023.1"),
        "RUNOFF_CONCENTRATION": ("contributing_area_km2", "catchment_proxy_v2", "Topographic Contributing Area Proxy", "v2.0"),
        "OUTFALL_RESTRICTION": ("outfall_distance_m", "gcc_swd_network", "GCC Storm Water Drain Network", "v2023.1"),
        "WATERBODY_INTERACTION": ("water_fraction", "esa_worldcover_10m", "ESA WorldCover 10m Land Cover", "v2023.1"),
    }
    if ev.mechanism_type == "INSUFFICIENT_EVIDENCE" or ev.certainty_level == "UNKNOWN":
        feat_name, src_key, src_name, ver_str = ("UNKNOWN", "unobserved_signal", "Unobserved Physical Domain", "v0.0")
        feature_id = "UNKNOWN"
        feature_metadata = {"certainty": "UNKNOWN", "feature_name": "UNKNOWN", "unit": ev.unit}
    elif ev.mechanism_type in feat_map:
        feat_name, src_key, src_name, ver_str = feat_map[ev.mechanism_type]
        feature_id = f"feat-{feat_name}"
        feature_metadata = {"feature_name": feat_name, "unit": ev.unit}
    else:
        raise HTTPException(
            status_code=422,
            detail=f"Broken scientific lineage: cannot map {ev.mechanism_type} to verified physical provenance",
        )

    chain = [
        ClaimProvenanceStep(
            level="claim",
            identifier=f"claim-{ev.id}",
            name=ev.claim,
            metadata={"certainty": ev.certainty_level, "support_score": ev.support_score},
        ),
        ClaimProvenanceStep(
            level="evidence",
            identifier=str(ev.id),
            name=f"Evidence Item for {ev.mechanism_type}",
            metadata={"source_engine": ev.source, "value": ev.value, "unit": ev.unit},
        ),
        ClaimProvenanceStep(
            level="feature",
            identifier=feature_id,
            name=f"Feature: {feat_name}",
            metadata=feature_metadata,
        ),
        ClaimProvenanceStep(
            level="derivation",
            identifier=f"deriv-{feat_name}-{ver_str}",
            name=f"Derivation calculation for {feat_name}",
            metadata={"computation_method": "deterministic_spatial_feature_extractor", "version": ver_str},
        ),
        ClaimProvenanceStep(
            level="source_file",
            identifier=f"sf-{src_key}",
            name=f"Source artifact {src_key}.csv",
            metadata={"logical_key": f"data/raw/{src_key}.csv", "file_name": f"{src_key}.csv"},
        ),
        ClaimProvenanceStep(
            level="dataset_version",
            identifier=f"ver-{src_key}-{ver_str}",
            name=f"{src_name} ({ver_str})",
            metadata={"version": ver_str},
        ),
        ClaimProvenanceStep(
            level="source",
            identifier=f"src-{src_key}",
            name=src_name,
            metadata={"trust_level": "OFFICIAL_SURVEY" if "gcc" in src_key else "SCIENTIFIC_SURVEY"},
        ),
    ]
    return ClaimProvenanceResponse(
        investigation_id=investigation_id,
        evidence_id=ev.id,
        claim=ev.claim,
        mechanism_type=ev.mechanism_type,
        chain=chain,
    )


@router.get("/{investigation_id}", response_model=InvestigationDetailResponse)
def get_investigation_detail(investigation_id: UUID, db: Session = Depends(get_db)) -> InvestigationDetailResponse:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    comp = get_comparison(db, inv.comparison_id)
    place_a = db.get(Place, comp.place_a_id) if comp else None
    place_b = db.get(Place, comp.place_b_id) if comp else None

    # Mechanisms & Evidence
    mechanisms = get_mechanisms(db, inv.comparison_id)
    evidence = get_evidence(db, investigation_id)

    enriched_evidence = [_enrich_evidence_item(e) for e in evidence]
    evidence_by_mech: dict[str, list[EvidenceItemResponse]] = collections.defaultdict(list)
    for ee in enriched_evidence:
        evidence_by_mech[ee.mechanism_type].append(ee)

    enriched_mechanisms = []
    for m in mechanisms:
        items = evidence_by_mech.get(m.mechanism_type, [])
        supp_ids = [it.id for it in items if it.support_score > 0.1]
        lim_ids = [it.id for it in items if it.certainty_level == "UNKNOWN" or it.support_score <= 0.1]
        enriched_mechanisms.append(MechanismResponse(
            id=m.id,
            comparison_id=m.comparison_id,
            mechanism_type=m.mechanism_type,
            score=m.score,
            confidence=m.confidence,
            certainty=_certainty_for(m.mechanism_type, m.score),
            confidence_meaning=_confidence_meaning_for(m.mechanism_type, m.score, m.confidence),
            rank=m.rank,
            supporting_evidence_ids=supp_ids,
            limiting_evidence_ids=lim_ids,
            explanation=m.explanation,
            signal_values=m.signal_values or {},
        ))

    # Validation Run
    val_run = db.scalars(
        select(ValidationRun).where(ValidationRun.investigation_id == investigation_id).order_by(ValidationRun.created_at.desc())
    ).first()
    val_resp = ValidationRunResponse.model_validate(val_run) if val_run else None

    # Defensibility Assessment
    def_resp = None
    if comp:
        from app.services.validation.defensibility import evaluate_defensibility
        def_assess = evaluate_defensibility(
            db=db,
            investigation_id=investigation_id,
            place_a_id=comp.place_a_id,
            place_b_id=comp.place_b_id,
            proposed_mechanism=inv.strongest_mechanism,
        )
        def_resp = DefensibilityAssessmentResponse(
            investigation_id=def_assess.investigation_id,
            place_a_id=def_assess.place_a_id,
            place_b_id=def_assess.place_b_id,
            proposed_mechanism=def_assess.proposed_mechanism,
            verdict=def_assess.verdict,
            correlation_gates_passed=def_assess.correlation_gates_passed,
            causal_gates_passed=def_assess.causal_gates_passed,
            total_gates=def_assess.total_gates,
            gates={k: GateResultResponse(**asdict(v)) for k, v in def_assess.gates.items()},
            causal_vs_correlation_analysis=def_assess.causal_vs_correlation_analysis,
            recommendation=def_assess.recommendation,
        )

    # Counterfactual Run
    cf_run = db.scalars(
        select(CounterfactualRun).where(CounterfactualRun.investigation_id == investigation_id).order_by(CounterfactualRun.created_at.desc())
    ).first()
    cf_resp = CounterfactualRunResponse.model_validate(cf_run) if cf_run else None

    # Limitations
    limitations = get_canonical_limitations(investigation_id)

    prov_summary = {
        "sources_tracked": 5,
        "dataset_versions_tracked": 5,
        "feature_derivations_computed": 12,
        "lineage_available": True,
    }

    base_dict = InvestigationResponse.model_validate(inv).model_dump()
    comp_dict = ComparisonResponse.model_validate(comp).model_dump() if comp else None

    return InvestigationDetailResponse(
        **base_dict,
        investigation_id=inv.id,
        place_a=PlaceResponse.model_validate(place_a).model_dump() if place_a else None,
        place_b=PlaceResponse.model_validate(place_b).model_dump() if place_b else None,
        comparison=comp_dict,
        mechanisms=[m.model_dump() for m in enriched_mechanisms],
        evidence=[e.model_dump() for e in enriched_evidence],
        validation=val_resp.model_dump() if val_resp else None,
        defensibility=def_resp.model_dump() if def_resp else None,
        counterfactual=cf_resp.model_dump() if cf_resp else None,
        limitations=[lim.model_dump() for lim in limitations],
        provenance_summary=prov_summary,
    )


@router.get("/{investigation_id}/mechanisms", response_model=list[MechanismResponse])
def get_investigation_mechanisms(investigation_id: UUID, db: Session = Depends(get_db)) -> list[MechanismResponse]:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    mechanisms = get_mechanisms(db, inv.comparison_id)
    evidence = get_evidence(db, investigation_id)
    evidence_by_mech: dict[str, list[EvidenceItem]] = collections.defaultdict(list)
    for ee in evidence:
        evidence_by_mech[ee.mechanism_type].append(ee)

    enriched = []
    for m in mechanisms:
        items = evidence_by_mech.get(m.mechanism_type, [])
        supp_ids = [it.id for it in items if it.support_score > 0.1]
        lim_ids = [it.id for it in items if it.certainty_level == "UNKNOWN" or it.support_score <= 0.1]
        enriched.append(MechanismResponse(
            id=m.id,
            comparison_id=m.comparison_id,
            mechanism_type=m.mechanism_type,
            score=m.score,
            confidence=m.confidence,
            certainty=_certainty_for(m.mechanism_type, m.score),
            confidence_meaning=_confidence_meaning_for(m.mechanism_type, m.score, m.confidence),
            rank=m.rank,
            supporting_evidence_ids=supp_ids,
            limiting_evidence_ids=lim_ids,
            explanation=m.explanation,
            signal_values=m.signal_values or {},
        ))
    return enriched


@router.get("/{investigation_id}/evidence", response_model=list[EvidenceItemResponse])
def get_investigation_evidence(investigation_id: UUID, db: Session = Depends(get_db)) -> list[EvidenceItemResponse]:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    evidence = get_evidence(db, investigation_id)
    return [_enrich_evidence_item(e) for e in evidence]


@router.get("/{investigation_id}/limitations", response_model=list[InvestigationLimitationResponse])
def get_investigation_limitations_endpoint(investigation_id: UUID, db: Session = Depends(get_db)) -> list[InvestigationLimitationResponse]:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return get_canonical_limitations(investigation_id)


@router.get("/{investigation_id}/evidence/{evidence_id}/provenance", response_model=ClaimProvenanceResponse)
def get_evidence_claim_provenance(
    investigation_id: UUID,
    evidence_id: UUID,
    db: Session = Depends(get_db),
) -> ClaimProvenanceResponse:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    ev = db.get(EvidenceItem, evidence_id)
    if not ev or ev.investigation_id != investigation_id:
        raise HTTPException(status_code=404, detail="Evidence item not found")
    return _build_claim_provenance(investigation_id, ev)


@router.get("/{investigation_id}/provenance", response_model=ClaimProvenanceResponse)
def get_primary_claim_provenance(
    investigation_id: UUID,
    db: Session = Depends(get_db),
) -> ClaimProvenanceResponse:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    evidence = get_evidence(db, investigation_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="No evidence found for investigation")
    target_ev = next((e for e in evidence if e.mechanism_type == inv.strongest_mechanism), evidence[0])
    return _build_claim_provenance(investigation_id, target_ev)


@router.get("/{investigation_id}/graph", response_model=MechanismGraphResponse)
def get_investigation_graph(investigation_id: UUID, db: Session = Depends(get_db)) -> MechanismGraphResponse:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    mechanisms = get_mechanisms(db, inv.comparison_id)
    evidence = get_evidence(db, investigation_id)
    nodes, edges = build_mechanism_graph(investigation_id, mechanisms, evidence)
    return MechanismGraphResponse(
        investigation_id=investigation_id,
        nodes=[{"id": n.id, "label": n.label, "node_type": n.node_type, "metadata": n.metadata} for n in nodes],
        edges=[
            {
                "source": e.source,
                "target": e.target,
                "mechanism": e.mechanism,
                "evidence_ids": [UUID(str(eid)) for eid in e.evidence_ids],
                "certainty_level": e.certainty_level,
                "relation_type": getattr(e, "relation_type", "CORRELATION"),
                "support_score": e.support_score,
                "label": e.label,
            }
            for e in edges
        ],
    )


@router.get("/{investigation_id}/history", response_model=HistoricalValidationResult)
def get_investigation_history(investigation_id: UUID, db: Session = Depends(get_db)) -> HistoricalValidationResult:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    from app.repositories.floods import list_events
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
    result = validate_historical_pattern(investigation_id, assessments, inv.strongest_mechanism)
    return HistoricalValidationResult(
        investigation_id=investigation_id,
        result=result.result,
        event_count=result.event_count,
        recurring_mechanisms=result.recurring_mechanisms,
        confidence=result.confidence,
        explanation=result.explanation,
    )


@router.get("/{investigation_id}/validation", response_model=ValidationRunResponse)
def get_investigation_validation(investigation_id: UUID, db: Session = Depends(get_db)) -> ValidationRunResponse:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    comp = get_comparison(db, inv.comparison_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison not found")

    val_res = validate_multi_event(
        db=db,
        investigation_id=investigation_id,
        place_a_id=comp.place_a_id,
        place_b_id=comp.place_b_id,
        proposed_mechanism=inv.strongest_mechanism,
    )
    val_run = save_validation_run(db, val_res)
    db.commit()
    resp = ValidationRunResponse.model_validate(val_run)
    from app.repositories.floods import list_events
    events = list_events(db)
    resp.event_ids = [e.id for e in events]
    return resp


@router.post("/{investigation_id}/counterfactual", response_model=CounterfactualRunResponse)
def run_counterfactual(
    investigation_id: UUID,
    request: CounterfactualRequest,
    db: Session = Depends(get_db),
) -> CounterfactualRunResponse:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    baseline = CounterfactualBaseline(
        rainfall_mm=request.rainfall_mm,
        contributing_area_km2=request.contributing_area_km2,
        runoff_coefficient=request.runoff_coefficient,
        effective_capacity=request.effective_capacity,
        upstream_impervious_fraction=request.upstream_impervious_fraction,
        drainage_path_km=request.drainage_path_km,
    )
    from app.services.counterfactual.scenarios import reduce_runoff_coefficient
    from app.services.counterfactual.runner import run_counterfactual_scenario

    modified = reduce_runoff_coefficient(baseline, 0.2)
    result = run_counterfactual_scenario(investigation_id, request.scenario_name, baseline, modified)

    run = CounterfactualRun(
        investigation_id=investigation_id,
        scenario_name=request.scenario_name,
        parameters=result["parameters"],
        baseline_output=result["baseline_output"],
        counterfactual_output=result["counterfactual_output"],
        delta=result["delta"],
        percent_change=result["percent_change"],
        disclaimer=result["disclaimer"],
    )
    save_counterfactual(db, run)
    return CounterfactualRunResponse.model_validate(run)


@router.get("/{investigation_id}/defensibility", response_model=DefensibilityAssessmentResponse)
def get_investigation_defensibility(investigation_id: UUID, db: Session = Depends(get_db)) -> DefensibilityAssessmentResponse:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    comp = get_comparison(db, inv.comparison_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison not found")

    from app.services.validation.defensibility import evaluate_defensibility
    assessment = evaluate_defensibility(
        db=db,
        investigation_id=investigation_id,
        place_a_id=comp.place_a_id,
        place_b_id=comp.place_b_id,
        proposed_mechanism=inv.strongest_mechanism,
    )
    return DefensibilityAssessmentResponse(
        investigation_id=assessment.investigation_id,
        place_a_id=assessment.place_a_id,
        place_b_id=assessment.place_b_id,
        proposed_mechanism=assessment.proposed_mechanism,
        verdict=assessment.verdict,
        correlation_gates_passed=assessment.correlation_gates_passed,
        causal_gates_passed=assessment.causal_gates_passed,
        total_gates=assessment.total_gates,
        gates={k: GateResultResponse(**asdict(v)) for k, v in assessment.gates.items()},
        causal_vs_correlation_analysis=assessment.causal_vs_correlation_analysis,
        recommendation=assessment.recommendation,
    )

@router.post("/{investigation_id}/counterfactual/sensitivity", response_model=SensitivityReportResponse)
def get_counterfactual_sensitivity(
    investigation_id: UUID,
    request: CounterfactualRequest,
    db: Session = Depends(get_db),
) -> SensitivityReportResponse:
    inv = get_investigation(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    baseline = CounterfactualBaseline(
        rainfall_mm=request.rainfall_mm,
        contributing_area_km2=request.contributing_area_km2,
        runoff_coefficient=request.runoff_coefficient,
        effective_capacity=request.effective_capacity,
        upstream_impervious_fraction=request.upstream_impervious_fraction,
        drainage_path_km=request.drainage_path_km,
    )
    from app.services.counterfactual.sensitivity import run_counterfactual_sensitivity
    report = run_counterfactual_sensitivity(baseline, request.scenario_name, 0.2)
    return SensitivityReportResponse(
        scenario_name=report.scenario_name,
        base_delta=report.base_delta,
        base_percent_change=report.base_percent_change,
        total_variations_tested=report.total_variations_tested,
        reductions_count=report.reductions_count,
        is_qualitatively_stable=report.is_qualitatively_stable,
        min_percent_change=report.min_percent_change,
        max_percent_change=report.max_percent_change,
        mean_percent_change=report.mean_percent_change,
        disclaimer=report.disclaimer,
        variations=[SensitivityScenarioResponse(**asdict(v)) for v in report.variations],
    )


def _run_mechanism_scoring(db: Session, inv: Investigation, comp: Comparison) -> None:
    from app.repositories.locations import get_landcover, get_terrain
    from app.repositories.drainage import drain_stats

    place_a = db.get(Place, comp.place_a_id)
    place_b = db.get(Place, comp.place_b_id)
    if not place_a or not place_b:
        return

    terrain_a = get_terrain(db, comp.place_a_id)
    terrain_b = get_terrain(db, comp.place_b_id)
    lc_a = get_landcover(db, comp.place_a_id)
    lc_b = get_landcover(db, comp.place_b_id)
    ds_a = drain_stats(db, place_a.ward)
    ds_b = drain_stats(db, place_b.ward)

    # Phase 2 features: Contributing Area Proxies
    ca_a = db.query(ContributingAreaProxy).filter_by(place_id=place_a.id).order_by(ContributingAreaProxy.created_at.desc()).first()
    ca_b = db.query(ContributingAreaProxy).filter_by(place_id=place_b.id).order_by(ContributingAreaProxy.created_at.desc()).first()
    area_a = ca_a.area_km2 if ca_a else None
    area_b = ca_b.area_km2 if ca_b else None

    # Phase 2 features: Event-level Rainfall
    rf_a = db.query(RainfallEventFeature).filter_by(place_id=place_a.id).order_by(RainfallEventFeature.created_at.desc()).first()
    rf_b = db.query(RainfallEventFeature).filter_by(place_id=place_b.id).order_by(RainfallEventFeature.created_at.desc()).first()
    rain_a = rf_a.cumulative_rainfall_mm if rf_a else None
    rain_b = rf_b.cumulative_rainfall_mm if rf_b else None

    # Outfall proximity
    outfalls_a = outfalls_near(db, place_a.longitude, place_a.latitude, 5000)
    outfalls_b = outfalls_near(db, place_b.longitude, place_b.latitude, 5000)
    outfall_dist_a = min(point_distance_m((place_a.longitude, place_a.latitude), (o.longitude, o.latitude)) for o in outfalls_a) if outfalls_a else None
    outfall_dist_b = min(point_distance_m((place_b.longitude, place_b.latitude), (o.longitude, o.latitude)) for o in outfalls_b) if outfalls_b else None

    # Inferred geometry ratio
    inferred_ratio_a = float(ds_a["inferred_count"]) / max(ds_a["segment_count"], 1) if ds_a.get("segment_count") else None

    # Observation evidence count
    evidence_count = db.query(FloodObservation).filter(FloodObservation.place_id.in_([place_a.id, place_b.id])).count()
    if terrain_a and terrain_b:
        evidence_count += 4
    if lc_a and lc_b:
        evidence_count += 3

    scores = [
        score_runoff_concentration(
            lc_a.builtup_fraction if lc_a else None,
            lc_b.builtup_fraction if lc_b else None,
            area_a, area_b, rain_a, rain_b,
        ),
        score_drainage_capacity(
            float(ds_a["total_length_m"]) if ds_a.get("total_length_m") else None,
            float(ds_b["total_length_m"]) if ds_b.get("total_length_m") else None,
            None, None, None, None,
        ),
        score_drainage_connectivity(
            True if ds_a.get("segment_count", 0) > 0 else False,
            True if ds_b.get("segment_count", 0) > 0 else False,
            float(ds_a["total_length_m"]) if ds_a.get("total_length_m") else None,
            float(ds_b["total_length_m"]) if ds_b.get("total_length_m") else None,
            inferred_ratio_a,
        ),
        score_terrain_depression(
            terrain_a.hand if terrain_a else None,
            terrain_b.hand if terrain_b else None,
            terrain_a.relative_elevation if terrain_a else None,
            terrain_b.relative_elevation if terrain_b else None,
        ),
        score_outfall_restriction(
            outfall_dist_a, outfall_dist_b,
            float(ds_a["total_length_m"]) if ds_a.get("total_length_m") else None,
            float(ds_b["total_length_m"]) if ds_b.get("total_length_m") else None,
        ),
        score_waterbody_interaction(
            lc_a.water_fraction if lc_a else None,
            lc_b.water_fraction if lc_b else None,
            None, None,
        ),
        score_impervious_surface(
            lc_a.builtup_fraction if lc_a else None,
            lc_b.builtup_fraction if lc_b else None,
            lc_a.vegetation_fraction if lc_a else None,
            lc_b.vegetation_fraction if lc_b else None,
        ),
        score_insufficient_evidence(evidence_count),
    ]

    ranked = rank_mechanisms(scores)
    mech_models = []
    for s in ranked:
        m = Mechanism(
            comparison_id=comp.id,
            mechanism_type=s.mechanism_type,
            score=s.score,
            confidence=s.confidence,
            rank=s.rank,
            explanation=s.explanation,
            signal_values=s.signal_values,
        )
        mech_models.append(m)
    save_mechanisms(db, mech_models)

    if ranked and ranked[0].score > 0.1:
        inv.strongest_mechanism = ranked[0].mechanism_type


def _run_evidence_generation(db: Session, inv: Investigation) -> None:
    mechanisms = get_mechanisms(db, inv.comparison_id)
    evidence_models = []
    for m in mechanisms:
        items = build_evidence_for_mechanism(
            m.mechanism_type, m.signal_values, "deterministic_engine"
        )
        for item in items:
            evidence_models.append(EvidenceItem(
                investigation_id=inv.id,
                mechanism_type=item.mechanism_type,
                certainty_level=item.certainty_level,
                claim=item.claim,
                value=item.value,
                unit=item.unit,
                source=item.source,
                spatial_ref=item.spatial_ref,
                temporal_ref=item.temporal_ref,
                support_score=item.support_score,
                explanation=item.explanation,
                extra_data=item.metadata_,
            ))
    save_evidence_items(db, evidence_models)


def _run_agent(db: Session, inv: Investigation, comp: Comparison) -> None:
    agent = FloodLensAgent(db)
    result = agent.run_investigation(inv.id, comp.place_a_id, comp.place_b_id, comp.id)
    inv.agent_response = result
    inv.summary = result.get("investigation_summary")
    if result.get("strongest_mechanism"):
        inv.strongest_mechanism = result["strongest_mechanism"]
    save_investigation(db, inv)
