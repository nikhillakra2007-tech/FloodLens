"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    let idleTimer: NodeJS.Timeout | null = null;

    // Check initial scroll state
    if (typeof window !== "undefined" && window.scrollY > 80) {
      setIsVisible(false);
    }

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      setHasScrolled(currentY > 20);

      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }

      if (currentY <= 80) {
        // At the very top of the page: always visible
        setIsVisible(true);
      } else if (delta > 4) {
        // Scrolling down: hide immediately
        setIsVisible(false);
        setMobileMenuOpen(false);
      } else if (delta < -8) {
        // Active scroll up: show momentarily
        setIsVisible(true);
        // Promptly hide when user stops scrolling and stays still (1.4s)
        idleTimer = setTimeout(() => {
          if (window.scrollY > 80) {
            setIsVisible(false);
          }
        }, 1400);
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const isLandingPage = pathname === "/";
  const investigationMatch = pathname.match(/^\/investigations\/([^/]+)/);
  const investigationId =
    investigationMatch && investigationMatch[1] !== "new"
      ? investigationMatch[1]
      : null;

  const landingNavLinks = [
    { href: "/#overview", label: "Overview" },
    { href: "/#infrastructure", label: "Drainage Mechanism" },
    { href: "/#flowchart", label: "Causal Flowchart" },
    { href: "/#simulator", label: "Twin Simulator" },
    { href: "/#faqs", label: "FAQ" },
  ];

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 border-b border-[#E8DFD3] bg-[#FAF7F2]/95 backdrop-blur-xl transition-all duration-300 ease-in-out",
        isVisible
          ? "translate-y-0 opacity-100 shadow-sm"
          : "-translate-y-full opacity-0 pointer-events-none",
        hasScrolled && "shadow-subtle"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 p-0.5 shadow-md shadow-terracotta-600/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-warm">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#FAF7F2]">
                <svg
                  className="h-6 w-6 text-terracotta-600 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-[#221B15]">
                  Flood<span className="text-terracotta-600 italic">Lens</span>
                </span>
                <span className="rounded-full border border-terracotta-200 bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-terracotta-700">
                  Chennai
                </span>
              </div>
              <p className="text-xs text-[#756350] font-medium tracking-wide">
                Differential Hydrological Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Landing page only) */}
          {isLandingPage && (
            <nav className="hidden md:flex items-center gap-1 pl-6 border-l border-[#E8DFD3]">
              {landingNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 text-[#756350] hover:text-[#221B15] hover:bg-[#F5EFE6]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right Section Bar: CTA on landing, Back & ID on investigation pages */}
        <div className="flex items-center gap-3">
          {isLandingPage ? (
            <Link
              href="/investigations/new"
              className="flex items-center gap-2 rounded-xl bg-terracotta-600 px-5 py-2.5 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Run Ward Diagnosis</span>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {investigationId && (
                <span className="font-mono text-xs text-[#756350] bg-white border border-[#E8DFD3] px-3.5 py-2 rounded-xl font-bold shadow-xs">
                  Investigation ID: {investigationId.slice(0, 8)}
                </span>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-[#554638] hover:text-[#221B15] transition-all shadow-xs cursor-pointer"
              >
                ← Back to Landing Page
              </Link>
            </div>
          )}

          {/* Mobile menu button (Landing page only) */}
          {isLandingPage && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-xl p-2.5 text-[#554638] hover:bg-[#F5EFE6]"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown (Landing page only) */}
      {isLandingPage && mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8DFD3] bg-[#FAF7F2] px-5 py-4 space-y-2">
          {landingNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm font-bold text-[#221B15] hover:bg-[#F5EFE6]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
