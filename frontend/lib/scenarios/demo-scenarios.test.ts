import { describe, it, expect } from "vitest";
import { DEMO_SCENARIOS } from "@/lib/scenarios/demo-scenarios";
import { getTwinSimilarity } from "@/lib/scoring/twin-similarity";
import mockData from "@/lib/mockData.json";

const [annaNagar, tNagar, velachery, adyar] = [
  "9abecc5c-df2a-49ab-a089-1a8bd5244ff4",
  "1ea309cc-6461-493e-b4aa-412ea3474676",
  "b0aa192d-6cc8-4262-97b7-07cd5de2d9a8",
  "e503e3f2-28ba-46b0-8f7d-27aa3001f7be",
];

describe("demo scenarios honesty contract", () => {
  it("has exactly one calibrated scenario: Anna Nagar vs Velachery", () => {
    const calibrated = DEMO_SCENARIOS.filter((s) => s.dataStatus === "calibrated");
    expect(calibrated).toHaveLength(1);
    expect(calibrated[0].id).toBe("anna-nagar-velachery");
  });

  it("calibrated scenario matches the calibrated run records", () => {
    const s = DEMO_SCENARIOS[0];
    expect(s.similarityPct).toBeCloseTo(mockData.compRes.similarity_score * 100, 1);
    expect(s.verdict).toBe("DEFENSIBLE WITH MATERIAL LIMITATIONS");
    expect(s.primaryMechanism).toBe("Runoff Concentration");
    expect(mockData.inv.strongest_mechanism).toBe("RUNOFF_CONCENTRATION");
    expect(mockData.def.verdict).toBe("DEFENSIBLE_WITH_MATERIAL_LIMITATIONS");
    // Rank confidence values come from the calibrated mechanism list.
    const mechByRank = (rank: number) => mockData.mechs.find((m) => m.rank === rank);
    expect(s.ranks[0].confidencePct).toBe((mechByRank(1)?.confidence ?? 0) * 100);
    expect(s.ranks[1].confidencePct).toBe((mechByRank(2)?.confidence ?? 0) * 100);
    expect(s.ranks[2].confidencePct).toBe((mechByRank(3)?.confidence ?? 0) * 100);
  });

  it("illustrative scenario fitness matches the compare API screening estimate", () => {
    const s = DEMO_SCENARIOS.find((x) => x.id === "t-nagar-adyar")!;
    const screening = getTwinSimilarity(tNagar, adyar);
    expect(s.dataStatus).toBe("illustrative");
    expect(s.similarityPct).toBeCloseTo(screening.similarity_score * 100, 0);
    expect(s.verdict).not.toContain("DEFENSIBLE");
    expect(s.confidencePct).toBeNull();
    expect(s.disclaimer).toContain("no calibrated run");
    expect(s.consolePairParam).toBe("t-nagar-adyar");
  });

  it("concept scenario carries no scores at all", () => {
    const s = DEMO_SCENARIOS.find((x) => x.id === "mylapore-foreshore")!;
    expect(s.dataStatus).toBe("concept");
    expect(s.similarityPct).toBeNull();
    expect(s.confidencePct).toBeNull();
    expect(s.verdict).not.toContain("DEFENSIBLE");
    expect(s.consolePairParam).toBeNull();
    for (const r of s.ranks) expect(r.confidencePct).toBeNull();
  });

  it("no scenario outside the calibrated pair claims a calibrated verdict", () => {
    for (const s of DEMO_SCENARIOS.filter((x) => x.dataStatus !== "calibrated")) {
      expect(s.verdict).not.toContain("DEFENSIBLE");
      expect(s.confidencePct).toBeNull();
      expect(s.disclaimer).toBeTruthy();
    }
  });

  it("uses the calibrated pair's wards for the calibrated scenario", () => {
    const s = DEMO_SCENARIOS[0];
    const calibrated = getTwinSimilarity(annaNagar, velachery);
    expect(calibrated.is_calibrated).toBe(true);
    expect(s.nameA).toContain("Anna Nagar");
    expect(s.nameB).toContain("Velachery");
  });
});
