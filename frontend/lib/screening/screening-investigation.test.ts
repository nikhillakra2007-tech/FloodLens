import { describe, it, expect } from "vitest";
import mockData from "@/lib/mockData.json";
import {
  buildScreeningReport,
  parseScreeningComparisonId,
  parseScreeningInvestigationId,
  screeningComparisonId,
  screeningInvestigationId,
  isCalibratedPairIds,
  SCREENING_VERDICT,
} from "./screening-investigation";

const AN = "9abecc5c-df2a-49ab-a089-1a8bd5244ff4"; // Anna Nagar (calibrated)
const TN = "1ea309cc-6461-493e-b4aa-412ea3474676"; // T Nagar (illustrative)
const VEL = "b0aa192d-6cc8-4262-97b7-07cd5de2d9a8"; // Velachery (calibrated)
const ADY = "e503e3f2-28ba-46b0-8f7d-27aa3001f7be"; // Adyar (illustrative)

describe("screening id helpers", () => {
  it("round-trips comparison and investigation ids", () => {
    const compId = screeningComparisonId(TN, ADY);
    expect(parseScreeningComparisonId(compId)).toEqual({ a: TN, b: ADY });
    const invId = screeningInvestigationId(compId);
    expect(parseScreeningInvestigationId(invId)).toEqual({ a: TN, b: ADY });
    expect(parseScreeningComparisonId(invId)).toBeNull();
  });

  it("rejects unknown, identical, and malformed pairs", () => {
    expect(parseScreeningComparisonId("comp-nope")).toBeNull();
    expect(parseScreeningComparisonId(screeningComparisonId(TN, TN))).toBeNull();
    expect(
      parseScreeningComparisonId(
        "comp-00000000-0000-0000-0000-000000000000-1ea309cc-6461-493e-b4aa-412ea3474676"
      )
    ).toBeNull();
    expect(parseScreeningInvestigationId(mockData.createInv.id)).toBeNull();
  });

  it("identifies the calibrated pair in either order", () => {
    expect(isCalibratedPairIds(AN, VEL)).toBe(true);
    expect(isCalibratedPairIds(VEL, AN)).toBe(true);
    expect(isCalibratedPairIds(TN, ADY)).toBe(false);
  });
});

describe("buildScreeningReport", () => {
  it("builds reports for every ordered non-identical ward pair", () => {
    const wards = [AN, TN, VEL, ADY];
    for (const a of wards) {
      for (const b of wards) {
        if (a === b) {
          expect(buildScreeningReport(a, b)).toBeNull();
          continue;
        }
        const report = buildScreeningReport(a, b);
        expect(report).not.toBeNull();
        expect(report!.investigation.status).toBe("completed");
        expect(report!.investigation.agent_mode).toBe("screening");
      }
    }
  });

  it("labels everything as unvalidated screening output", () => {
    const report = buildScreeningReport(TN, ADY)!;
    expect(report.defensibility.verdict).toBe(SCREENING_VERDICT);
    expect(report.validation.result).toBe("INSUFFICIENT_DATA");
    expect(report.validation.event_count).toBe(0);
    for (const m of report.mechanisms) {
      expect(m.certainty).toBe("HYPOTHESIS");
      expect(m.score).toBeGreaterThanOrEqual(0);
      expect(m.score).toBeLessThanOrEqual(1);
    }
    for (const e of report.evidence) {
      expect(e.certainty_level).toBe("HYPOTHESIS");
      expect(e.claim).toContain("screening estimate");
    }
    const summary = report.investigation.summary as string;
    expect(summary).toContain("Screening analysis");
    expect(summary).toContain("T Nagar");
    expect(summary).toContain("Adyar");
    expect(summary).toContain("not a calibrated diagnostic run");
  });

  it("is deterministic across calls", () => {
    const r1 = buildScreeningReport(TN, ADY)!;
    const r2 = buildScreeningReport(TN, ADY)!;
    expect(r1).toEqual(r2);
  });

  it("keeps mechanisms ranked with the strongest first and linked evidence", () => {
    const report = buildScreeningReport(AN, ADY)!;
    const scores = report.mechanisms.map((m) => m.score as number);
    expect(scores).toEqual([...scores].sort((x, y) => y - x));
    expect(report.investigation.strongest_mechanism).toBe(report.mechanisms[0].mechanism_type);
    for (const m of report.mechanisms) {
      expect((m.supporting_evidence_ids as string[]).length).toBeGreaterThan(0);
    }
    // graph edges reference real evidence ids
    const evIds = new Set(report.evidence.map((e) => e.id));
    for (const edge of report.graph.edges as any[]) {
      for (const id of edge.evidence_ids) expect(evIds.has(id)).toBe(true);
      // MechanismGraph renders edge.label and styles by support_score
      expect(typeof edge.label).toBe("string");
      expect(edge.label.length).toBeGreaterThan(0);
      expect(typeof edge.support_score).toBe("number");
    }
  });

  it("differs between pairs and mirrors profile differences", () => {
    const anAdy = buildScreeningReport(AN, ADY)!;
    const tnVel = buildScreeningReport(TN, VEL)!;
    expect(anAdy.investigation.id).not.toBe(tnVel.investigation.id);
    // AN (0.84 builtup) vs ADY (0.72) has a smaller runoff signal than
    // TN (0.91) vs VEL (0.65)
    const runoff = (r: any) =>
      r.mechanisms.find((m: any) => m.mechanism_type === "RUNOFF_CONCENTRATION").score;
    expect(runoff(tnVel)).toBeGreaterThan(runoff(anAdy));
  });
});
