import { describe, it, expect } from "vitest";
import { deriveCounterfactualBaseline } from "./counterfactual-baseline";

const ANNA_NAGAR = "9abecc5c-df2a-49ab-a089-1a8bd5244ff4"; // calibrated, builtup 0.84
const T_NAGAR = "1ea309cc-6461-493e-b4aa-412ea3474676"; // illustrative, builtup 0.91

describe("deriveCounterfactualBaseline", () => {
  it("returns null for missing or unknown wards", () => {
    expect(deriveCounterfactualBaseline(null)).toBeNull();
    expect(deriveCounterfactualBaseline(undefined)).toBeNull();
    expect(deriveCounterfactualBaseline("not-a-ward")).toBeNull();
  });

  it("derives runoff coefficient with the documented rational-method rule", () => {
    const b = deriveCounterfactualBaseline(ANNA_NAGAR);
    expect(b).not.toBeNull();
    // C = 0.05 + 0.9 * 0.84 = 0.806 -> 0.81
    expect(b!.runoff_coefficient).toBeCloseTo(0.81, 2);
    expect(b!.upstream_impervious_fraction).toBe(0.84);
    expect(b!.wardName).toBe("Anna Nagar");
  });

  it("keeps every derived value inside the form's valid ranges", () => {
    for (const id of [ANNA_NAGAR, T_NAGAR]) {
      const b = deriveCounterfactualBaseline(id)!;
      expect(b.runoff_coefficient).toBeGreaterThan(0);
      expect(b.runoff_coefficient).toBeLessThanOrEqual(1);
      expect(b.upstream_impervious_fraction).toBeGreaterThan(0);
      expect(b.upstream_impervious_fraction).toBeLessThanOrEqual(1);
    }
  });

  it("labels the ward data status honestly in the note", () => {
    const calibrated = deriveCounterfactualBaseline(ANNA_NAGAR)!;
    expect(calibrated.note).toContain("calibrated demo dataset");
    const illustrative = deriveCounterfactualBaseline(T_NAGAR)!;
    expect(illustrative.note).toContain("illustrative demo input");
    // The derivation rule and its estimate status must be disclosed.
    expect(illustrative.note).toContain("0.05 + 0.9");
    expect(illustrative.note).toContain("derived estimate, not a measurement");
  });
});
