import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge", () => {
  it("renders label text", () => {
    render(<Badge label="FACT" variant="certainty" value="FACT" />);
    expect(screen.getByText("FACT")).toBeTruthy();
  });

  it("applies correct style for FACT certainty", () => {
    const { container } = render(<Badge label="FACT" variant="certainty" value="FACT" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("text-green-700");
  });

  it("applies correct style for UNKNOWN certainty", () => {
    const { container } = render(<Badge label="UNKNOWN" variant="certainty" value="UNKNOWN" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("text-gray-700");
  });

  it("applies correct style for HIGH severity", () => {
    const { container } = render(<Badge label="HIGH" variant="severity" value="HIGH" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("text-red-700");
  });
});
