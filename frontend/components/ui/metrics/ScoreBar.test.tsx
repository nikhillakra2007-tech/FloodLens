import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ScoreBar from "./ScoreBar";

describe("ScoreBar", () => {
  it("renders with correct width percentage", () => {
    const { container } = render(<ScoreBar value={0.5} />);
    const bar = container.querySelector("[style]") as HTMLElement | null;
    expect(bar?.style.width).toBe("50%");
  });

  it("caps at 100%", () => {
    const { container } = render(<ScoreBar value={1.5} />);
    const bar = container.querySelector("[style]") as HTMLElement | null;
    expect(bar?.style.width).toBe("100%");
  });

  it("handles zero value", () => {
    const { container } = render(<ScoreBar value={0} />);
    const bar = container.querySelector("[style]") as HTMLElement | null;
    expect(bar?.style.width).toBe("0%");
  });
});
