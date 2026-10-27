import { z } from "zod";
import type { ExperienceMode } from "./types";

/**
 * Standard Indian 10-digit mobile number regex:
 * Exactly 10 digits, starting with 6, 7, 8, or 9 as per Indian TRAI allocation.
 */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validate and format Indian mobile number to international E.164 format (+91XXXXXXXXXX)
 */
export function formatIndianPhoneNumber(rawInput: string): {
  isValid: boolean;
  cleanDigits: string;
  e164: string;
  error?: string;
} {
  // Strip spaces, dashes, parentheses, and leading +91 or 91 or 0 if present
  let digits = rawInput.replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (digits.length === 0) {
    return {
      isValid: false,
      cleanDigits: "",
      e164: "",
      error: "Mobile number is required.",
    };
  }

  if (digits.length !== 10) {
    return {
      isValid: false,
      cleanDigits: digits,
      e164: "",
      error: "Indian mobile number must be exactly 10 digits.",
    };
  }

  if (!INDIAN_MOBILE_REGEX.test(digits)) {
    return {
      isValid: false,
      cleanDigits: digits,
      e164: "",
      error: "Indian mobile numbers must start with 6, 7, 8, or 9.",
    };
  }

  return {
    isValid: true,
    cleanDigits: digits,
    e164: `+91${digits}`,
  };
}

/**
 * Strict internal redirect destination validator to prevent open redirects.
 */
export function validateRedirectUrl(targetUrl: string | null | undefined, fallback: string = "/hub"): string {
  if (!targetUrl || typeof targetUrl !== "string") {
    return fallback;
  }

  const trimmed = targetUrl.trim();

  // Reject protocol-relative, absolute external URLs, or dangerous protocols
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("\\") ||
    trimmed.includes("://") ||
    trimmed.toLowerCase().startsWith("javascript:") ||
    trimmed.toLowerCase().startsWith("data:") ||
    trimmed.toLowerCase().startsWith("vbscript:")
  ) {
    return fallback;
  }

  // Must begin with single forward slash
  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  // List of known safe application route prefixes
  const allowedPrefixes = [
    "/investigations",
    "/hub",
    "/simulator",
    "/flowchart",
    "/infrastructure",
    "/onboarding",
    "/demo-video",
    "/auth",
  ];

  const pathnameOnly = trimmed.split("?")[0].split("#")[0];
  const isAllowed = allowedPrefixes.some(
    (prefix) => pathnameOnly === prefix || pathnameOnly.startsWith(`${prefix}/`)
  );

  return isAllowed ? trimmed : fallback;
}

/**
 * Zod validation schemas for forms
 */
export const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const signUpSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name must be at least 2 characters."),
    email: z.string().trim().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirm_password: z.string().min(6, "Confirm password must be at least 6 characters."),
    phone: z.string().optional().or(z.literal("")),
    experience_mode: z.enum(["citizen", "technical"] as const),
    accept_terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and scientific data disclaimer.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })
  .refine(
    (data) => {
      if (!data.phone || data.phone.trim() === "") return true;
      return formatIndianPhoneNumber(data.phone).isValid;
    },
    {
      message: "Please enter a valid 10-digit Indian mobile number.",
      path: ["phone"],
    }
  );

export const phoneOtpSchema = z.object({
  phone: z.string().refine((val) => formatIndianPhoneNumber(val).isValid, {
    message: "Enter a valid 10-digit Indian mobile number (e.g., 9876543210).",
  }),
});

export const verifyOtpSchema = z.object({
  token: z.string().trim().length(6, "Verification code must be 6 digits."),
});
