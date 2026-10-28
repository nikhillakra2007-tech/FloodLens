"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState, useEffect } from "react";
import UserMenu from "@/components/auth/UserMenu";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const investigationMatch = pathname.match(/^\/investigations\/([^/]+)/);
  const investigationId =
    investigationMatch && investigationMatch[1] !== "new"
      ? investigationMatch[1]
      : null;

  const navLinks = [
    { href: "/", label: "Overview", isActive: pathname === "/" },
    { href: "/hub", label: "Feature Hub", isActive: pathname === "/hub" },
    { href: "/investigations/new", label: "Ward Diagnosis", isActive: pathname.startsWith("/investigations") },
    { href: "/flowchart", label: "Causal Flowchart", isActive: pathname === "/flowchart" },
    { href: "/simulator", label: "Twin Simulator", isActive: pathname === "/simulator" },
    { href: "/infrastructure", label: "Subsurface Anatomy", isActive: pathname === "/infrastructure" },
  ];

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 border-b transition-all duration-200 bg-[#FAF7F2]/95 backdrop-blur-md",
          hasScrolled
            ? "border-[#E0D5C7] shadow-sm py-2.5"
            : "border-[#E8DFD3] py-3.5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Identity */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 p-0.5 shadow-md shadow-terracotta-600/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-warm">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#FAF7F2]">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-terracotta-600 transition-colors"
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
                  <span className="font-bold text-xl tracking-tight text-[#221B15]">
                    Flood<span className="text-terracotta-600 font-bold">Lens</span>
                  </span>
                  <span className="rounded-full border border-terracotta-200 bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-terracotta-700">
                    Chennai
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#756350] font-medium tracking-normal hidden xs:block">
                  Differential Hydrological Intelligence
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links (14-16px readable typography) */}
            <nav className="hidden xl:flex items-center gap-1 pl-4 border-l border-[#E8DFD3]" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150 whitespace-nowrap",
                    link.isActive
                      ? "text-terracotta-700 bg-terracotta-50/90 border border-terracotta-200/80 font-bold shadow-2xs"
                      : "text-[#554638] hover:text-[#221B15] hover:bg-[#F5EFE6]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Active Investigation Tag */}
            {investigationId && (
              <span className="hidden sm:inline-flex font-mono text-xs text-[#756350] bg-white border border-[#E8DFD3] px-3 py-1.5 rounded-xl font-bold shadow-2xs">
                Case: {investigationId.slice(0, 8)}
              </span>
            )}

            {/* User Account / Mode Switcher */}
            <UserMenu />

            {/* Primary Action Button */}
            <Link
              href="/investigations/new"
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-terracotta-600 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-warm transition-all duration-200 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <span>Run Ward Diagnosis</span>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden flex items-center justify-center rounded-xl border border-[#E0D5C7] bg-white p-2 sm:p-2.5 text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15] transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col justify-between border-l border-[#E8DFD3] bg-[#FAF7F2] p-6 shadow-2xl animate-fadeIn">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD3]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-[#221B15]">Navigation</span>
                  <span className="rounded-full bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 text-[10px] font-bold text-terracotta-700">
                    FloodLens
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-[#E0D5C7] bg-white p-2 text-[#554638] hover:bg-[#F5EFE6]"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5" aria-label="Mobile Navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                      link.isActive
                        ? "bg-terracotta-50 text-terracotta-800 border border-terracotta-200 font-bold shadow-2xs"
                        : "text-[#221B15] hover:bg-[#F5EFE6]"
                    )}
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-[#9E8B75]">→</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile CTA */}
              <div className="pt-2">
                <Link
                  href="/investigations/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-terracotta-600 px-5 py-3 text-sm font-bold text-white shadow-warm hover:bg-terracotta-700 transition-colors"
                >
                  <span>Launch Ward Diagnosis</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-[#E8DFD3] pt-4 space-y-2 text-xs text-[#756350]">
              <div className="flex items-center justify-between">
                <span>Greater Chennai Corporation</span>
                <span className="font-mono text-[10px]">2023 Michaung &amp; Multi-Event</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#9E8B75]">
                Differential hydrological intelligence platform for urban flood diagnosis.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
