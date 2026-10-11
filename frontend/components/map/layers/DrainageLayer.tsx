"use client";

import { CircleMarker, Popup } from "react-leaflet";
import type { MapDrainSegment } from "@/lib/types/map";

interface DrainageLayerProps {
  drains: MapDrainSegment[];
  center: [number, number];
}

export default function DrainageLayer({ drains, center }: DrainageLayerProps) {
  if (drains.length === 0) return null;

  return (
    <>
      {drains.map((drain) => (
        <CircleMarker
          key={drain.id}
          center={[center[0], center[1]]}
          radius={4}
          pathOptions={{
            color: drain.is_inferred ? "#f59e0b" : "#3b82f6",
            fillColor: drain.is_inferred ? "#f59e0b" : "#3b82f6",
            fillOpacity: 0.6,
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>Drain Segment</strong>
              <br />
              Type: {drain.drain_type}
              <br />
              Ward: {drain.ward || "—"}
              {drain.street_name && (
                <>
                  <br />
                  Street: {drain.street_name}
                </>
              )}
              <br />
              Length: {drain.length_m ? `${drain.length_m} m` : "—"}
              <br />
              {drain.is_inferred ? "Inferred geometry" : "Surveyed geometry"}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
