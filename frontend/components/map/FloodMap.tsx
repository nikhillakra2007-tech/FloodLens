"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/lib/types/investigation";
import type { FloodObservation } from "@/lib/types/map";
import { CHENNAI_CENTER } from "@/lib/constants";
import FloodObservationLayer from "./layers/FloodObservationLayer";
import MapLayerToggle from "./controls/MapLayerToggle";
import MapLegend from "./controls/MapLegend";

function MapViewController({
  center,
  placeA,
  placeB,
}: {
  center: [number, number];
  placeA?: Place | null;
  placeB?: Place | null;
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size so tiles load smoothly across tab switches and initial dynamic render
    map.invalidateSize();
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map]);

  useEffect(() => {
    if (placeA && placeB) {
      const bounds = L.latLngBounds([
        [placeA.latitude, placeA.longitude],
        [placeB.latitude, placeB.longitude],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true });
    } else if (placeA) {
      map.flyTo([placeA.latitude, placeA.longitude], 13, { duration: 0.8 });
    } else if (placeB) {
      map.flyTo([placeB.latitude, placeB.longitude], 13, { duration: 0.8 });
    } else {
      map.flyTo(center, 12, { duration: 0.8 });
    }
  }, [map, placeA, placeB, center]);

  return null;
}

export interface FloodMapProps {
  places?: Place[];
  selectedPlaceA?: Place | null;
  selectedPlaceB?: Place | null;
  observations?: FloodObservation[];
  onPlaceSelect?: (place: Place) => void;
  onSelectPlaceA?: (place: Place) => void;
  onSelectPlaceB?: (place: Place) => void;
  className?: string;
  initialShowObservations?: boolean;
  initialShowOtherPlaces?: boolean;
  initialShowDrains?: boolean;
  drainageInfo?: {
    wardA?: string;
    wardB?: string;
    note?: string;
  } | null;
}

export default function FloodMap({
  places = [],
  selectedPlaceA,
  selectedPlaceB,
  observations = [],
  onPlaceSelect,
  onSelectPlaceA,
  onSelectPlaceB,
  className,
  initialShowObservations = true,
  initialShowOtherPlaces = true,
  initialShowDrains = false,
  drainageInfo,
}: FloodMapProps) {
  const [mounted, setMounted] = useState(false);
  const [showObservations, setShowObservations] = useState(initialShowObservations);
  const [showOtherPlaces, setShowOtherPlaces] = useState(initialShowOtherPlaces);
  const [showDrains, setShowDrains] = useState(initialShowDrains);

  useEffect(() => {
    setMounted(true);
  }, []);

  const centerCoordinates = useMemo<[number, number]>(() => {
    if (selectedPlaceA && selectedPlaceB) {
      return [
        (selectedPlaceA.latitude + selectedPlaceB.latitude) / 2,
        (selectedPlaceA.longitude + selectedPlaceB.longitude) / 2,
      ];
    }
    if (selectedPlaceA) {
      return [selectedPlaceA.latitude, selectedPlaceA.longitude];
    }
    if (selectedPlaceB) {
      return [selectedPlaceB.latitude, selectedPlaceB.longitude];
    }
    return CHENNAI_CENTER;
  }, [selectedPlaceA, selectedPlaceB]);

  // Determine which places to render based on toggle
  const renderedPlaces = useMemo(() => {
    if (showOtherPlaces) {
      return places;
    }
    return places.filter(
      (p) => p.id === selectedPlaceA?.id || p.id === selectedPlaceB?.id
    );
  }, [places, showOtherPlaces, selectedPlaceA, selectedPlaceB]);

  // Calculate comparative line coordinates
  const comparisonLine = useMemo(() => {
    if (selectedPlaceA && selectedPlaceB) {
      return [
        [selectedPlaceA.latitude, selectedPlaceA.longitude] as [number, number],
        [selectedPlaceB.latitude, selectedPlaceB.longitude] as [number, number],
      ];
    }
    return null;
  }, [selectedPlaceA, selectedPlaceB]);

  if (!mounted) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-[#E8DFD3] bg-[#F5EFE6]">
        <div className="flex items-center gap-3 text-sm font-semibold text-terracotta-700">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
          <span>Initializing Chennai Geospatial Grid...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Layer Toggles & Control Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MapLayerToggle
          label="Flood Inundation Points (2023 & Recent)"
          enabled={showObservations}
          onToggle={setShowObservations}
          description={`${observations.length} verified ground survey points (2023 Cyclone Michaung & 2021)`}
        />
        <MapLayerToggle
          label="Monitored Catchment Wards"
          enabled={showOtherPlaces}
          onToggle={setShowOtherPlaces}
          description={showOtherPlaces ? "Showing all GCC monitoring wards" : "Filtered to A & B targets"}
        />
        <MapLayerToggle
          label="Stormwater Drainage Network"
          enabled={showDrains}
          onToggle={setShowDrains}
          description="GCC SWD conduit attributes"
        />
      </div>

      {/* Notice when drainage is enabled describing architectural boundary */}
      {showDrains && (
        <div className="rounded-xl border border-terracotta-200 bg-terracotta-50/80 p-3.5 text-xs text-terracotta-900" role="status">
          <p className="font-bold text-terracotta-800">Stormwater Drainage Infrastructure Grid:</p>
          <p className="mt-0.5 text-[#554638]">
            {drainageInfo?.note ??
              "GCC Storm Water Drain network attributes are analyzed at the ward catchment scale. Vector line geometries are bounded by the v1 API schema."}
          </p>
          {(drainageInfo?.wardA || drainageInfo?.wardB) && (
            <p className="mt-1 font-mono text-[11px] text-terracotta-700 font-semibold">
              Active analysis wards: {drainageInfo.wardA ? `Ward ${drainageInfo.wardA} (A)` : ""}{" "}
              {drainageInfo.wardB ? `| Ward ${drainageInfo.wardB} (B)` : ""}
            </p>
          )}
        </div>
      )}

      {/* Main Map + Side Legend Layout */}
      <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-[#E8DFD3] shadow-card">
        <MapContainer
          center={centerCoordinates}
          zoom={12}
          className={`z-0 h-full w-full ${className ?? ""}`}
          scrollWheelZoom
        >
          {/* Active View Synchronizer and Resize Invalidator */}
          <MapViewController
            center={centerCoordinates}
            placeA={selectedPlaceA}
            placeB={selectedPlaceB}
          />

          {/* OpenStreetMap Basemap for robust worldwide rendering */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Draw connecting comparative line if both A and B are selected */}
          {comparisonLine && (
            <Polyline
              positions={comparisonLine}
              pathOptions={{
                color: "#C85A17",
                weight: 3.5,
                dashArray: "6, 8",
                opacity: 0.9,
              }}
            />
          )}

          {/* Render Places Layer */}
          {renderedPlaces.map((place) => {
            const isSelectedA = selectedPlaceA?.id === place.id;
            const isSelectedB = selectedPlaceB?.id === place.id;

            return (
              <CircleMarker
                key={place.id}
                center={[place.latitude, place.longitude]}
                radius={isSelectedA || isSelectedB ? 15 : 10}
                pathOptions={{
                  color: isSelectedA ? "#C23E2A" : isSelectedB ? "#3B8352" : "#9E8B75",
                  fillColor: isSelectedA ? "#D44A35" : isSelectedB ? "#469B60" : "#C4B29C",
                  fillOpacity: isSelectedA || isSelectedB ? 0.95 : 0.8,
                  weight: isSelectedA || isSelectedB ? 4 : 2,
                }}
                eventHandlers={{ click: () => onPlaceSelect?.(place) }}
              >
                <Popup>
                  <div className="space-y-2 text-xs text-[#221B15] min-w-[210px] p-0.5">
                    <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-1.5">
                      <div className="font-serif font-bold text-sm text-[#221B15]">{place.name}</div>
                      <span className="rounded-full bg-[#F5EFE6] px-2 py-0.5 font-mono text-[10px] text-[#554638]">
                        Ward {place.ward || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isSelectedA && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-bold text-[#C23E2A] text-[10px] border border-red-300">
                          ✓ Location A (Inundated)
                        </span>
                      )}
                      {isSelectedB && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-[#3B8352] text-[10px] border border-emerald-300">
                          ✓ Location B (Control Twin)
                        </span>
                      )}
                      {!isSelectedA && !isSelectedB && (
                        <span className="text-[#756350] text-[11px]">
                          Zone: <span className="font-semibold text-[#221B15] capitalize">{place.zone ?? "GCC"}</span>
                        </span>
                      )}
                    </div>

                    {place.description && (
                      <p className="text-[#554638] text-[11px] leading-relaxed">
                        {place.description}
                      </p>
                    )}

                    <div className="font-mono text-[10px] text-[#9E8B75]">
                      {place.latitude.toFixed(3)}°N, {place.longitude.toFixed(3)}°E
                    </div>

                    {/* Direct Action Selection Buttons */}
                    <div className="pt-1.5 border-t border-[#E8DFD3] flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectPlaceA) {
                            onSelectPlaceA(place);
                          } else {
                            onPlaceSelect?.(place);
                          }
                        }}
                        className={`w-full text-center py-1.5 px-2.5 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
                          isSelectedA
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-red-50 hover:bg-red-100 text-[#C23E2A] border border-red-200"
                        }`}
                      >
                        {isSelectedA ? "✓ Active Location A" : "📍 Set as Location A (Inundated)"}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectPlaceB) {
                            onSelectPlaceB(place);
                          } else {
                            onPlaceSelect?.(place);
                          }
                        }}
                        className={`w-full text-center py-1.5 px-2.5 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
                          isSelectedB
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-emerald-50 hover:bg-emerald-100 text-[#3B8352] border border-emerald-200"
                        }`}
                      >
                        {isSelectedB ? "✓ Active Location B" : "📍 Set as Location B (Control Twin)"}
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Render Verified Flood Observations Layer */}
          {showObservations && (
            <FloodObservationLayer observations={observations} />
          )}
        </MapContainer>

        {/* Legend positioned in top-right corner of map */}
        <div className="absolute right-4 top-4 z-[1000] max-w-xs shadow-lift">
          <MapLegend
            showObservations={showObservations}
            showDrains={showDrains}
          />
        </div>

        {/* Coords / map hint overlay at bottom left */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-[#E8DFD3] bg-white/95 px-3 py-1.5 text-[11px] font-mono text-[#554638] shadow-sm backdrop-blur-md">
          {selectedPlaceA && selectedPlaceB ? (
            <span className="font-semibold text-terracotta-700">
              Active Comparative Axis: {selectedPlaceA.name} ↔ {selectedPlaceB.name}
            </span>
          ) : (
            <span>Chennai Catchment Grid · Click markers to select</span>
          )}
        </div>
      </div>
    </div>
  );
}
