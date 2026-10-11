import { fetchApi, buildQueryString } from "@/lib/api/client";
import type { MapDrainsResponse, MapFloodObservationsResponse, MapTerrain, FloodObservation } from "@/lib/types/map";

export function getMapDrains(lon: number, lat: number, radiusM = 2000): Promise<MapDrainsResponse> {
  return fetchApi<MapDrainsResponse>(
    `/map/drains${buildQueryString({ lon, lat, radius_m: radiusM })}`
  );
}

export function getMapFloodObservations(
  lon: number,
  lat: number,
  radiusM = 3000
): Promise<MapFloodObservationsResponse> {
  return fetchApi<MapFloodObservationsResponse>(
    `/map/flood-observations${buildQueryString({ lon, lat, radius_m: radiusM })}`
  );
}

export function getFloodObservations(limit = 100): Promise<FloodObservation[]> {
  return fetchApi<FloodObservation[]>(`/flood-observations${buildQueryString({ limit })}`);
}

export function getMapTerrain(lon: number, lat: number): Promise<MapTerrain> {
  return fetchApi<MapTerrain>(`/map/terrain${buildQueryString({ lon, lat })}`);
}
