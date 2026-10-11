import { useQuery } from "@tanstack/react-query";
import { getInvestigation, getMechanisms, getEvidence, getGraph } from "@/lib/api/investigations";
import { getProvenance } from "@/lib/api/evidence";
import type { Investigation, Mechanism, EvidenceItem } from "@/lib/types/investigation";
import type { ClaimProvenance, MechanismGraph } from "@/lib/types/evidence";

export function useInvestigation(id: string) {
  return useQuery({
    queryKey: ["investigation", id],
    queryFn: () => getInvestigation(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "running" ? 2000 : false;
    },
  });
}

export function useMechanisms(id: string) {
  return useQuery({
    queryKey: ["mechanisms", id],
    queryFn: () => getMechanisms(id),
    enabled: !!id,
  });
}

export function useEvidence(id: string) {
  return useQuery({
    queryKey: ["evidence", id],
    queryFn: () => getEvidence(id),
    enabled: !!id,
  });
}

export function useProvenance(investigationId: string, evidenceId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["provenance", investigationId, evidenceId],
    queryFn: () => getProvenance(investigationId, evidenceId),
    enabled: enabled && !!investigationId && !!evidenceId,
  });
}

export function useGraph(id: string) {
  return useQuery({
    queryKey: ["graph", id],
    queryFn: () => getGraph(id),
    enabled: !!id,
  });
}
