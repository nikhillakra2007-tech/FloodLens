import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPageContent from "./AuthPageContent";
import * as AuthContextModule from "@/lib/auth/context";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "next" ? "/investigations/new" : null),
  }),
}));

describe("AuthPageContent", () => {
  const mockInstantDemoLogin = vi.fn().mockResolvedValue(undefined);
  const mockSignInWithGoogle = vi.fn();
  const mockSignInWithEmail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockAuth = (isConfigured = false) => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      profile: null,
      experienceMode: "technical",
      setExperienceMode: vi.fn(),
      isLoading: false,
      isConfigured,
      signInWithEmail: mockSignInWithEmail,
      signUpWithEmail: vi.fn(),
      signInWithGoogle: mockSignInWithGoogle,
      sendPhoneOtp: vi.fn(),
      verifyPhoneOtp: vi.fn(),
      resetPassword: vi.fn(),
      instantDemoLogin: mockInstantDemoLogin,
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    });
  };

  it("renders the compact scientific auth gateway with hydrological visual and proof points", () => {
    setupMockAuth(false);
    render(<AuthPageContent />);

    // Brand and headline
    expect(screen.getByText(/Understand the forces behind every flood/i)).toBeTruthy();
    expect(screen.getByText(/Watershed and river-flow analysis/i)).toBeTruthy();
    expect(screen.getByText(/Flood-risk mapping and investigations/i)).toBeTruthy();
    expect(screen.getByText(/Technical simulations and impact assessment/i)).toBeTruthy();

    // Prominent Instant Demo Access Button
    expect(screen.getByText(/Enter Technical Demo/i)).toBeTruthy();
    expect(screen.getByText(/Dr\. K\. Senthil Nathan/i)).toBeTruthy();
    expect(screen.getByText(/Citizen Mode \(Priya Ramanathan\)/i)).toBeTruthy();

    // Does NOT render the unprovoked amber setup banner
    expect(screen.queryByText(/Authentication Provider Setup Required/i)).toBeNull();
  });

  it("triggers instant technical demo login when Enter Technical Demo is clicked", async () => {
    setupMockAuth(false);
    render(<AuthPageContent />);

    const demoButton = screen.getByRole("button", { name: /Enter Technical Demo/i });
    fireEvent.click(demoButton);

    expect(mockInstantDemoLogin).toHaveBeenCalledWith("technical");
  });

  it("triggers citizen demo login when resident observer option is clicked", async () => {
    setupMockAuth(false);
    render(<AuthPageContent />);

    const citizenButton = screen.getByRole("button", { name: /Citizen Mode \(Priya Ramanathan\)/i });
    fireEvent.click(citizenButton);

    expect(mockInstantDemoLogin).toHaveBeenCalledWith("citizen");
  });

  it("contextually displays a helpful notice if user clicks Google sign in when provider is not configured", async () => {
    setupMockAuth(false);
    render(<AuthPageContent />);

    const googleBtn = screen.getByRole("button", { name: /Continue with Google/i });
    fireEvent.click(googleBtn);

    expect(mockSignInWithGoogle).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.getByText(/Google OAuth provider is not configured in this deployment/i)
      ).toBeTruthy();
    });
  });

  it("contextually displays a helpful notice if user submits email sign in when provider is not configured", async () => {
    setupMockAuth(false);
    render(<AuthPageContent />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitBtn = screen.getByRole("button", { name: /Sign In to Account/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    expect(mockSignInWithEmail).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.getByText(/Cloud authentication provider is not configured in this deployment/i)
      ).toBeTruthy();
    });
  });
});
