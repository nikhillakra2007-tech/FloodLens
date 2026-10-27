import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UserMenu from "./UserMenu";
import * as AuthContextModule from "@/lib/auth/context";

describe("UserMenu", () => {
  const mockSetExperienceMode = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Sign In button when user is logged out", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      profile: null,
      experienceMode: "citizen",
      setExperienceMode: mockSetExperienceMode,
      isLoading: false,
      isConfigured: true,
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      sendPhoneOtp: vi.fn(),
      verifyPhoneOtp: vi.fn(),
      resetPassword: vi.fn(),
      signOut: mockSignOut,
      refreshProfile: vi.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByRole("link", { name: /Sign In/i })).toBeTruthy();
  });

  it("renders user avatar and mode badge when signed in, and toggles dropdown menu", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { id: "user-1", email: "rajesh@resilience.org" } as any,
      profile: {
        id: "user-1",
        full_name: "Rajesh Raman",
        email: "rajesh@resilience.org",
        experience_mode: "citizen",
        profile_completed: true,
      },
      experienceMode: "citizen",
      setExperienceMode: mockSetExperienceMode,
      isLoading: false,
      isConfigured: true,
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      sendPhoneOtp: vi.fn(),
      verifyPhoneOtp: vi.fn(),
      resetPassword: vi.fn(),
      signOut: mockSignOut,
      refreshProfile: vi.fn(),
    });

    render(<UserMenu />);

    // Shows Initials "RR"
    expect(screen.getByText("RR")).toBeTruthy();
    expect(screen.getByText("Citizen Mode")).toBeTruthy();

    // Click menu trigger
    const menuBtn = screen.getByRole("button", { name: /User account menu/i });
    fireEvent.click(menuBtn);

    // Dropdown contains profile info and sign out button
    expect(screen.getAllByText("Rajesh Raman").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("rajesh@resilience.org")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sign Out/i })).toBeTruthy();

    // Mode switch button can be clicked
    const technicalBtn = screen.getByRole("button", { name: "Technical" });
    fireEvent.click(technicalBtn);
    expect(mockSetExperienceMode).toHaveBeenCalledWith("technical");
  });
});
