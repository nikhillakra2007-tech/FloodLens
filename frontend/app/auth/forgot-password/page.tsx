"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase-client";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isConfigured } = useAuth();

  const isResetMode = searchParams.get("mode") === "reset";

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(
        result.message ||
          "Password reset instructions have been dispatched. Please inspect your email inbox."
      );
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication service is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      setIsLoading(false);

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("Your password has been successfully updated. Redirecting to sign in...");
        setTimeout(() => {
          router.push("/auth?mode=login");
        }, 2000);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Failed to update password.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#E8DFD3] bg-white p-8 sm:p-10 shadow-lift space-y-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="font-serif text-xl font-bold tracking-tight text-[#221B15]">
              Flood<span className="text-terracotta-600 italic">Lens</span>
            </span>
            <span className="rounded-full border border-terracotta-200 bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-terracotta-700">
              Chennai
            </span>
          </Link>

          <h2 className="font-serif text-2xl font-bold text-[#221B15]">
            {isResetMode ? "Set New Password" : "Reset Your Password"}
          </h2>
          <p className="text-xs text-[#554638] mt-1.5 leading-relaxed">
            {isResetMode
              ? "Enter your new credentials below to restore secure account access."
              : "Enter your registered email address and we will dispatch a secure recovery link."}
          </p>
        </div>

        {!isConfigured && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
            Authentication service requires Supabase configuration in environment variables.
          </div>
        )}

        {error && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800"
            role="status"
          >
            {message}
          </div>
        )}

        {!isResetMode ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="reset-email"
                className="text-xs font-bold uppercase tracking-wider text-[#756350]"
              >
                Registered Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="name@domain.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-terracotta-600 px-6 py-3.5 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="text-xs font-bold uppercase tracking-wider text-[#756350]"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-new-password"
                className="text-xs font-bold uppercase tracking-wider text-[#756350]"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-terracotta-600 px-6 py-3.5 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password & Sign In</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-[#E8DFD3]">
          <Link
            href="/auth?mode=login"
            className="text-xs font-bold text-[#756350] hover:text-[#221B15] transition-colors"
          >
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-terracotta-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
            <span>Loading Password Recovery...</span>
          </div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
