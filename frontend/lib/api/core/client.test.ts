import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchApi, ApiError } from "@/lib/api/core/client";
import mockData from "@/lib/mockData.json";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchApi fallback discipline", () => {
  it("serves calibrated demo data for a failed read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));
    const places = await fetchApi<typeof mockData.places>("/locations/places");
    expect(places).toEqual(mockData.places);
  });

  it("serves a real provenance chain for a failed provenance read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));
    const evidence = mockData.evs[0];
    const prov = await fetchApi<{ chain: unknown[]; claim: string }>(
      `/investigations/inv-1/evidence/${evidence.id}/provenance`
    );
    expect(prov.claim).toBe(evidence.claim);
    expect(prov.chain.length).toBeGreaterThan(0);
  });

  it("throws ApiError for an unknown endpoint instead of returning unrelated data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "not found" }, 404)));
    await expect(fetchApi("/locations/typo-path")).rejects.toMatchObject({
      name: "ApiError",
      code: "UNKNOWN_ENDPOINT",
    });
  });

  it("never fabricates a successful mutation on HTTP failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "boom" }, 500)));
    await expect(
      fetchApi("/investigations/comparisons", { method: "POST" })
    ).rejects.toMatchObject({ name: "ApiError", statusCode: 500 });
  });

  it("never fabricates a successful mutation on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket hangup")));
    await expect(
      fetchApi("/investigations", { method: "POST", body: "{}" })
    ).rejects.toMatchObject({ name: "ApiError", code: "NETWORK_ERROR" });
  });

  it("returns live JSON when the data service answers", async () => {
    const payload = [{ id: "live" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));
    const res = await fetchApi<typeof payload>("/locations/places");
    expect(res).toEqual(payload);
  });

  it("is an Error subclass with code and status", async () => {
    const err = new ApiError("X", "msg", 503);
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(503);
  });
});
