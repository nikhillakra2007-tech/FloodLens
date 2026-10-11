from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.investigations import get_investigation, save_counterfactual
from app.schemas.counterfactual import CounterfactualRequest, CounterfactualRunResponse
from app.services.counterfactual.model import CounterfactualBaseline
from app.services.counterfactual.runner import run_counterfactual_scenario
from app.services.counterfactual.scenarios import (
    increase_drainage_capacity,
    reduce_runoff_coefficient,
    shorten_drainage_path,
)

router = APIRouter()


@router.post("/{investigation_id}/counterfactual", response_model=CounterfactualRunResponse)
def create_counterfactual(
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

    if "reduce_runoff" in request.scenario_name.lower():
        modified = reduce_runoff_coefficient(baseline, 0.2)
    elif "increase_capacity" in request.scenario_name.lower():
        modified = increase_drainage_capacity(baseline, 0.3)
    elif "shorten_path" in request.scenario_name.lower():
        modified = shorten_drainage_path(baseline, 0.25)
    else:
        modified = reduce_runoff_coefficient(baseline, 0.15)

    result = run_counterfactual_scenario(
        investigation_id, request.scenario_name, baseline, modified
    )

    from app.db.models.investigation_models import CounterfactualRun
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

