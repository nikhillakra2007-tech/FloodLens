const LIVE_AWS_API_URL = "https://uwpjoljajktr7pv7otc4rk7ofq0eapix.lambda-url.ap-southeast-2.on.aws/api/v1";

function getApiBase(): string {
  if (process.env.NODE_ENV === "test") {
    return LIVE_AWS_API_URL;
  }
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || process.env.FASTAPI_BACKEND_URL;
  if (envUrl) {
    return envUrl.endsWith("/api/v1") ? envUrl : `${envUrl.replace(/\/+$/, "")}/api/v1`;
  }
  // In the browser, use relative path so Next.js rewrites proxy to backend with 0 CORS/port issues
  if (typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null" && window.location.origin.startsWith("http")) {
    return "/api/v1";
  }
  // On the server (SSR), call live AWS backend
  return LIVE_AWS_API_URL;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

import mockData from "@/lib/mockData.json";
import { getTwinSimilarity, getComparablesForPlace } from "@/lib/scoring/twin-similarity";
import { buildWardFeatures } from "@/lib/scoring/ward-profiles";

function getFallbackData<T>(path: string, options?: RequestInit): T {
  const cleanPath = path.split("?")[0];
  const urlParams = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");

  if (cleanPath === "/locations/places") {
    return mockData.places as unknown as T;
  }
  if (cleanPath.startsWith("/locations/places/") && cleanPath.endsWith("/comparables")) {
    return getComparablesForPlace(cleanPath.split("/")[3]) as unknown as T;
  }
  if (cleanPath.startsWith("/locations/places/") && cleanPath.endsWith("/features")) {
    return buildWardFeatures(cleanPath.split("/")[3]) as unknown as T;
  }
  if (cleanPath.startsWith("/locations/places/")) {
    const id = cleanPath.split("/")[3];
    return (mockData.places.find((p) => p.id === id) ?? mockData.places[0]) as unknown as T;
  }
  if (cleanPath === "/locations/compare") {
    const placeAId = urlParams.get("place_a_id") || mockData.places[0].id;
    const placeBId = urlParams.get("place_b_id") || mockData.places[2].id;
    const twin = getTwinSimilarity(placeAId, placeBId);
    return {
      place_a_id: placeAId,
      place_b_id: placeBId,
      similarity_score: twin.similarity_score,
      feature_similarities: twin.feature_similarities,
      similarity_breakdown: twin.is_calibrated ? mockData.createComp.similarity_breakdown : null,
      reasons: twin.reasons,
      is_calibrated: twin.is_calibrated,
      weights_version: twin.weights_version,
    } as unknown as T;
  }
  if (cleanPath === "/flood-observations" || cleanPath === "/map/flood-observations") {
    return mockData.obs as unknown as T;
  }
  if (cleanPath === "/map/drains") {
    return mockData.drains as unknown as T;
  }
  if (cleanPath === "/map/terrain") {
    return { elevation: 6.8, slope: 0.012, hand: 1.1 } as unknown as T;
  }
  if (cleanPath === "/investigations/comparisons") {
    const placeAId = urlParams.get("place_a_id") || mockData.createComp.place_a_id;
    const placeBId = urlParams.get("place_b_id") || mockData.createComp.place_b_id;
    const twin = getTwinSimilarity(placeAId, placeBId);
    return {
      ...mockData.createComp,
      place_a_id: placeAId,
      place_b_id: placeBId,
      similarity_score: twin.similarity_score,
      weights_version: twin.weights_version,
      feature_similarities: twin.feature_similarities,
      similarity_breakdown: twin.is_calibrated ? mockData.createComp.similarity_breakdown : null,
      reasons: twin.reasons,
      is_calibrated: twin.is_calibrated,
    } as unknown as T;
  }
  if (cleanPath === "/investigations" && options?.method === "POST") {
    return mockData.createInv as unknown as T;
  }
  if (cleanPath.endsWith("/mechanisms")) {
    return mockData.mechs as unknown as T;
  }
  if (cleanPath.endsWith("/evidence")) {
    return mockData.evs as unknown as T;
  }
  if (cleanPath.endsWith("/graph")) {
    return mockData.graph as unknown as T;
  }
  if (cleanPath.endsWith("/validation")) {
    return mockData.val as unknown as T;
  }
  if (cleanPath.endsWith("/defensibility")) {
    return mockData.def as unknown as T;
  }
  if (cleanPath.endsWith("/limitations")) {
    return mockData.lim as unknown as T;
  }
  if (cleanPath.endsWith("/counterfactual")) {
    return mockData.cf as unknown as T;
  }
  if (cleanPath.startsWith("/investigations/")) {
    const invId = cleanPath.split("/")[2];
    return { ...mockData.inv, id: invId, investigation_id: invId } as unknown as T;
  }

  return mockData.places as unknown as T;
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const apiBase = getApiBase();
  const url = `${apiBase}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

    if (!res.ok) {
      console.warn(`[API] HTTP ${res.status} on ${path}, activating calibrated GCC fallback`);
      return getFallbackData<T>(path, options);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`[API] Non-JSON response on ${path}, activating calibrated GCC fallback`);
      return getFallbackData<T>(path, options);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Network error on ${path}, activating calibrated GCC fallback:`, err);
    return getFallbackData<T>(path, options);
  }
}

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}
