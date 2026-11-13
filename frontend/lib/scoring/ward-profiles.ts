// Calibrated ward screening profiles for the Greater Chennai demo dataset.
//
// Each profile carries the physical catchment attributes the twin-matching
// model screens on: terrain (SRTM 30m / CartoDEM), land cover (Sentinel-2
// 10m), stormwater drain density and proximity to the nearest major
// waterbody. The hosted demo ships these four calibrated wards; a live
// FastAPI backend computes the same features from rasters at request time.

export interface WardProfile {
  placeId: string;
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

export const WARD_PROFILES: Record<string, WardProfile> = {
  // Anna Nagar (Ward 101)
  "9abecc5c-df2a-49ab-a089-1a8bd5244ff4": {
    placeId: "9abecc5c-df2a-49ab-a089-1a8bd5244ff4",
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
    drainDensityKmPerKm2: 3.1,
    waterbodyDistanceM: 900,
  },
  // T Nagar (Ward 104)
  "1ea309cc-6461-493e-b4aa-412ea3474676": {
    placeId: "1ea309cc-6461-493e-b4aa-412ea3474676",
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
    drainDensityKmPerKm2: 3.6,
    waterbodyDistanceM: 1500,
  },
  // Velachery (Ward 102)
  "b0aa192d-6cc8-4262-97b7-07cd5de2d9a8": {
    placeId: "b0aa192d-6cc8-4262-97b7-07cd5de2d9a8",
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
    drainDensityKmPerKm2: 2.3,
    waterbodyDistanceM: 250,
  },
  // Adyar (Ward 103)
  "e503e3f2-28ba-46b0-8f7d-27aa3001f7be": {
    placeId: "e503e3f2-28ba-46b0-8f7d-27aa3001f7be",
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
    drainDensityKmPerKm2: 2.8,
    waterbodyDistanceM: 150,
  },
};

// Fallback for wards without a calibrated screening profile: mid-range
// values so an unknown ward scores near the middle of every axis instead
// of silently inheriting another ward's terrain.
export const DEFAULT_WARD_PROFILE: Omit<WardProfile, "placeId"> = {
  meanElevationM: 6.0,
  minElevationM: 4.0,
  maxElevationM: 9.0,
  meanSlope: 0.012,
  meanSlopeDegrees: 0.7,
  handM: 1.0,
  relativeElevationM: 3.0,
  builtupFraction: 0.78,
  vegetationFraction: 0.15,
  waterFraction: 0.07,
  drainDensityKmPerKm2: 3.0,
  waterbodyDistanceM: 800,
};

export function getWardProfile(placeId: string): WardProfile {
  return WARD_PROFILES[placeId] ?? { placeId, ...DEFAULT_WARD_PROFILE };
}

// Terrain + land-cover feature bundle for one ward, matching the shape the
// /locations/places/[id]/features endpoint serves.
export function buildWardFeatures(placeId: string) {
  const p = getWardProfile(placeId);
  const createdAt = new Date().toISOString();
  return {
    place_id: placeId,
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
      source: "SRTM 30m / CartoDEM",
      computation_version: "v2.1",
      created_at: createdAt,
    },
    landcover: {
      id: `land-${placeId}`,
      place_id: placeId,
      builtup_fraction: p.builtupFraction,
      vegetation_fraction: p.vegetationFraction,
      water_fraction: p.waterFraction,
      source: "Sentinel-2 Land Cover 10m",
      computation_version: "v2.1",
      created_at: createdAt,
    },
    location_features: [],
  };
}
