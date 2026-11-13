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
import { getComparablesForPlace } from "@/lib/scoring/twin-similarity";
import { buildWardFeatures } from "@/lib/scoring/ward-profiles";
import { buildClaimProvenance } from "@/lib/provenance/claim-provenance";

function getFallbackData<T>(path: string, options?: RequestInit): T {
  const cleanPath = path.split("?")[0];

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
  if (cleanPath === "/flood-observations" || cleanPath === "/map/flood-observations") {
    return mockData.obs as unknown as T;
  }
  if (cleanPath === "/map/drains") {
    return mockData.drains as unknown as T;
  }
  if (cleanPath === "/map/terrain") {
    return { elevation: 6.8, slope: 0.012, hand: 1.1 } as unknown as T;
  }
  if (cleanPath.endsWith("/mechanisms")) {
    return mockData.mechs as unknown as T;
  }
  if (cleanPath.endsWith("/provenance") && cleanPath.includes("/evidence/")) {
    const parts = cleanPath.split("/");
    return buildClaimProvenance(parts[2], parts[4]) as unknown as T;
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
  if (cleanPath.startsWith("/investigations/")) {
    const invId = cleanPath.split("/")[2];
    return { ...mockData.inv, id: invId, investigation_id: invId } as unknown as T;
  }

  // Unknown endpoints must fail loudly. Returning an unrelated record here
  // (previously the places list) let typos and unsupported routes pass as
  // real data.
  throw new ApiError(
    "UNKNOWN_ENDPOINT",
    `No calibrated demo response for ${options?.method ?? "GET"} ${cleanPath}`,
    404
  );
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const apiBase = getApiBase();
  const url = `${apiBase}${path}`;
  const method = (options?.method ?? "GET").toUpperCase();
  // Reads may fall back to the calibrated demo dataset when the data service
  // degrades. Mutations never do: a failed write must surface as an error,
  // not as a fabricated success.
  const canFallback = method === "GET" || method === "HEAD";
  try {
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

    if (!res.ok) {
      if (!canFallback) {
        throw new ApiError("REQUEST_FAILED", `${method} ${path} failed with HTTP ${res.status}`, res.status);
      }
      console.warn(`[API] HTTP ${res.status} on ${path}, activating calibrated GCC fallback`);
      return getFallbackData<T>(path, options);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (!canFallback) {
        throw new ApiError("REQUEST_FAILED", `${method} ${path} returned a non-JSON response`, res.status);
      }
      console.warn(`[API] Non-JSON response on ${path}, activating calibrated GCC fallback`);
      return getFallbackData<T>(path, options);
    }

    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (!canFallback) {
      throw new ApiError("NETWORK_ERROR", `${method} ${path} failed: ${err instanceof Error ? err.message : String(err)}`, 0);
    }
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
