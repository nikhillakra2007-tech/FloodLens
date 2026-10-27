import { describe, it, expect } from "vitest";
import {
  formatIndianPhoneNumber,
  validateRedirectUrl,
  signInSchema,
  signUpSchema,
  phoneOtpSchema,
  verifyOtpSchema,
} from "./validation";

describe("formatIndianPhoneNumber", () => {
  it("validates standard 10-digit Indian numbers starting with 6, 7, 8, or 9", () => {
    const validNumbers = [
      "9876543210",
      "8123456789",
      "7001122334",
      "6998877665",
    ];

    for (const num of validNumbers) {
      const res = formatIndianPhoneNumber(num);
      expect(res.isValid).toBe(true);
      expect(res.cleanDigits).toBe(num);
      expect(res.e164).toBe(`+91${num}`);
      expect(res.error).toBeUndefined();
    }
  });

  it("normalizes numbers with spaces, hyphens, and +91 prefix", () => {
    const res1 = formatIndianPhoneNumber("+91 98765-43210");
    expect(res1.isValid).toBe(true);
    expect(res1.e164).toBe("+919876543210");

    const res2 = formatIndianPhoneNumber("09876543210");
    expect(res2.isValid).toBe(true);
    expect(res2.e164).toBe("+919876543210");

    const res3 = formatIndianPhoneNumber("919876543210");
    expect(res3.isValid).toBe(true);
    expect(res3.e164).toBe("+919876543210");
  });

  it("rejects numbers with fewer than 10 digits", () => {
    const res = formatIndianPhoneNumber("987654321");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("must be exactly 10 digits");
  });

  it("rejects numbers with more than 10 digits (without valid country prefix)", () => {
    const res = formatIndianPhoneNumber("987654321099");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("must be exactly 10 digits");
  });

  it("rejects numbers not starting with 6, 7, 8, or 9 (TRAI allocation)", () => {
    const res = formatIndianPhoneNumber("5123456789");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("must start with 6, 7, 8, or 9");
  });

  it("rejects alphabetic and empty inputs", () => {
    const resEmpty = formatIndianPhoneNumber("");
    expect(resEmpty.isValid).toBe(false);

    const resAlpha = formatIndianPhoneNumber("abcdefghij");
    expect(resAlpha.isValid).toBe(false);
  });
});

describe("validateRedirectUrl", () => {
  it("allows safe internal application routes", () => {
    expect(validateRedirectUrl("/investigations/new")).toBe("/investigations/new");
    expect(validateRedirectUrl("/hub")).toBe("/hub");
    expect(validateRedirectUrl("/simulator")).toBe("/simulator");
    expect(validateRedirectUrl("/infrastructure")).toBe("/infrastructure");
    expect(validateRedirectUrl("/flowchart")).toBe("/flowchart");
    expect(validateRedirectUrl("/onboarding")).toBe("/onboarding");
  });

  it("preserves safe internal query parameters", () => {
    expect(validateRedirectUrl("/investigations/123?tab=evidence")).toBe(
      "/investigations/123?tab=evidence"
    );
  });

  it("strictly rejects external domains and open redirects", () => {
    expect(validateRedirectUrl("https://evil.com")).toBe("/hub");
    expect(validateRedirectUrl("http://phishing.org/login")).toBe("/hub");
    expect(validateRedirectUrl("//malicious-site.com")).toBe("/hub");
    expect(validateRedirectUrl("\\evil.com")).toBe("/hub");
  });

  it("rejects dangerous URI schemes", () => {
    expect(validateRedirectUrl("javascript:alert(1)")).toBe("/hub");
    expect(validateRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe("/hub");
  });

  it("uses provided custom fallback when invalid or null", () => {
    expect(validateRedirectUrl(null, "/investigations/new")).toBe("/investigations/new");
    expect(validateRedirectUrl("", "/investigations/new")).toBe("/investigations/new");
    expect(validateRedirectUrl("unknown-path", "/simulator")).toBe("/simulator");
  });
});

describe("Auth Zod Schemas", () => {
  describe("signInSchema", () => {
    it("accepts valid email and password", () => {
      const res = signInSchema.safeParse({
        email: "analyst@chennai-corporation.gov.in",
        password: "securePassword123",
      });
      expect(res.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const res = signInSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(res.success).toBe(false);
    });

    it("rejects password shorter than 6 characters", () => {
      const res = signInSchema.safeParse({
        email: "user@domain.com",
        password: "123",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("signUpSchema", () => {
    it("validates successful sign up payload", () => {
      const res = signUpSchema.safeParse({
        full_name: "Dr. Rajesh Raman",
        email: "rajesh@resilience.org",
        password: "secretPassword123",
        confirm_password: "secretPassword123",
        phone: "9876543210",
        experience_mode: "technical",
        accept_terms: true,
      });
      expect(res.success).toBe(true);
    });

    it("rejects password mismatch", () => {
      const res = signUpSchema.safeParse({
        full_name: "Dr. Rajesh Raman",
        email: "rajesh@resilience.org",
        password: "secretPassword123",
        confirm_password: "differentPassword456",
        phone: "",
        experience_mode: "citizen",
        accept_terms: true,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toContain("Passwords do not match");
      }
    });

    it("rejects unaccepted terms", () => {
      const res = signUpSchema.safeParse({
        full_name: "Dr. Rajesh Raman",
        email: "rajesh@resilience.org",
        password: "secretPassword123",
        confirm_password: "secretPassword123",
        phone: "",
        experience_mode: "citizen",
        accept_terms: false,
      });
      expect(res.success).toBe(false);
    });
  });

  describe("phoneOtpSchema & verifyOtpSchema", () => {
    it("validates Indian phone numbers in phoneOtpSchema", () => {
      expect(phoneOtpSchema.safeParse({ phone: "9876543210" }).success).toBe(true);
      expect(phoneOtpSchema.safeParse({ phone: "12345" }).success).toBe(false);
    });

    it("validates 6-digit OTP codes in verifyOtpSchema", () => {
      expect(verifyOtpSchema.safeParse({ token: "123456" }).success).toBe(true);
      expect(verifyOtpSchema.safeParse({ token: "123" }).success).toBe(false);
      expect(verifyOtpSchema.safeParse({ token: "1234567" }).success).toBe(false);
    });
  });
});
