import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PhoneOtpForm from "./PhoneOtpForm";
import * as AuthContextModule from "@/lib/auth/context";

describe("PhoneOtpForm", () => {
  const mockSendPhoneOtp = vi.fn();
  const mockVerifyPhoneOtp = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      profile: null,
      experienceMode: "citizen",
      setExperienceMode: vi.fn(),
      isLoading: false,
      isConfigured: true,
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      sendPhoneOtp: mockSendPhoneOtp,
      verifyPhoneOtp: mockVerifyPhoneOtp,
      resetPassword: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    });
  });

  it("renders the phone input form with +91 country prefix", () => {
    render(<PhoneOtpForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText("+91")).toBeTruthy();
    expect(screen.getByPlaceholderText("9876543210")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Send Verification Code/i })).toBeTruthy();
  });

  it("disables send button until 10 digits are entered", () => {
    render(<PhoneOtpForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const sendBtn = screen.getByRole("button", { name: /Send Verification Code/i });
    expect(sendBtn.hasAttribute("disabled")).toBe(true);

    const input = screen.getByPlaceholderText("9876543210");
    fireEvent.change(input, { target: { value: "987654" } });
    expect(sendBtn.hasAttribute("disabled")).toBe(true);

    fireEvent.change(input, { target: { value: "9876543210" } });
    expect(sendBtn.hasAttribute("disabled")).toBe(false);
  });

  it("advances to OTP entry step upon successful sendPhoneOtp call", async () => {
    mockSendPhoneOtp.mockResolvedValueOnce({});
    render(<PhoneOtpForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const input = screen.getByPlaceholderText("9876543210");
    fireEvent.change(input, { target: { value: "9876543210" } });

    const sendBtn = screen.getByRole("button", { name: /Send Verification Code/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockSendPhoneOtp).toHaveBeenCalledWith("9876543210");
      expect(screen.getByText(/Enter 6-Digit Verification Code/i)).toBeTruthy();
    });
  });

  it("calls onCancel when back button is pressed", () => {
    render(<PhoneOtpForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelBtn = screen.getByRole("button", { name: /Back to Email Sign-In/i });
    fireEvent.click(cancelBtn);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
