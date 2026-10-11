import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MapLayerToggle from "./MapLayerToggle";

describe("MapLayerToggle", () => {
  it("renders label", () => {
    render(<MapLayerToggle label="Drainage" enabled={false} onToggle={() => {}} />);
    expect(screen.getByText("Drainage")).toBeTruthy();
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(<MapLayerToggle label="Drainage" enabled={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("reflects enabled state", () => {
    render(<MapLayerToggle label="Drainage" enabled={true} onToggle={() => {}} />);
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
  });

  it("shows description when provided", () => {
    render(<MapLayerToggle label="Drainage" enabled={false} onToggle={() => {}} description="Show drain segments" />);
    expect(screen.getByText("Show drain segments")).toBeTruthy();
  });
});
