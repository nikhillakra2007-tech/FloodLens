"use client";

import { CircleMarker, Popup } from "react-leaflet";
import type { FloodObservation } from "@/lib/types/map";

interface FloodObservationLayerProps {
  observations: FloodObservation[];
}

export default function FloodObservationLayer({ observations }: FloodObservationLayerProps) {
  if (observations.length === 0) return null;

  return (
    <>
      {observations.map((obs) => {
        if (obs.longitude === null || obs.latitude === null) return null;

        const radius = obs.severity === "high" ? 10 : 6;

        return (
          <CircleMarker
            key={obs.id}
            center={[obs.latitude, obs.longitude]}
            radius={radius}
            pathOptions={{
              color: "#dc2626",
              fillColor: "#dc2626",
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>Flood Observation</strong>
                <br />
                Severity: {obs.severity || "—"}
                <br />
                Depth: {obs.depth_cm !== null ? `${obs.depth_cm} cm` : "—"}
                <br />
                Ward: {obs.ward || "—"}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
