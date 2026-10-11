import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FloodMap from "./FloodMap";
import type { Place } from "@/lib/types/investigation";
import type { FloodObservation } from "@/lib/types/map";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="circle-marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({
    invalidateSize: vi.fn(),
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
    setView: vi.fn(),
  }),
}));

const mockPlaces: Place[] = [
  {
    id: "p-1",
    name: "Velachery",
    ward: "177",
    zone: "Zone 13",
    place_type: "residential",
    description: "Low-lying residential zone",
    longitude: 80.2184,
    latitude: 12.9791,
    created_at: "2026-10-09T00:00:00Z",
  },
  {
    id: "p-2",
    name: "Adyar",
    ward: "173",
    zone: "Zone 13",
    place_type: "coastal",
    description: "Coastal comparison area",
    longitude: 80.257,
    latitude: 13.0012,
    created_at: "2026-10-09T00:00:00Z",
  },
];

const mockObservations: FloodObservation[] = [
  {
    id: "obs-1",
    event_id: "ev-1",
    place_id: "p-1",
    ward: "177",
    observed_at: "2023-12-04T10:00:00Z",
    severity: "high",
    depth_cm: 75,
    notes: "Deep street waterlogging",
    source: "Field survey",
    longitude: 80.2184,
    latitude: 12.9791,
  },
];

describe("FloodMap", () => {
  it("renders layer toggle switches and legend", () => {
    render(
      <FloodMap
        places={mockPlaces}
        selectedPlaceA={mockPlaces[0]}
        selectedPlaceB={mockPlaces[1]}
        observations={mockObservations}
      />
    );

    expect(screen.getByText(/Flood Inundation Points/i)).toBeTruthy();
    expect(screen.getByText(/Monitored Catchment Wards/i)).toBeTruthy();
    expect(screen.getByText(/Drainage Network/i)).toBeTruthy();
    expect(screen.getByText(/Legend/i)).toBeTruthy();
  });

  it("toggles Flood Observations layer", () => {
    render(
      <FloodMap
        places={mockPlaces}
        selectedPlaceA={mockPlaces[0]}
        selectedPlaceB={mockPlaces[1]}
        observations={mockObservations}
        initialShowObservations={true}
      />
    );

    const toggle = screen.getByRole("switch", { name: /Flood Inundation Points/i });
    expect(toggle.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-checked")).toBe("false");
  });

  it("toggles Drainage Network scope notification", () => {
    render(
      <FloodMap
        places={mockPlaces}
        selectedPlaceA={mockPlaces[0]}
        selectedPlaceB={mockPlaces[1]}
        observations={mockObservations}
        initialShowDrains={false}
      />
    );

    expect(screen.queryByText(/Drainage Infrastructure/i)).toBeNull();

    const drainToggle = screen.getByRole("switch", { name: /Drainage Network/i });
    fireEvent.click(drainToggle);

    expect(screen.getByText(/Drainage Infrastructure/i)).toBeTruthy();
  });

  it("toggles Monitored Locations to focus only on A and B", () => {
    render(
      <FloodMap
        places={mockPlaces}
        selectedPlaceA={mockPlaces[0]}
        selectedPlaceB={mockPlaces[1]}
        observations={mockObservations}
        initialShowOtherPlaces={true}
      />
    );

    const placesToggle = screen.getByRole("switch", { name: /Catchment Wards/i });
    expect(placesToggle.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(placesToggle);
    expect(placesToggle.getAttribute("aria-checked")).toBe("false");
  });
});
