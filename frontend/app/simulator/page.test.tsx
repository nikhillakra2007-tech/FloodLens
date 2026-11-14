import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SimulatorPage from "./page";

describe("SimulatorPage scenario honesty", () => {
  it("shows the calibrated run by default", () => {
    render(<SimulatorPage />);
    expect(screen.getByText("DEFENSIBLE WITH MATERIAL LIMITATIONS")).toBeTruthy();
    expect(screen.getByText("Runoff Concentration")).toBeTruthy();
    expect(screen.getByText("83.2%")).toBeTruthy();
    expect(screen.getByText(/Moderate support/)).toBeTruthy();
    expect(screen.queryByText("ILLUSTRATIVE")).not.toBeTruthy();
  });

  it("labels T Nagar vs Adyar as illustrative with the screening estimate", () => {
    render(<SimulatorPage />);
    fireEvent.click(screen.getByRole("button", { name: /T Nagar vs Adyar/i }));
    expect(screen.getByText("ILLUSTRATIVE")).toBeTruthy();
    expect(screen.getByText("75.6%")).toBeTruthy();
    expect(screen.getAllByText(/no calibrated run/).length).toBeGreaterThan(0);
    expect(screen.queryByText("DEFENSIBLE WITH MATERIAL LIMITATIONS")).not.toBeTruthy();
    // The CTA offers a preview, not a full diagnostic run.
    expect(screen.getByText("Preview This Pair in the Console")).toBeTruthy();
  });

  it("shows the concept scenario with no scores and no console link", () => {
    render(<SimulatorPage />);
    fireEvent.click(screen.getByRole("button", { name: /Mylapore vs Foreshore Estate/i }));
    expect(screen.getByText("CONCEPT")).toBeTruthy();
    expect(screen.getAllByText(/not in the demo dataset/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/DEFENSIBLE/)).not.toBeTruthy();
    expect(screen.queryByRole("link", { name: /Diagnostic Console/i })).not.toBeTruthy();
  });
});
