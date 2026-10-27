"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatIndianPhoneNumber } from "@/lib/auth/validation";
import { useAuth } from "@/lib/auth/context";

interface PhoneOtpFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PhoneOtpForm({ onSuccess, onCancel }: PhoneOtpFormProps) {
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === "otp" && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, countdown]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = formatIndianPhoneNumber(phoneNumber);
    if (!validation.isValid) {
      setError(validation.error || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsLoading(true);
    const result = await sendPhoneOtp(phoneNumber);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setStep("otp");
      setCountdown(60);
      setCanResend(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setError(null);
    setIsLoading(true);
    const result = await sendPhoneOtp(phoneNumber);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto advance to next input
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    const result = await verifyPhoneOtp(phoneNumber, code);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {step === "phone" ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-5">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#221B15]">
              Indian Mobile Number Authentication
            </h3>
            <p className="text-xs text-[#554638]">
              We will send a one-time verification SMS to your phone.
            </p>
          </div>

          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="indian-phone-input"
              className="text-xs font-bold uppercase tracking-wider text-[#756350]"
            >
              Mobile Number <span className="text-terracotta-600">*</span>
            </label>
            <div className="relative flex rounded-xl border border-[#E0D5C7] bg-white shadow-xs focus-within:border-terracotta-500 focus-within:ring-2 focus-within:ring-terracotta-200 transition-all">
              {/* Fixed Country Badge */}
              <div className="flex items-center gap-1.5 border-r border-[#E0D5C7] px-3.5 bg-[#FAF7F2] text-xs font-bold text-[#221B15] rounded-l-xl select-none">
                <span className="text-base" role="img" aria-label="India flag">🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                id="indian-phone-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhoneNumber(val);
                }}
                disabled={isLoading}
                className="w-full border-0 px-3.5 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-0 bg-transparent"
                aria-describedby="phone-hint"
                required
              />
            </div>
            <p id="phone-hint" className="text-[11px] text-[#756350]">
              Enter standard 10-digit Indian mobile number without country code or 0.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || phoneNumber.length !== 10}
              className="w-full rounded-xl bg-terracotta-600 px-6 py-3.5 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Requesting OTP...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full text-center text-xs font-bold text-[#756350] hover:text-[#221B15] py-2 transition-colors cursor-pointer"
            >
              ← Back to Email Sign-In
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#221B15]">
              Enter 6-Digit Verification Code
            </h3>
            <p className="text-xs text-[#554638]">
              Sent via SMS to <span className="font-mono font-bold text-[#221B15]">+91 {phoneNumber}</span>
            </p>
          </div>

          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#756350]">
              Verification Code (OTP)
            </label>
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${index + 1} of 6`}
                  disabled={isLoading}
                  className="h-12 w-11 sm:w-12 text-center font-mono text-lg font-bold text-[#221B15] border border-[#E0D5C7] rounded-xl focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 bg-white transition-all"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setError(null);
                }}
                className="text-[#756350] hover:text-[#221B15] font-medium transition-colors"
              >
                Change Number
              </button>

              <div>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="font-bold text-terracotta-600 hover:text-terracotta-700 transition-colors cursor-pointer"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="text-[#756350]">
                    Resend in <span className="font-mono font-bold text-[#221B15]">{countdown}s</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || otpDigits.join("").length !== 6}
              className="w-full rounded-xl bg-terracotta-600 px-6 py-3.5 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify & Sign In</span>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full text-center text-xs font-bold text-[#756350] hover:text-[#221B15] py-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
