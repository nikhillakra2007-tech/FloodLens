import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ExperienceModeSelector from "./ExperienceModeSelector";

describe("ExperienceModeSelector", () => {
  it("renders Citizen and Technical selectable options with descriptions", () => {
    const handleChange = vi.fn();
    render(<ExperienceModeSelector value="citizen" onChange={handleChange} />);

    expect(screen.getByRole("radiogroup")).toBeTruthy();
    expect(screen.getByText("Citizen")).toBeTruthy();
    expect(screen.getByText("Technical")).toBeTruthy();

    const citizenRadio = screen.getByRole("radio", { name: /Citizen Mode/i });
    const technicalRadio = screen.getByRole("radio", { name: /Technical Mode/i });

    expect(citizenRadio.getAttribute("aria-checked")).toBe("true");
    expect(technicalRadio.getAttribute("aria-checked")).toBe("false");
  });

  it("calls onChange when Technical option is clicked", () => {
    const handleChange = vi.fn();
    render(<ExperienceModeSelector value="citizen" onChange={handleChange} />);

    const technicalRadio = screen.getByRole("radio", { name: /Technical Mode/i });
    fireEvent.click(technicalRadio);

    expect(handleChange).toHaveBeenCalledWith("technical");
  });

  it("calls onChange when Citizen option is clicked", () => {
    const handleChange = vi.fn();
    render(<ExperienceModeSelector value="technical" onChange={handleChange} />);

    const citizenRadio = screen.getByRole("radio", { name: /Citizen Mode/i });
    fireEvent.click(citizenRadio);

    expect(handleChange).toHaveBeenCalledWith("citizen");
  });

  it("disables options when disabled prop is true", () => {
    const handleChange = vi.fn();
    render(<ExperienceModeSelector value="citizen" onChange={handleChange} disabled={true} />);

    const citizenRadio = screen.getByRole("radio", { name: /Citizen Mode/i });
    const technicalRadio = screen.getByRole("radio", { name: /Technical Mode/i });

    expect(citizenRadio.hasAttribute("disabled")).toBe(true);
    expect(technicalRadio.hasAttribute("disabled")).toBe(true);
  });
});
