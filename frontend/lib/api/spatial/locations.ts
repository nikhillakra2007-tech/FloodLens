import { fetchApi, buildQueryString } from "@/lib/api/client";
import type { Place, ComparablesResponse, LocationFeaturesBundle, LocationCompareResponse } from "@/lib/types/investigation";

export function getPlaces(): Promise<Place[]> {
  return fetchApi<Place[]>("/locations/places");
}

export function getPlace(id: string): Promise<Place> {
  return fetchApi<Place>(`/locations/places/${id}`);
}

export function getComparables(id: string, topK = 5): Promise<ComparablesResponse> {
  return fetchApi<ComparablesResponse>(
    `/locations/places/${id}/comparables${buildQueryString({ top_k: topK })}`
  );
}

export function getFeatures(id: string): Promise<LocationFeaturesBundle> {
  return fetchApi<LocationFeaturesBundle>(`/locations/places/${id}/features`);
}

export function compareLocations(placeAId: string, placeBId: string): Promise<LocationCompareResponse> {
  return fetchApi<LocationCompareResponse>(
    `/locations/compare${buildQueryString({ place_a_id: placeAId, place_b_id: placeBId })}`,
    { method: "POST" }
  );
}
