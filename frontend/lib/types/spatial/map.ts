export interface MapDrainSegment {
  id: string;
  drain_type: string;
  ward: string | null;
  street_name: string | null;
  is_inferred: boolean;
  length_m: number | null;
}

export interface MapDrainsResponse {
  drains: MapDrainSegment[];
}

export interface MapFloodObservation {
  id: string;
  event_id: string;
  severity: string | null;
  depth_cm: number | null;
  ward: string | null;
}

export interface MapFloodObservationsResponse {
  observations: MapFloodObservation[];
}

export interface MapTerrain {
  elevation_m: number | null;
  slope_degrees: number | null;
  source: string;
  note: string;
}

export interface FloodObservation {
  id: string;
  event_id: string;
  place_id: string | null;
  ward: string | null;
  observed_at: string | null;
  severity: string | null;
  depth_cm: number | null;
  notes: string | null;
  source: string;
  longitude: number | null;
  latitude: number | null;
}
