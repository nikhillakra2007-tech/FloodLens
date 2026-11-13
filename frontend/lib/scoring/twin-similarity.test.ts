import { describe, it, expect } from "vitest";
import mockData from "@/lib/mockData.json";
import { getTwinSimilarity, getComparablesForPlace } from "@/lib/scoring/twin-similarity";
import { getWardProfile, buildWardFeatures } from "@/lib/scoring/ward-profiles";

const [annaNagar, tNagar, velachery, adyar] = mockData.places;

describe("getTwinSimilarity", () => {
  it("returns the stored calibrated run for Anna Nagar vs Velachery", () => {
    const twin = getTwinSimilarity(annaNagar.id, velachery.id);
    expect(twin.is_calibrated).toBe(true);
    expect(twin.weights_version).toBe("phase2_explainable");
    expect(twin.similarity_score).toBeCloseTo(0.832, 3);
    expect(twin.reasons.length).toBeGreaterThan(0);
  });

  it("is symmetric for the calibrated pair", () => {
    const forward = getTwinSimilarity(annaNagar.id, velachery.id);
    const reverse = getTwinSimilarity(velachery.id, annaNagar.id);
    expect(reverse.similarity_score).toBe(forward.similarity_score);
    expect(reverse.is_calibrated).toBe(true);
  });

  it("computes distinct screening estimates for uncalibrated pairs", () => {
    const tNagarAdyar = getTwinSimilarity(tNagar.id, adyar.id);
    const tNagarVelachery = getTwinSimilarity(tNagar.id, velachery.id);
    const annaNagarTNagar = getTwinSimilarity(annaNagar.id, tNagar.id);

    for (const twin of [tNagarAdyar, tNagarVelachery, annaNagarTNagar]) {
      expect(twin.is_calibrated).toBe(false);
      expect(twin.weights_version).toBe("ward_screening_v1");
      expect(twin.similarity_score).toBeGreaterThan(0);
      expect(twin.similarity_score).toBeLessThanOrEqual(1);
    }

    // The whole point of the fix: pairs no longer share one hardcoded score.
    const scores = new Set([
      tNagarAdyar.similarity_score,
      tNagarVelachery.similarity_score,
      annaNagarTNagar.similarity_score,
    ]);
    expect(scores.size).toBeGreaterThan(1);
  });

  it("scores identical wards as a perfect match", () => {
    const twin = getTwinSimilarity(adyar.id, adyar.id);
    expect(twin.similarity_score).toBe(1);
  });

  it("ranks physically closer wards as better twins", () => {
    // Adyar and Velachery are both low-lying wards near water; T Nagar is a
    // dense elevated commercial core, so Adyar should be the better Velachery twin.
    const adyarVel = getTwinSimilarity(adyar.id, velachery.id);
    const tNagarVel = getTwinSimilarity(tNagar.id, velachery.id);
    expect(adyarVel.similarity_score).toBeGreaterThan(tNagarVel.similarity_score);
  });
});

describe("getComparablesForPlace", () => {
  it("returns candidates in the ComparablesResponse shape, best first", () => {
    const { candidates } = getComparablesForPlace(annaNagar.id);
    expect(candidates).toHaveLength(mockData.places.length - 1);
    for (const c of candidates) {
      expect(c.place_id).not.toBe(annaNagar.id);
      expect(typeof c.name).toBe("string");
      expect(c.similarity_score).toBeGreaterThan(0);
      expect(c.feature_similarities).toHaveProperty("terrain");
    }
    for (let i = 1; i < candidates.length; i++) {
      expect(candidates[i - 1].similarity_score).toBeGreaterThanOrEqual(
        candidates[i].similarity_score
      );
    }
  });

  it("keeps the calibrated score on the Anna Nagar vs Velachery candidate", () => {
    const { candidates } = getComparablesForPlace(annaNagar.id);
    const velacheryCandidate = candidates.find((c) => c.place_id === velachery.id);
    expect(velacheryCandidate?.similarity_score).toBeCloseTo(0.832, 3);
  });
});

describe("ward profiles", () => {
  it("gives each calibrated ward its own terrain and land cover", () => {
    const ids = mockData.places.map((p) => p.id);
    const elevations = new Set(ids.map((id) => getWardProfile(id).meanElevationM));
    const builtup = new Set(ids.map((id) => getWardProfile(id).builtupFraction));
    expect(elevations.size).toBe(ids.length);
    expect(builtup.size).toBe(ids.length);
  });

  it("builds a features bundle keyed to the requested ward", () => {
    const bundle = buildWardFeatures(velachery.id);
    expect(bundle.place_id).toBe(velachery.id);
    expect(bundle.terrain.place_id).toBe(velachery.id);
    expect(bundle.landcover.place_id).toBe(velachery.id);
    expect(bundle.terrain.mean_elevation).toBe(getWardProfile(velachery.id).meanElevationM);
    expect(bundle.landcover.water_fraction).toBe(getWardProfile(velachery.id).waterFraction);
  });

  it("falls back to mid-range defaults for an unknown ward", () => {
    const profile = getWardProfile("unknown-ward");
    expect(profile.placeId).toBe("unknown-ward");
    const twin = getTwinSimilarity("unknown-ward", annaNagar.id);
    expect(twin.similarity_score).toBeGreaterThan(0);
    expect(twin.is_calibrated).toBe(false);
  });
});
