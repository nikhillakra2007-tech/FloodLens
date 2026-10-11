import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders message", () => {
    render(<EmptyState message="No data available" />);
    expect(screen.getByText("No data available")).toBeTruthy();
  });

  it("renders hint when provided", () => {
    render(<EmptyState message="No data" hint="Try again later" />);
    expect(screen.getByText("Try again later")).toBeTruthy();
  });

  it("does not render hint when not provided", () => {
    render(<EmptyState message="No data" />);
    expect(screen.queryByText("Try again later")).toBeNull();
  });
});
