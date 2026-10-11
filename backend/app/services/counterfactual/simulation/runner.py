from dataclasses import asdict
from typing import Any
from uuid import UUID

from app.services.counterfactual.model import (
    CounterfactualBaseline,
    compute_counterfactual,
    DISCLAIMER,
)
from app.services.counterfactual.scenarios import reduce_runoff_coefficient


def run_counterfactual_scenario(
    investigation_id: UUID,
    scenario_name: str,
    baseline_params: CounterfactualBaseline,
    modified_params: CounterfactualBaseline,
) -> dict[str, Any]:
    baseline_out, counterfactual_out, delta, percent_change = compute_counterfactual(
        baseline_params, modified_params
    )
    return {
        "investigation_id": investigation_id,
        "scenario_name": scenario_name,
        "parameters": {
            "baseline": asdict(baseline_params),
            "counterfactual": asdict(modified_params),
        },
        "baseline_output": baseline_out.excess_flow_proxy,
        "counterfactual_output": counterfactual_out.excess_flow_proxy,
        "delta": delta,
        "percent_change": percent_change,
        "disclaimer": DISCLAIMER,
    }

