import { Suspense } from "react";
import type { Metadata } from "next";
import AuthPageContent from "@/components/auth/AuthPageContent";

export const metadata: Metadata = {
  title: "Authentication Gateway — FloodLens Chennai",
  description: "Secure gateway to FloodLens differential urban flood intelligence, twin-catchment diagnosis, and causal infrastructure evidence.",
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-terracotta-700">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
            <span>Loading FloodLens Gateway...</span>
          </div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
