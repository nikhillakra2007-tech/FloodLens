import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FloodLens — Differential Urban Flood Mechanism Intelligence",
  description: "Differential causal diagnosis for Greater Chennai flood resilience. Comparing twin urban catchments across stormwater drain conduits, elevation gradients, and imperviousness to isolate structural failure points.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#101F2B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-screen flex-col bg-[#F0F4F5] text-[#344C59] font-sans antialiased selection:bg-[#DDF2EE] selection:text-[#126D66] overflow-x-hidden">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
