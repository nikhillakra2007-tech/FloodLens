import { describe, it, expect } from "vitest";
import { formatScore, formatPercent, formatConfidence, formatMechanismType, formatCertainty, formatVerdict, formatUnit } from "./formatting";

describe("formatScore", () => {
  it("formats a number to 2 decimal places", () => {
    expect(formatScore(0.812)).toBe("0.81");
  });

  it("returns dash for null", () => {
    expect(formatScore(null)).toBe("—");
  });

  it("returns dash for undefined", () => {
    expect(formatScore(undefined)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("formats positive values with plus sign", () => {
    expect(formatPercent(20.1)).toBe("+20.1%");
  });

  it("formats negative values", () => {
    expect(formatPercent(-15.2)).toBe("-15.2%");
  });

  it("returns dash for null", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatConfidence", () => {
  it("formats as percentage", () => {
    expect(formatConfidence(0.6)).toBe("60%");
  });

  it("returns dash for null", () => {
    expect(formatConfidence(null)).toBe("—");
  });
});

describe("formatMechanismType", () => {
  it("formats mechanism type to title case", () => {
    expect(formatMechanismType("IMPERVIOUS_SURFACE")).toBe("Impervious Surface");
  });

  it("formats unknown types", () => {
    expect(formatMechanismType("UNKNOWN_TYPE")).toBe("Unknown Type");
  });
});

describe("formatCertainty", () => {
  it("formats certainty level", () => {
    expect(formatCertainty("HYPOTHESIS")).toBe("Hypothesis");
  });

  it("returns Unknown for null", () => {
    expect(formatCertainty(null)).toBe("Unknown");
  });
});

describe("formatVerdict", () => {
  it("formats known verdicts", () => {
    expect(formatVerdict("DEFENSIBLE")).toBe("Defensible");
    expect(formatVerdict("DEFENSIBLE_WITH_MATERIAL_LIMITATIONS")).toBe("Defensible with Material Limitations");
  });

  it("returns Unknown for null", () => {
    expect(formatVerdict(null)).toBe("Unknown");
  });
});

describe("formatUnit", () => {
  it("maps units to symbols", () => {
    expect(formatUnit("mm")).toBe("mm");
    expect(formatUnit("m3/s")).toBe("m³/s");
    expect(formatUnit("km2")).toBe("km²");
  });

  it("returns empty string for null", () => {
    expect(formatUnit(null)).toBe("");
  });
});
