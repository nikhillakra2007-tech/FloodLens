import logging
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.agent.guardrails import sanitize_agent_output, validate_agent_output
from app.agent.schemas import AgentInvestigationOutput
from app.agent.tools import (
    compare_locations_tool,
    find_comparable_locations,
    get_evidence_tool,
    get_historical_events_tool,
    get_location_features_tool,
    get_mechanism_graph_tool,
    rank_mechanisms_tool,
    validate_historical_pattern_tool,
)
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class FloodLensAgent:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()

    def run_investigation(
        self,
        investigation_id: UUID,
        place_a_id: UUID,
        place_b_id: UUID,
        comparison_id: UUID,
    ) -> dict[str, Any]:
        settings = get_settings()
        mode = settings.agent_mode

        if mode == "bedrock" and settings.aws_access_key_id:
            return self._run_bedrock(investigation_id, place_a_id, place_b_id, comparison_id)
        return self._run_local(investigation_id, place_a_id, place_b_id, comparison_id)

    def _run_local(
        self,
        investigation_id: UUID,
        place_a_id: UUID,
        place_b_id: UUID,
        comparison_id: UUID,
    ) -> dict[str, Any]:
        features_a = get_location_features_tool(self.db, place_a_id)
        features_b = get_location_features_tool(self.db, place_b_id)
        comparison = compare_locations_tool(self.db, place_a_id, place_b_id)
        mechanisms = rank_mechanisms_tool(self.db, comparison_id)
        evidence = get_evidence_tool(self.db, investigation_id)
        history = get_historical_events_tool(self.db, place_a_id)

        mech_list = mechanisms.get("mechanisms", [])
        strongest = mech_list[0]["mechanism_type"] if mech_list and mech_list[0]["score"] > 0.1 else None

        evidence_claims = [
            f"[{e['certainty_level']}] {e['claim']}"
            for e in evidence.get("evidence", [])
        ]

        output = {
            "investigation_summary": (
                f"Differential analysis of {comparison.get('place_a', 'A')} vs "
                f"{comparison.get('place_b', 'B')}. "
                f"Similarity score: {comparison.get('similarity_score', 0):.2f}. "
                f"Strongest mechanism: {strongest or 'INSUFFICIENT_EVIDENCE'}."
            ),
            "strongest_mechanism": strongest,
            "supporting_evidence": evidence_claims,
            "alternative_mechanisms": [
                m["mechanism_type"] for m in mech_list[1:] if m["score"] > 0.1
            ],
            "counterfactual_result": None,
            "historical_validation": None,
            "unknowns": [],
            "confidence": mech_list[0]["confidence"] if mech_list else 0.1,
            "certainty_classification": {
                e["id"]: e["certainty_level"] for e in evidence.get("evidence", [])
            },
        }

        safe, issues = validate_agent_output(output)
        if not safe:
            logger.warning("Agent output validation issues: %s", issues)
            output["unknowns"].extend(issues)

        return sanitize_agent_output(output)

    def _run_bedrock(
        self,
        investigation_id: UUID,
        place_a_id: UUID,
        place_b_id: UUID,
        comparison_id: UUID,
    ) -> dict[str, Any]:
        try:
            import boto3
            from strands import Agent

            features_a = get_location_features_tool(self.db, place_a_id)
            features_b = get_location_features_tool(self.db, place_b_id)
            comparison = compare_locations_tool(self.db, place_a_id, place_b_id)
            mechanisms = rank_mechanisms_tool(self.db, comparison_id)
            evidence = get_evidence_tool(self.db, investigation_id)
            history = get_historical_events_tool(self.db, place_a_id)

            prompt_data = {
                "features_a": features_a,
                "features_b": features_b,
                "comparison": comparison,
                "mechanisms": mechanisms,
                "evidence": evidence,
                "history": history,
            }

            client = boto3.client("bedrock-runtime", region_name=self.settings.aws_region)
            from app.agent.prompts import SYSTEM_PROMPT, INVESTIGATION_PROMPT
            prompt = INVESTIGATION_PROMPT.format(
                place_a_name=features_a.get("name", "A"),
                place_a_id=place_a_id,
                place_b_name=features_b.get("name", "B"),
                place_b_id=place_b_id,
            )

            response = client.converse(
                modelId=self.settings.bedrock_model_id,
                messages=[{"role": "user", "content": [{"text": prompt + "\n\n" + str(prompt_data)}]}],
                system=[{"text": SYSTEM_PROMPT}],
            )

            text = response["output"]["message"]["content"][0]["text"]
            import json
            output = json.loads(text)
            safe, issues = validate_agent_output(output)
            if not safe:
                output["unknowns"].extend(issues)
            return sanitize_agent_output(output)
        except Exception as e:
            logger.error("Bedrock agent failed, falling back to local: %s", e)
            return self._run_local(investigation_id, place_a_id, place_b_id, comparison_id)
