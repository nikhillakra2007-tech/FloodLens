import { fetchApi } from "@/lib/api/client";
import type { ClaimProvenance } from "@/lib/types/evidence";

export function getProvenance(investigationId: string, evidenceId: string): Promise<ClaimProvenance> {
  return fetchApi<ClaimProvenance>(
    `/investigations/${investigationId}/evidence/${evidenceId}/provenance`
  );
}
