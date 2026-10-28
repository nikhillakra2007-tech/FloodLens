import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "./Navbar";
import * as AuthContextModule from "@/lib/auth/context";

let currentPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = "/";
  });

  const setupMockAuth = (signedIn = false) => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: signedIn ? ({ id: "user-1", email: "dr.senthil@iitm.ac.in" } as any) : null,
      profile: signedIn
        ? {
            id: "user-1",
            full_name: "Dr. K. Senthil Nathan",
            email: "dr.senthil@iitm.ac.in",
            experience_mode: "technical",
            profile_completed: true,
          }
        : null,
      experienceMode: "technical",
      setExperienceMode: vi.fn(),
      isLoading: false,
      isConfigured: true,
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      sendPhoneOtp: vi.fn(),
      verifyPhoneOtp: vi.fn(),
      resetPassword: vi.fn(),
      instantDemoLogin: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn().mockResolvedValue({ success: true }),
    });
  };

  it("renders a clean public header with Sign In on the landing page even when a user is signed in", () => {
    currentPathname = "/";
    setupMockAuth(true); // Signed in user exists in context

    render(<Navbar />);

    // Must show public Sign In button
    const signInLinks = screen.getAllByRole("link", { name: /Sign In/i });
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);

    // Must NEVER show user name, email, avatar, or personalized greeting on public landing page
    expect(screen.queryByText("Dr. K. Senthil Nathan")).toBeNull();
    expect(screen.queryByText("dr.senthil@iitm.ac.in")).toBeNull();
    expect(screen.queryByText("SN")).toBeNull();

    // Must NOT show Run Ward Diagnosis in the navbar
    expect(screen.queryByText("Run Ward Diagnosis")).toBeNull();
  });

  it("renders technical navigation links and UserMenu on technical application routes", () => {
    currentPathname = "/investigations/new";
    setupMockAuth(true);

    render(<Navbar />);

    // Shows technical links
    expect(screen.getByText("Feature Hub")).toBeTruthy();
    expect(screen.getByText("Ward Diagnosis")).toBeTruthy();
    expect(screen.getByText("Twin Simulator")).toBeTruthy();
    expect(screen.getByText("Causal Flowchart")).toBeTruthy();

    // UserMenu avatar is present
    expect(screen.getByText("DK")).toBeTruthy();
  });
});
