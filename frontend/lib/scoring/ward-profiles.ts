// Ward screening profiles for the Greater Chennai demo dataset.
//
// Provenance audit (2026-11-14):
// - Anna Nagar and Velachery terrain/land-cover values ship with the repo's
//   calibrated demo dataset (they are the values the original
//   /locations/places/[id]/features handler served, sourced per the repo's
//   DATA_INVENTORY.md from Copernicus DEM GLO-30 and ESA WorldCover 10m
//   extractions over a 500m analysis window).
// - T Nagar and Adyar values are ILLUSTRATIVE DEMO INPUT: the extracted
//   rasters for those wards live in the backend's raw CSVs / PostGIS, which
//   are not in this repo, so these numbers are plausible stand-ins, not
//   measurements. They are labeled illustrative everywhere they surface.
// - drainDensityKmPerKm2 and waterbodyDistanceM are illustrative for ALL
//   wards: no traceable extraction ships in the repo.
// - created_at on served feature bundles is the static dataset build time,
//   not the request time.

export type WardDataStatus = "calibrated_demo_dataset" | "illustrative_demo_input";

export interface WardProfile {
  placeId: string;
  dataStatus: WardDataStatus;
  meanElevationM: number;
  minElevationM: number;
  maxElevationM: number;
  meanSlope: number;
  meanSlopeDegrees: number;
  handM: number;
  relativeElevationM: number;
  builtupFraction: number;
  vegetationFraction: number;
  waterFraction: number;
  drainDensityKmPerKm2: number;
  waterbodyDistanceM: number;
}

// Fields with no traceable source in the repo for any ward.
export const ILLUSTRATIVE_PROFILE_FIELDS = [
  "drainDensityKmPerKm2",
  "waterbodyDistanceM",
] as const;

// Static build time of the demo dataset (matches mockData.places created_at).
// Served as-is; the request time is never presented as measurement time.
export const DATASET_BUILT_AT = "2026-10-09T01:33:09.466380+05:30";

const CALIBRATED_TERRAIN_SOURCE = "SRTM 30m / CartoDEM (demo dataset extraction)";
const CALIBRATED_LANDCOVER_SOURCE = "Sentinel-2 Land Cover 10m (demo dataset extraction)";
const ILLUSTRATIVE_SOURCE = "Illustrative demo input - no extracted source ships in the repo";

export const WARD_PROFILES: Record<string, WardProfile> = {
  // Anna Nagar (Ward 101) - values ship with the repo's calibrated demo dataset
  "9abecc5c-df2a-49ab-a089-1a8bd5244ff4": {
    placeId: "9abecc5c-df2a-49ab-a089-1a8bd5244ff4",
    dataStatus: "calibrated_demo_dataset",
    meanElevationM: 6.8,
    minElevationM: 5.1,
    maxElevationM: 9.2,
    meanSlope: 0.015,
    meanSlopeDegrees: 0.86,
    handM: 1.2,
    relativeElevationM: 3.4,
    builtupFraction: 0.84,
    vegetationFraction: 0.11,
    waterFraction: 0.05,
    drainDensityKmPerKm2: 3.1, // illustrative
    waterbodyDistanceM: 900, // illustrative
  },
  // T Nagar (Ward 104) - ILLUSTRATIVE: extracted values are not in the repo
  "1ea309cc-6461-493e-b4aa-412ea3474676": {
    placeId: "1ea309cc-6461-493e-b4aa-412ea3474676",
    dataStatus: "illustrative_demo_input",
    meanElevationM: 7.6,
    minElevationM: 6.2,
    maxElevationM: 10.1,
    meanSlope: 0.017,
    meanSlopeDegrees: 0.97,
    handM: 1.6,
    relativeElevationM: 4.0,
    builtupFraction: 0.91,
    vegetationFraction: 0.06,
    waterFraction: 0.03,
    drainDensityKmPerKm2: 3.6, // illustrative
    waterbodyDistanceM: 1500, // illustrative
  },
  // Velachery (Ward 102) - values ship with the repo's calibrated demo dataset
  "b0aa192d-6cc8-4262-97b7-07cd5de2d9a8": {
    placeId: "b0aa192d-6cc8-4262-97b7-07cd5de2d9a8",
    dataStatus: "calibrated_demo_dataset",
    meanElevationM: 4.2,
    minElevationM: 1.8,
    maxElevationM: 7.5,
    meanSlope: 0.008,
    meanSlopeDegrees: 0.45,
    handM: 0.6,
    relativeElevationM: 2.1,
    builtupFraction: 0.65,
    vegetationFraction: 0.22,
    waterFraction: 0.13,
    drainDensityKmPerKm2: 2.3, // illustrative
    waterbodyDistanceM: 250, // illustrative
  },
  // Adyar (Ward 103) - ILLUSTRATIVE: extracted values are not in the repo
  "e503e3f2-28ba-46b0-8f7d-27aa3001f7be": {
    placeId: "e503e3f2-28ba-46b0-8f7d-27aa3001f7be",
    dataStatus: "illustrative_demo_input",
    meanElevationM: 5.4,
    minElevationM: 3.9,
    maxElevationM: 8.4,
    meanSlope: 0.011,
    meanSlopeDegrees: 0.63,
    handM: 0.8,
    relativeElevationM: 2.8,
    builtupFraction: 0.72,
    vegetationFraction: 0.19,
    waterFraction: 0.09,
    drainDensityKmPerKm2: 2.8, // illustrative
    waterbodyDistanceM: 150, // illustrative
  },
};

export function getWardProfile(placeId: string): WardProfile | null {
  return WARD_PROFILES[placeId] ?? null;
}

// Terrain + land-cover feature bundle for one ward, matching the shape the
// /locations/places/[id]/features endpoint serves. Returns null for a ward
// with no profile so callers can fail clearly instead of inventing data.
export function buildWardFeatures(placeId: string) {
  const p = getWardProfile(placeId);
  if (!p) return null;
  const calibrated = p.dataStatus === "calibrated_demo_dataset";
  return {
    place_id: placeId,
    data_status: p.dataStatus,
    terrain: {
      id: `terr-${placeId}`,
      place_id: placeId,
      mean_elevation: p.meanElevationM,
      min_elevation: p.minElevationM,
      max_elevation: p.maxElevationM,
      mean_slope: p.meanSlope,
      hand: p.handM,
      relative_elevation: p.relativeElevationM,
      elevation_mean_m: p.meanElevationM,
      elevation_min_m: p.minElevationM,
      elevation_max_m: p.maxElevationM,
      mean_slope_degrees: p.meanSlopeDegrees,
      hand_m: p.handM,
      relative_elevation_m: p.relativeElevationM,
      source: calibrated ? CALIBRATED_TERRAIN_SOURCE : ILLUSTRATIVE_SOURCE,
      data_status: p.dataStatus,
      computation_version: "v2.1",
      created_at: DATASET_BUILT_AT,
    },
    landcover: {
      id: `land-${placeId}`,
      place_id: placeId,
      builtup_fraction: p.builtupFraction,
      vegetation_fraction: p.vegetationFraction,
      water_fraction: p.waterFraction,
      source: calibrated ? CALIBRATED_LANDCOVER_SOURCE : ILLUSTRATIVE_SOURCE,
      data_status: p.dataStatus,
      computation_version: "v2.1",
      created_at: DATASET_BUILT_AT,
    },
    location_features: [],
  };
}
