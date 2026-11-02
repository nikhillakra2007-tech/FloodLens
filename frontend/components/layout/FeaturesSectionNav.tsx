"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";

interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
}

const SECTION_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview" },
  { id: "infrastructure", label: "Infrastructure Anatomy", shortLabel: "Anatomy" },
  { id: "flowchart", label: "Causal Flowchart", shortLabel: "Flowchart" },
  { id: "simulator", label: "Twin Simulator", shortLabel: "Simulator" },
  { id: "faqs", label: "Methodology FAQ", shortLabel: "FAQ" },
];

export default function FeaturesSectionNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // 1. Scroll Direction Handler with Hysteresis (8px threshold)
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY.current;

          // Always visible near top of page
          if (currentScrollY < 120) {
            setIsVisible(true);
          } else if (diff > 8) {
            // Scrolling down -> hide section nav
            setIsVisible(false);
          } else if (diff < -8) {
            // Scrolling up -> reveal section nav
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // 2. Intersection Observer to highlight active section in view
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const sectionElements = SECTION_ITEMS.map((item) =>
      document.getElementById(item.id)
    ).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      sectionElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      // Keep bar visible immediately upon user interaction
      setIsVisible(true);
    }
  };

  return (
    <nav
      aria-label="Features Section Navigation"
      className={clsx(
        "sticky top-[61px] sm:top-[69px] z-30 w-full transition-all duration-300 ease-in-out border-y border-[#E8DFD3]/90 bg-[#FAF7F2]/95 backdrop-blur-md shadow-2xs",
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 sm:h-12 overflow-x-auto no-scrollbar gap-1 sm:gap-2">
          
          {/* Label indicator */}
          <div className="hidden md:flex items-center gap-1.5 pr-3 border-r border-[#E0D5C7] shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#756350]">
              Features
            </span>
          </div>

          {/* Section links with regular/medium 13-15px typography */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-1 justify-start md:justify-center">
            {SECTION_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleLinkClick(e, item.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded-xl text-[13px] sm:text-sm font-normal sm:font-medium transition-all duration-150 whitespace-nowrap cursor-pointer",
                    isActive
                      ? "text-terracotta-800 bg-terracotta-100/80 border border-terracotta-200 shadow-2xs font-medium"
                      : "text-[#554638] hover:text-[#221B15] hover:bg-[#F2ECE1]"
                  )}
                >
                  <span className="sm:hidden">{item.shortLabel || item.label}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Quick jump to auth */}
          <div className="hidden lg:flex items-center pl-3 border-l border-[#E0D5C7] shrink-0">
            <a
              href="/auth"
              className="text-xs font-medium text-terracotta-700 hover:text-terracotta-900 transition-colors flex items-center gap-1"
            >
              <span>Technical Mode</span>
              <span>→</span>
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
}

