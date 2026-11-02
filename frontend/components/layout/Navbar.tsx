"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState, useEffect } from "react";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/lib/auth/context";

export default function Navbar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
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

  const isLandingPage = pathname === "/";
  const investigationMatch = pathname.match(/^\/investigations\/([^/]+)/);
  const investigationId =
    investigationMatch && investigationMatch[1] !== "new"
      ? investigationMatch[1]
      : null;

  // Technical application navigation links (14-16px readable typography)
  const technicalNavLinks = [
    { href: "/investigations/new", label: "Ward Diagnosis", isActive: pathname.startsWith("/investigations") },
    { href: "/flowchart", label: "Causal Flowchart", isActive: pathname === "/flowchart" },
    { href: "/simulator", label: "Twin Simulator", isActive: pathname === "/simulator" },
    { href: "/infrastructure", label: "Subsurface Anatomy", isActive: pathname === "/infrastructure" },
    { href: "/hub", label: "Feature Hub", isActive: pathname === "/hub" },
  ];

  // Public landing page navigation anchor links
  const landingNavLinks = [
    { href: "/#overview", label: "Overview", isActive: pathname === "/" },
    { href: "/#infrastructure", label: "Drainage Mechanism", isActive: false },
    { href: "/#flowchart", label: "Causal Flowchart", isActive: false },
    { href: "/#simulator", label: "Twin Simulator", isActive: false },
    { href: "/#faqs", label: "Methodology FAQ", isActive: false },
  ];

  const currentNavLinks = isLandingPage ? landingNavLinks : technicalNavLinks;

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 border-b transition-all duration-200 bg-white/95 backdrop-blur-md",
          hasScrolled
            ? "border-[#C6D5DA] shadow-sm py-2.5"
            : "border-[#DCE6E9] py-3.5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Identity */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#168C83] to-[#126D66] p-0.5 shadow-md shadow-[#168C83]/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-cool">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#ECF7F5]">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-[#126D66] transition-colors"
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
                  <span className="font-bold text-xl tracking-tight text-[#172D3A]">
                    Flood<span className="text-[#168C83] font-bold">Lens</span>
                  </span>
                  <span className="rounded-full border border-[#DDF2EE] bg-[#ECF7F5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#126D66]">
                    Chennai
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#647C89] font-medium tracking-normal hidden xs:block">
                  Differential Hydrological Intelligence
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 pl-3 xl:pl-4 border-l border-[#DCE6E9]" aria-label="Main Navigation">
              {currentNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-medium rounded-xl transition-all duration-150 whitespace-nowrap",
                    link.isActive
                      ? "text-[#126D66] bg-[#ECF7F5] border border-[#DDF2EE] font-semibold shadow-2xs"
                      : "text-[#526B79] hover:text-[#172D3A] hover:bg-[#EAF1F3]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {isLandingPage ? (
              /* Public Landing Page: Clean, public-facing header with prominent Sign In button */
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-[#126D66] px-4 sm:px-5 py-2.5 text-sm sm:text-base font-bold text-white shadow-cool transition-all duration-200 hover:bg-[#0E544F] hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Sign In</span>
              </Link>
            ) : (
              /* Inside Technical Application: Investigation Case Tag + User Profile Menu with Sign Out */
              <>
                {investigationId && (
                  <span className="hidden sm:inline-flex font-mono text-xs text-[#526B79] bg-[#F6F9FA] border border-[#DCE6E9] px-3 py-1.5 rounded-xl font-bold shadow-2xs">
                    Case: {investigationId.slice(0, 8)}
                  </span>
                )}
                <UserMenu />
              </>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden flex items-center justify-center rounded-xl border border-[#DCE6E9] bg-white p-2.5 sm:p-3 text-[#526B79] hover:bg-[#F6F9FA] hover:text-[#172D3A] transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="fixed inset-0 bg-[#101F2B]/50 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet (16px readable typography, comfortable click targets) */}
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col justify-between border-l border-[#DCE6E9] bg-white p-6 shadow-2xl animate-fadeIn">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#DCE6E9]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-[#172D3A]">Navigation</span>
                  <span className="rounded-full bg-[#ECF7F5] border border-[#DDF2EE] px-2 py-0.5 text-[10px] font-bold text-[#126D66]">
                    FloodLens
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-[#DCE6E9] bg-[#F6F9FA] p-2 text-[#526B79] hover:bg-[#EAF1F3]"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links (15-16px bold typography) */}
              <nav className="space-y-1.5" aria-label="Mobile Navigation">
                {currentNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-colors",
                      link.isActive
                        ? "bg-[#ECF7F5] text-[#126D66] border border-[#DDF2EE] font-bold shadow-2xs"
                        : "text-[#344C59] hover:bg-[#F6F9FA]"
                    )}
                  >
                    <span>{link.label}</span>
                    <span className="text-sm text-[#879AA4]">→</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile Primary Action Button */}
              <div className="pt-2">
                {isLandingPage ? (
                  <Link
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#126D66] px-5 py-3.5 text-base font-bold text-white shadow-cool hover:bg-[#0E544F] transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    <span>Sign In to FloodLens</span>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/investigations/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#126D66] px-5 py-3.5 text-base font-bold text-white shadow-cool hover:bg-[#0E544F] transition-colors"
                    >
                      <span>New Ward Diagnosis</span>
                      <span>→</span>
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition-colors"
                    >
                      <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-[#DCE6E9] pt-4 space-y-2 text-xs text-[#647C89]">
              <div className="flex items-center justify-between">
                <span>Greater Chennai Corporation</span>
                <span className="font-mono text-[10px]">2023 Michaung &amp; Multi-Event</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#879AA4]">
                Differential hydrological intelligence platform for urban flood diagnosis.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
