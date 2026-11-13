// Pairwise twin-catchment similarity for the Chennai demo dataset.
//
// Anna Nagar vs Velachery is the calibrated twin pair: its similarity score
// and feature breakdown come from the stored phase-2 calibrated run and are
// returned verbatim. Every other ward pair gets a deterministic screening
// estimate computed from the calibrated ward profiles, flagged with
// is_calibrated = false so the UI can label it as an estimate instead of
// presenting every pair as an 83% fit.

import mockData from "@/lib/mockData.json";
import { getWardProfile } from "@/lib/scoring/ward-profiles";

export interface TwinSimilarity {
  similarity_score: number;
  feature_similarities: Record<string, number>;
  reasons: string[];
  is_calibrated: boolean;
  weights_version: string;
}

const CALIBRATED_A = mockData.compRes.place_a_id;
const CALIBRATED_B = mockData.compRes.place_b_id;

function isCalibratedPair(placeAId: string, placeBId: string): boolean {
  return (
    (placeAId === CALIBRATED_A && placeBId === CALIBRATED_B) ||
    (placeAId === CALIBRATED_B && placeBId === CALIBRATED_A)
  );
}

function calibratedSimilarity(): TwinSimilarity {
  return {
    similarity_score: mockData.compRes.similarity_score,
    feature_similarities: { ...mockData.compRes.feature_similarities },
    reasons: [...mockData.compRes.reasons],
    is_calibrated: true,
    weights_version: "phase2_explainable",
  };
}

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// Similarity of two measurements: 1 when identical, 0 when they differ by
// the tolerance or more.
function axisSimilarity(a: number, b: number, tolerance: number): number {
  return Math.max(0, 1 - Math.abs(a - b) / tolerance);
}

function round3(x: number): number {
  return Math.round(x * 1000) / 1000;
}

// Same-storm rainfall alignment: all four calibrated wards were hit by the
// 2023 Cyclone Michaung cloudburst (~390mm), so storm forcing is treated as
// held constant across pairs (±2% gauge spread).
const RAINFALL_SIMILARITY = 0.98;

const WEIGHTS = {
  terrain: 0.3,
  land_cover: 0.25,
  drainage_context: 0.2,
  hand_elevation: 0.1,
  waterbody_proximity: 0.05,
  rainfall: 0.1,
} as const;

function screeningSimilarity(placeAId: string, placeBId: string): TwinSimilarity {
  const a = getWardProfile(placeAId);
  const b = getWardProfile(placeBId);
  const placeA = mockData.places.find((p) => p.id === placeAId);
  const placeB = mockData.places.find((p) => p.id === placeBId);

  const terrain =
    (axisSimilarity(a.meanElevationM, b.meanElevationM, 8) +
      axisSimilarity(a.meanSlope, b.meanSlope, 0.03)) /
    2;
  const handElevation = axisSimilarity(a.handM, b.handM, 3);
  const landCover =
    (axisSimilarity(a.builtupFraction, b.builtupFraction, 0.6) +
      axisSimilarity(a.vegetationFraction, b.vegetationFraction, 0.6) +
      axisSimilarity(a.waterFraction, b.waterFraction, 0.4)) /
    3;
  const drainageContext = axisSimilarity(
    a.drainDensityKmPerKm2,
    b.drainDensityKmPerKm2,
    3
  );
  const waterbodyProximity = axisSimilarity(a.waterbodyDistanceM, b.waterbodyDistanceM, 2000);

  const featureSimilarities: Record<string, number> = {
    terrain: round3(terrain),
    rainfall: RAINFALL_SIMILARITY,
    land_cover: round3(landCover),
    hand_elevation: round3(handElevation),
    drainage_context: round3(drainageContext),
    waterbody_proximity: round3(waterbodyProximity),
  };

  const score =
    WEIGHTS.terrain * terrain +
    WEIGHTS.land_cover * landCover +
    WEIGHTS.drainage_context * drainageContext +
    WEIGHTS.hand_elevation * handElevation +
    WEIGHTS.waterbody_proximity * waterbodyProximity +
    WEIGHTS.rainfall * RAINFALL_SIMILARITY;

  const reasons: string[] = [];
  if (placeA && placeB) {
    const dist = haversineKm(placeA, placeB);
    if (dist < 8) {
      reasons.push(`Close geographic proximity (${dist.toFixed(1)} km)`);
    } else {
      reasons.push(`Moderate geographic separation (${dist.toFixed(1)} km)`);
    }
  }
  reasons.push("Comparable storm rainfall forcing");
  if (terrain >= 0.8) reasons.push(`Similar terrain (similarity=${terrain.toFixed(2)})`);
  if (landCover >= 0.8) reasons.push(`Similar land_cover (similarity=${landCover.toFixed(2)})`);
  if (drainageContext >= 0.8) {
    reasons.push(`Similar drainage_context (similarity=${drainageContext.toFixed(2)})`);
  }
  if (score < 0.75) {
    reasons.push("Limited topographic alignment; screening estimate only");
  }

  return {
    similarity_score: round3(score),
    feature_similarities: featureSimilarities,
    reasons,
    is_calibrated: false,
    weights_version: "ward_screening_v1",
  };
}

export function getTwinSimilarity(placeAId: string, placeBId: string): TwinSimilarity {
  if (placeAId === placeBId) {
    return {
      similarity_score: 1,
      feature_similarities: {
        terrain: 1,
        rainfall: RAINFALL_SIMILARITY,
        land_cover: 1,
        hand_elevation: 1,
        drainage_context: 1,
        waterbody_proximity: 1,
      },
      reasons: ["Identical catchment"],
      is_calibrated: false,
      weights_version: "ward_screening_v1",
    };
  }
  return isCalibratedPair(placeAId, placeBId)
    ? calibratedSimilarity()
    : screeningSimilarity(placeAId, placeBId);
}

// Comparables candidate list for one target ward, best twin first, matching
// the ComparablesResponse shape the console dropdown reads.
export function getComparablesForPlace(targetPlaceId: string) {
  const target = mockData.places.find((p) => p.id === targetPlaceId) ?? mockData.places[0];
  const candidates = mockData.places
    .filter((p) => p.id !== target.id)
    .map((p) => {
      const twin = getTwinSimilarity(target.id, p.id);
      return {
        place_id: p.id,
        name: p.name,
        similarity_score: twin.similarity_score,
        feature_similarities: twin.feature_similarities,
      };
    })
    .sort((a, b) => b.similarity_score - a.similarity_score);
  return { candidates };
}
