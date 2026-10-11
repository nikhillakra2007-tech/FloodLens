import { fetchApi, buildQueryString } from "@/lib/api/client";
import type {
  Investigation,
  InvestigationCreateResponse,
  Mechanism,
  EvidenceItem,
  ValidationRun,
  DefensibilityAssessment,
  InvestigationLimitation,
  Comparison,
} from "@/lib/types/investigation";
import type { MechanismGraph } from "@/lib/types/evidence";

export function createComparison(placeAId: string, placeBId: string): Promise<Comparison> {
  return fetchApi<Comparison>(
    `/investigations/comparisons${buildQueryString({ place_a_id: placeAId, place_b_id: placeBId })}`,
    { method: "POST" }
  );
}

export function createInvestigation(comparisonId: string): Promise<InvestigationCreateResponse> {
  return fetchApi<InvestigationCreateResponse>(
    `/investigations${buildQueryString({ comparison_id: comparisonId })}`,
    { method: "POST" }
  );
}

export function getInvestigation(id: string): Promise<Investigation> {
  return fetchApi<Investigation>(`/investigations/${id}`);
}

export function getMechanisms(id: string): Promise<Mechanism[]> {
  return fetchApi<Mechanism[]>(`/investigations/${id}/mechanisms`);
}

export function getEvidence(id: string): Promise<EvidenceItem[]> {
  return fetchApi<EvidenceItem[]>(`/investigations/${id}/evidence`);
}

export function getGraph(id: string): Promise<MechanismGraph> {
  return fetchApi<MechanismGraph>(`/investigations/${id}/graph`);
}

export function getValidation(id: string): Promise<ValidationRun> {
  return fetchApi<ValidationRun>(`/investigations/${id}/validation`);
}

export function getDefensibility(id: string): Promise<DefensibilityAssessment> {
  return fetchApi<DefensibilityAssessment>(`/investigations/${id}/defensibility`);
}

export function getLimitations(id: string): Promise<InvestigationLimitation[]> {
  return fetchApi<InvestigationLimitation[]>(`/investigations/${id}/limitations`);
}
