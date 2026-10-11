import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MechanismCard from "./MechanismCard";
import type { Mechanism } from "@/lib/types/investigation";

const mockMechanism: Mechanism = {
  id: "test-id",
  comparison_id: "comp-id",
  mechanism_type: "IMPERVIOUS_SURFACE",
  score: 0.35,
  confidence: 0.4,
  certainty: "SUPPORTED",
  confidence_meaning: "Bounded to 0.40 confidence",
  rank: 3,
  supporting_evidence_ids: ["ev-1"],
  limiting_evidence_ids: ["ev-2"],
  explanation: "Test explanation",
  signal_values: { builtup_fraction: 0.82 },
};

describe("MechanismCard", () => {
  it("renders mechanism type", () => {
    render(<MechanismCard mechanism={mockMechanism} />);
    expect(screen.getByText("Impervious Surface")).toBeTruthy();
  });

  it("renders rank badge", () => {
    render(<MechanismCard mechanism={mockMechanism} />);
    expect(screen.getByText("#3")).toBeTruthy();
  });

  it("renders certainty badge", () => {
    render(<MechanismCard mechanism={mockMechanism} />);
    expect(screen.getByText("SUPPORTED")).toBeTruthy();
  });

  it("renders confidence meaning", () => {
    render(<MechanismCard mechanism={mockMechanism} />);
    expect(screen.getByText("Bounded to 0.40 confidence")).toBeTruthy();
  });

  it("calls onSelect when clicked", () => {
    const onSelect = vi.fn();
    render(<MechanismCard mechanism={mockMechanism} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(mockMechanism);
  });

  it("shows supporting and limiting evidence counts", () => {
    render(<MechanismCard mechanism={mockMechanism} />);
    expect(screen.getByText("1 supporting")).toBeTruthy();
    expect(screen.getByText("1 limiting")).toBeTruthy();
  });
});
