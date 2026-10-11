import { NextRequest, NextResponse } from "next/server";
import mockData from "@/lib/mockData.json";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const path = slug.join("/");
  const url = new URL(request.url);

  // 1. Places list: /locations/places
  if (path === "locations/places") {
    return NextResponse.json(mockData.places);
  }

  // 2. Specific place comparables: /locations/places/[id]/comparables
  if (slug[0] === "locations" && slug[1] === "places" && slug[3] === "comparables") {
    const targetId = slug[2];
    const targetPlace = mockData.places.find((p) => p.id === targetId) ?? mockData.places[0];
    const comparables = mockData.places
      .filter((p) => p.id !== targetPlace.id)
      .map((p) => ({
        place: p,
        similarity_score: p.name.includes("Velachery") ? 0.83 : 0.91,
        breakdown: {
          terrain_similarity: 0.84,
          drainage_similarity: 0.86,
          landcover_similarity: 0.91,
          rainfall_similarity: 0.95,
        },
      }));
    return NextResponse.json({
      target_place: targetPlace,
      comparables,
    });
  }

  // 3. Specific place features: /locations/places/[id]/features
  if (slug[0] === "locations" && slug[1] === "places" && slug[3] === "features") {
    const targetId = slug[2];
    const isVelachery = targetId === mockData.places[2]?.id;
    return NextResponse.json({
      place_id: targetId,
      terrain: {
        id: `terr-${targetId}`,
        place_id: targetId,
        mean_elevation: isVelachery ? 4.2 : 6.8,
        min_elevation: isVelachery ? 1.8 : 5.1,
        max_elevation: isVelachery ? 7.5 : 9.2,
        mean_slope: isVelachery ? 0.008 : 0.015,
        hand: isVelachery ? 0.6 : 1.2,
        relative_elevation: isVelachery ? 2.1 : 3.4,
        elevation_mean_m: isVelachery ? 4.2 : 6.8,
        elevation_min_m: isVelachery ? 1.8 : 5.1,
        elevation_max_m: isVelachery ? 7.5 : 9.2,
        mean_slope_degrees: isVelachery ? 0.45 : 0.86,
        hand_m: isVelachery ? 0.6 : 1.2,
        relative_elevation_m: isVelachery ? 2.1 : 3.4,
        source: "SRTM 30m / CartoDEM",
        computation_version: "v2.1",
        created_at: new Date().toISOString(),
      },
      landcover: {
        id: `land-${targetId}`,
        place_id: targetId,
        builtup_fraction: isVelachery ? 0.65 : 0.84,
        vegetation_fraction: isVelachery ? 0.22 : 0.11,
        water_fraction: isVelachery ? 0.13 : 0.05,
        source: "Sentinel-2 Land Cover 10m",
        computation_version: "v2.1",
        created_at: new Date().toISOString(),
      },
      location_features: [],
    });
  }

  // 4. Specific place by ID: /locations/places/[id]
  if (slug[0] === "locations" && slug[1] === "places" && slug.length === 3) {
    const targetId = slug[2];
    const place = mockData.places.find((p) => p.id === targetId) ?? mockData.places[0];
    return NextResponse.json(place);
  }

  // 5. Flood observations
  if (path === "flood-observations" || path === "map/flood-observations") {
    return NextResponse.json(mockData.obs);
  }

  // 6. Map drains & terrain
  if (path === "map/drains") {
    return NextResponse.json(mockData.drains);
  }
  if (path === "map/terrain") {
    return NextResponse.json({
      elevation: 6.8,
      slope: 0.012,
      hand: 1.1,
      source: "CartoDEM 30m",
    });
  }

  // 7. Investigation details: /investigations/[id]
  if (slug[0] === "investigations" && slug.length === 2) {
    const invId = slug[1];
    return NextResponse.json({
      ...mockData.inv,
      id: invId,
      investigation_id: invId,
    });
  }

  // 8. Investigation mechanisms: /investigations/[id]/mechanisms
  if (slug[0] === "investigations" && slug[2] === "mechanisms") {
    return NextResponse.json(mockData.mechs);
  }

  // 9. Investigation evidence: /investigations/[id]/evidence
  if (slug[0] === "investigations" && slug[2] === "evidence") {
    return NextResponse.json(mockData.evs);
  }

  // 10. Investigation graph: /investigations/[id]/graph
  if (slug[0] === "investigations" && slug[2] === "graph") {
    return NextResponse.json(mockData.graph);
  }

  // 11. Investigation validation: /investigations/[id]/validation
  if (slug[0] === "investigations" && slug[2] === "validation") {
    return NextResponse.json(mockData.val);
  }

  // 12. Investigation defensibility: /investigations/[id]/defensibility
  if (slug[0] === "investigations" && slug[2] === "defensibility") {
    return NextResponse.json(mockData.def);
  }

  // 13. Investigation limitations: /investigations/[id]/limitations
  if (slug[0] === "investigations" && slug[2] === "limitations") {
    return NextResponse.json(mockData.lim);
  }

  return NextResponse.json({ error: "Endpoint not found", path }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const path = slug.join("/");
  const url = new URL(request.url);

  // 1. Locations compare: /locations/compare
  if (path === "locations/compare") {
    const placeAId = url.searchParams.get("place_a_id") || mockData.places[0].id;
    const placeBId = url.searchParams.get("place_b_id") || mockData.places[2].id;
    return NextResponse.json({
      ...mockData.compRes,
      place_a_id: placeAId,
      place_b_id: placeBId,
    });
  }

  // 2. Create comparison: /investigations/comparisons
  if (path === "investigations/comparisons") {
    const placeAId = url.searchParams.get("place_a_id") || mockData.places[0].id;
    const placeBId = url.searchParams.get("place_b_id") || mockData.places[2].id;
    return NextResponse.json({
      ...mockData.createComp,
      place_a_id: placeAId,
      place_b_id: placeBId,
    });
  }

  // 3. Create investigation: /investigations
  if (path === "investigations") {
    const comparisonId = url.searchParams.get("comparison_id") || mockData.createComp.id;
    return NextResponse.json({
      ...mockData.createInv,
      comparison_id: comparisonId,
    });
  }

  // 4. Counterfactual simulation: /investigations/[id]/counterfactual
  if (slug[0] === "investigations" && slug[2] === "counterfactual") {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // ignore
    }
    const rainfallRed = body.rainfall_reduction_pct ?? 20;
    const drainageInc = body.drainage_capacity_increase_pct ?? 15;
    const baselineDepth = 75; // cm
    const mitigatedDepth = Math.max(
      8,
      Math.round(baselineDepth * (1 - (rainfallRed * 0.4 + drainageInc * 0.6) / 100))
    );

    return NextResponse.json({
      investigation_id: slug[1],
      scenario_name: "Urban Drainage & Precipitation Intervention",
      baseline_depth_cm: baselineDepth,
      counterfactual_depth_cm: mitigatedDepth,
      depth_delta_cm: mitigatedDepth - baselineDepth,
      risk_reduction_percentage: Math.round(((baselineDepth - mitigatedDepth) / baselineDepth) * 100),
      interventions: {
        rainfall_reduction_pct: rainfallRed,
        drainage_capacity_increase_pct: drainageInc,
      },
      mechanism_deltas: {
        conduit_surcharge: -(drainageInc * 0.8),
        runoff_concentration: -(rainfallRed * 0.7),
        backwater_head_meters: -(drainageInc * 0.02),
      },
      audit_verdict: "HYDRAULIC_MITIGATION_VERIFIED",
    });
  }

  return NextResponse.json({ error: "Endpoint not found", path }, { status: 404 });
}
