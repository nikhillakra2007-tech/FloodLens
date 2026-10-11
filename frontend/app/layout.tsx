import type { Metadata } from "next";
import "@/styles/globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "FloodLens — Differential Urban Flood Mechanism Intelligence",
  description: "Differential causal diagnosis for Greater Chennai flood resilience. Comparing twin urban catchments to isolate structural failure points.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-screen flex-col bg-[#FAF7F2] text-[#221B15] antialiased selection:bg-terracotta-200 selection:text-terracotta-900">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
