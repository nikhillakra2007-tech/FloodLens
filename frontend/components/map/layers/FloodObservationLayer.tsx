"use client";

import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { FloodObservation } from "@/lib/types/map";

interface FloodObservationLayerProps {
  observations: FloodObservation[];
}

function createObsPinIcon(isHigh: boolean) {
  const size = isHigh ? 22 : 18;
  const height = Math.round(size * 1.3);
  const color = isHigh ? "#DC2626" : "#E05D44";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 26" width="${size}" height="${height}" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));">
      <path d="M10 0C4.48 0 0 4.48 0 10c0 7.2 10 16 10 16s10-8.8 10-16c0-5.52-4.48-10-10-10z" fill="${color}" stroke="#FFFFFF" stroke-width="1.2"/>
      <circle cx="10" cy="9.5" r="3.5" fill="#FFFFFF"/>
      <circle cx="10" cy="9.5" r="1.8" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "obs-pinpoint-icon",
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 2],
  });
}

export default function FloodObservationLayer({ observations }: FloodObservationLayerProps) {
  const highPin = useMemo(() => createObsPinIcon(true), []);
  const normPin = useMemo(() => createObsPinIcon(false), []);

  // Deduplicate observations to ensure only 1 pinpoint per location (merging clustered survey points into max depth)
  const uniqueObservations = useMemo(() => {
    if (!observations || observations.length === 0) return [];
    const result: FloodObservation[] = [];
    const minDistanceThresholdDeg = 0.007; // ~770 meters

    for (const obs of observations) {
      if (obs.latitude === null || obs.longitude === null) continue;

      const existingIdx = result.findIndex((item) => {
        if (item.latitude === null || item.longitude === null) return false;
        if (item.ward && obs.ward && item.ward === obs.ward) return true;
        const dLat = item.latitude - obs.latitude!;
        const dLon = item.longitude - obs.longitude!;
        return Math.sqrt(dLat * dLat + dLon * dLon) < minDistanceThresholdDeg;
      });

      if (existingIdx >= 0) {
        // Retain the higher inundation depth observation for this location
        const existing = result[existingIdx];
        if ((obs.depth_cm ?? 0) > (existing.depth_cm ?? 0)) {
          result[existingIdx] = obs;
        }
      } else {
        result.push(obs);
      }
    }
    return result;
  }, [observations]);

  if (uniqueObservations.length === 0) return null;

  return (
    <>
      {uniqueObservations.map((obs) => {
        if (obs.longitude === null || obs.latitude === null) return null;

        const isHigh = obs.severity === "high";

        return (
          <Marker
            key={obs.id}
            position={[obs.latitude, obs.longitude]}
            icon={isHigh ? highPin : normPin}
          >
            <Popup>
              <div className="text-xs p-0.5 space-y-1">
                <div className="font-serif font-bold text-sm text-[#221B15] border-b border-[#E8DFD3] pb-1">
                  Flood Observation
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#554638]">Severity:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isHigh ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                    {obs.severity || "Standard"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#554638]">Inundation Depth:</span>
                  <span className="font-mono font-bold text-red-700">
                    {obs.depth_cm !== null ? `${obs.depth_cm} cm` : "—"}
                  </span>
                </div>
                {obs.ward && (
                  <div className="text-[11px] text-[#756350]">
                    Ward: {obs.ward}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
