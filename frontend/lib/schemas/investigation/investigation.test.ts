import { describe, it, expect } from "vitest";
import { placeSchema, comparisonSchema, mechanismSchema, evidenceItemSchema } from "./investigation";

describe("placeSchema", () => {
  it("validates a correct place", () => {
    const place = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Anna Nagar West",
      ward: "101",
      zone: "Anna Nagar",
      place_type: "point",
      description: "Test location",
      longitude: 80.21,
      latitude: 13.08,
      created_at: "2026-10-09T03:30:00Z",
    };
    expect(placeSchema.safeParse(place).success).toBe(true);
  });

  it("rejects invalid longitude", () => {
    const place = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      longitude: 200,
      latitude: 13.08,
    };
    expect(placeSchema.safeParse(place).success).toBe(false);
  });
});

describe("mechanismSchema", () => {
  it("validates a correct mechanism", () => {
    const mechanism = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      comparison_id: "550e8400-e29b-41d4-a716-446655440001",
      mechanism_type: "IMPERVIOUS_SURFACE",
      score: 0.35,
      confidence: 0.4,
      certainty: "SUPPORTED",
      confidence_meaning: null,
      rank: 3,
      supporting_evidence_ids: [],
      limiting_evidence_ids: [],
      explanation: null,
      signal_values: {},
    };
    expect(mechanismSchema.safeParse(mechanism).success).toBe(true);
  });

  it("rejects invalid certainty level", () => {
    const mechanism = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      comparison_id: "550e8400-e29b-41d4-a716-446655440001",
      mechanism_type: "TEST",
      score: 0.5,
      confidence: 0.5,
      certainty: "INVALID",
      confidence_meaning: null,
      rank: null,
      supporting_evidence_ids: [],
      limiting_evidence_ids: [],
      explanation: null,
      signal_values: {},
    };
    expect(mechanismSchema.safeParse(mechanism).success).toBe(false);
  });
});

describe("evidenceItemSchema", () => {
  it("validates a correct evidence item", () => {
    const item = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      evidence_id: "550e8400-e29b-41d4-a716-446655440000",
      investigation_id: "550e8400-e29b-41d4-a716-446655440001",
      mechanism_type: "IMPERVIOUS_SURFACE",
      certainty_level: "SUPPORTED",
      claim: "Test claim",
      value: 0.13,
      unit: "fraction",
      source: "deterministic_engine",
      source_id: null,
      dataset_version_id: null,
      feature_derivation_id: null,
      spatial_ref: null,
      temporal_ref: null,
      support_score: 0.35,
      explanation: null,
      source_independence: "DEPENDENT_DERIVATION",
      limitations: [],
      extra_data: null,
      created_at: "2026-10-09T03:30:00Z",
    };
    expect(evidenceItemSchema.safeParse(item).success).toBe(true);
  });
});
