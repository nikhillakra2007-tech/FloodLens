"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface HydrologicalConventionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HydrologicalConventionsModal({
  isOpen,
  onClose,
}: HydrologicalConventionsModalProps) {
  const [expandedFormula, setExpandedFormula] = useState<string | null>("cloudburst");
  const [expandedBoxItem, setExpandedBoxItem] = useState<string | null>("physics");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#E8DFD3] bg-[#FFFDF9] shadow-2xl p-6 sm:p-10 space-y-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#E8DFD3]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
              Field Glossary &amp; Technical Reference
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#221B15]">
              Hydrological Conventions &amp; Physics Formulations
            </h2>
            <p className="text-sm sm:text-base text-[#554638] leading-relaxed max-w-3xl">
              An engineering guide to understand the mathematical formulas, sensor telemetry datum, and symbol conventions used throughout FloodLens. Click any card below for details on demand.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#E0D5C7] bg-white p-3 text-[#554638] hover:bg-terracotta-50 hover:text-terracotta-800 hover:border-terracotta-300 transition-all cursor-pointer shadow-sm shrink-0"
            aria-label="Close reference modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 1. Visual Anatomy of a Flowchart Box (Details on Demand) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-[#221B15] flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-terracotta-600" />
              <span>1. Visual Box Architecture (Click items to see details)</span>
            </h3>
            <span className="text-xs text-[#756350] font-medium hidden sm:inline">
              Interactive Guide
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* ① Stage Index */}
            <div
              onClick={() => setExpandedBoxItem(expandedBoxItem === "stage" ? null : "stage")}
              className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                expandedBoxItem === "stage"
                  ? "border-terracotta-400 bg-terracotta-50/80 shadow-warm"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3]"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-800 block">
                ① Stage Sequence
              </span>
              <div className="font-mono text-sm font-bold text-[#221B15] mt-1">01 · Cloudburst</div>
              <p className="text-xs text-[#756350] mt-1.5 leading-relaxed">
                Chronological causal step from rain down to ponding.
              </p>
              {expandedBoxItem === "stage" && (
                <div className="mt-3 pt-2.5 border-t border-terracotta-200 text-xs text-[#44362B] space-y-1">
                  <strong>Why it matters:</strong> Prevents confounding cause with effect. Numbers 01–07 map the physical journey of a raindrop.
                </div>
              )}
            </div>

            {/* ② Governing Physics */}
            <div
              onClick={() => setExpandedBoxItem(expandedBoxItem === "physics" ? null : "physics")}
              className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                expandedBoxItem === "physics"
                  ? "border-terracotta-400 bg-terracotta-50/80 shadow-warm"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3]"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-800 block">
                ② Governing Formula
              </span>
              <div className="font-mono text-sm font-bold text-terracotta-700 mt-1">P(t) = ∫ i(t) dt</div>
              <p className="text-xs text-[#756350] mt-1.5 leading-relaxed">
                Differential equation for flow rate or hydraulic head.
              </p>
              {expandedBoxItem === "physics" && (
                <div className="mt-3 pt-2.5 border-t border-terracotta-200 text-xs text-[#44362B] space-y-1">
                  <strong>Why it matters:</strong> Replaces black-box AI with verifiable conservation of mass and momentum laws.
                </div>
              )}
            </div>

            {/* ③ Empirical Telemetry */}
            <div
              onClick={() => setExpandedBoxItem(expandedBoxItem === "telemetry" ? null : "telemetry")}
              className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                expandedBoxItem === "telemetry"
                  ? "border-terracotta-400 bg-terracotta-50/80 shadow-warm"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3]"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-800 block">
                ③ Empirical Telemetry
              </span>
              <div className="font-mono text-sm font-bold text-red-700 mt-1">390 mm / 24h</div>
              <p className="text-xs text-[#756350] mt-1.5 leading-relaxed">
                Live calibrated ground-truth sensor datum.
              </p>
              {expandedBoxItem === "telemetry" && (
                <div className="mt-3 pt-2.5 border-t border-terracotta-200 text-xs text-[#44362B] space-y-1">
                  <strong>Source:</strong> GCC AWS weather stations, Sentinel-2 SAR radar, and CCTV sonar pipe probes.
                </div>
              )}
            </div>

            {/* ④ Status Pip */}
            <div
              onClick={() => setExpandedBoxItem(expandedBoxItem === "status" ? null : "status")}
              className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                expandedBoxItem === "status"
                  ? "border-terracotta-400 bg-terracotta-50/80 shadow-warm"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3]"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-800 block">
                ④ Status Pip
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#221B15] mt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span>Critical / Resilient</span>
              </div>
              <p className="text-xs text-[#756350] mt-1.5 leading-relaxed">
                Color-coded health of the hydraulic asset.
              </p>
              {expandedBoxItem === "status" && (
                <div className="mt-3 pt-2.5 border-t border-terracotta-200 text-xs text-[#44362B] space-y-1">
                  <strong>Criteria:</strong> Green = within design buffer; Amber = throttled; Red = active failure threshold exceeded.
                </div>
              )}
            </div>

            {/* ⑤ Continuous Arrows */}
            <div
              onClick={() => setExpandedBoxItem(expandedBoxItem === "arrows" ? null : "arrows")}
              className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                expandedBoxItem === "arrows"
                  ? "border-terracotta-400 bg-terracotta-50/80 shadow-warm"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3]"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-800 block">
                ⑤ Continuous Arrows
              </span>
              <div className="font-mono text-sm font-bold text-terracotta-700 mt-1">Flux Direction →</div>
              <p className="text-xs text-[#756350] mt-1.5 leading-relaxed">
                Laminar left-to-right water momentum flux.
              </p>
              {expandedBoxItem === "arrows" && (
                <div className="mt-3 pt-2.5 border-t border-terracotta-200 text-xs text-[#44362B] space-y-1">
                  <strong>Dynamics:</strong> Horizontal lines = pipe conveyance; Downward links = cross-sectional choking &amp; reverse surge.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Deep Dive: The 7 Causal Formulations Decoded (Details on Demand) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-[#221B15] flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-terracotta-600" />
              <span>2. The 7 Causal Physical Formulations (Click to Expand Variables &amp; Cyclone Michaung / Modern Flood Data)</span>
            </h3>
            <span className="text-xs text-[#756350]">Click card to view deep details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 01 Cloudburst */}
            <div
              onClick={() => setExpandedFormula(expandedFormula === "cloudburst" ? null : "cloudburst")}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                expandedFormula === "cloudburst"
                  ? "border-terracotta-400 bg-white shadow-lift ring-2 ring-terracotta-200"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-mono font-bold text-terracotta-800 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                  STAGE 01 · METEOROLOGY
                </span>
                <span className="text-xs font-bold text-terracotta-600">
                  {expandedFormula === "cloudburst" ? "Collapse ▲" : "Expand Details ▼"}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#221B15]">
                01 · Cloudburst Precipitation Forcing
              </h4>
              <div className="font-mono text-sm font-bold bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7] text-terracotta-800 my-2">
                P(t) = ∫ i(t) dt
              </div>
              <p className="text-xs text-[#554638] leading-relaxed">
                <strong>Plain English:</strong> The total bucket volume of water falling from the sky. Cloudburst storms dump high-intensity rain faster than the ground can absorb.
              </p>

              {expandedFormula === "cloudburst" && (
                <div className="mt-3.5 pt-3 border-t border-[#E8DFD3] space-y-2 text-xs">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7]">
                    <span className="font-bold text-[#221B15] block mb-1">Variable Breakdown:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#554638]">
                      <li><strong>P(t):</strong> Cumulative precipitation depth in millimeters (mm).</li>
                      <li><strong>i(t):</strong> Instantaneous storm intensity (mm/hour).</li>
                      <li><strong>dt:</strong> Time integration increment (hours).</li>
                    </ul>
                  </div>
                  <div className="text-[#221B15]">
                    <strong>Cyclone Michaung (2023) &amp; Recent Calibration:</strong> IMD &amp; GCC AWS recorded 420mm+ in 24 hours (peak intensity 68mm/h), overwhelming all gravity intakes.
                  </div>
                </div>
              )}
            </div>

            {/* 02 Impervious Cover */}
            <div
              onClick={() => setExpandedFormula(expandedFormula === "impervious" ? null : "impervious")}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                expandedFormula === "impervious"
                  ? "border-terracotta-400 bg-white shadow-lift ring-2 ring-terracotta-200"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-mono font-bold text-terracotta-800 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                  STAGE 02 · SURFACE COVER
                </span>
                <span className="text-xs font-bold text-terracotta-600">
                  {expandedFormula === "impervious" ? "Collapse ▲" : "Expand Details ▼"}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#221B15]">
                02 · Built-up Impervious Surface Fraction
              </h4>
              <div className="font-mono text-sm font-bold bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7] text-terracotta-800 my-2">
                C_runoff = 0.35 + 0.55 · Ia
              </div>
              <p className="text-xs text-[#554638] leading-relaxed">
                <strong>Plain English:</strong> Concrete and asphalt seal the earth like plastic wrap. Higher built-up fraction converts 85%+ of rain into immediate violent street runoff.
              </p>

              {expandedFormula === "impervious" && (
                <div className="mt-3.5 pt-3 border-t border-[#E8DFD3] space-y-2 text-xs">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7]">
                    <span className="font-bold text-[#221B15] block mb-1">Variable Breakdown:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#554638]">
                      <li><strong>Ia:</strong> Sealed urban surface fraction (0.0 to 1.0).</li>
                      <li><strong>C_runoff:</strong> Dimensionless runoff coefficient (0.35 for soil, 0.90 for dense asphalt).</li>
                    </ul>
                  </div>
                  <div className="text-[#221B15]">
                    <strong>2015 Chennai Event Calibration:</strong> Sentinel-2 satellite data confirmed 84% impervious surface in Anna Nagar (Ward 101), generating 3x the surface runoff of peri-urban zones.
                  </div>
                </div>
              )}
            </div>

            {/* 03 Overland Inflow */}
            <div
              onClick={() => setExpandedFormula(expandedFormula === "inflow" ? null : "inflow")}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                expandedFormula === "inflow"
                  ? "border-terracotta-400 bg-white shadow-lift ring-2 ring-terracotta-200"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-mono font-bold text-terracotta-800 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                  STAGE 03 · INTAKE HYDRAULICS
                </span>
                <span className="text-xs font-bold text-terracotta-600">
                  {expandedFormula === "inflow" ? "Collapse ▲" : "Expand Details ▼"}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#221B15]">
                03 · Overland Storm Intake Peak Q_in
              </h4>
              <div className="font-mono text-sm font-bold bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7] text-terracotta-800 my-2">
                Q_in = C · I · A
              </div>
              <p className="text-xs text-[#554638] leading-relaxed">
                <strong>Plain English:</strong> The Rational Method calculating cubic meters of water rushing toward street drain grates every single second.
              </p>

              {expandedFormula === "inflow" && (
                <div className="mt-3.5 pt-3 border-t border-[#E8DFD3] space-y-2 text-xs">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7]">
                    <span className="font-bold text-[#221B15] block mb-1">Variable Breakdown:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#554638]">
                      <li><strong>C:</strong> Catchment runoff coefficient (0.81).</li>
                      <li><strong>I:</strong> Peak rainfall intensity (mm/h).</li>
                      <li><strong>A:</strong> Ward catchment surface area (hectares).</li>
                      <li><strong>Q_in:</strong> Peak volumetric flow in cubic meters per second (m³/s).</li>
                    </ul>
                  </div>
                  <div className="text-[#221B15]">
                    <strong>2015 Chennai Event Calibration:</strong> Peak overland flow reached 3.14 m³/s, easily drowning curb inlets designed for half that volume.
                  </div>
                </div>
              )}
            </div>

            {/* 04 Conduit Capacity */}
            <div
              onClick={() => setExpandedFormula(expandedFormula === "conduit" ? null : "conduit")}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                expandedFormula === "conduit"
                  ? "border-terracotta-400 bg-white shadow-lift ring-2 ring-terracotta-200"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-mono font-bold text-terracotta-800 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                  STAGE 04 · PIPE CONVEYANCE
                </span>
                <span className="text-xs font-bold text-terracotta-600">
                  {expandedFormula === "conduit" ? "Collapse ▲" : "Expand Details ▼"}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#221B15]">
                04 · Manning Conduit Discharge Capacity Q_cap
              </h4>
              <div className="font-mono text-sm font-bold bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7] text-terracotta-800 my-2">
                Q_cap = (1/n) · A · R^(2/3) · S^½
              </div>
              <p className="text-xs text-[#554638] leading-relaxed">
                <strong>Plain English:</strong> How much water an underground pipe can carry away by gravity alone. Siltation clogs the area (A), and reverse slopes throttle velocity.
              </p>

              {expandedFormula === "conduit" && (
                <div className="mt-3.5 pt-3 border-t border-[#E8DFD3] space-y-2 text-xs">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7]">
                    <span className="font-bold text-[#221B15] block mb-1">Variable Breakdown:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#554638]">
                      <li><strong>n:</strong> Manning roughness factor (0.015 for concrete, up to 0.035 with silt).</li>
                      <li><strong>A:</strong> Effective open cross-sectional flow area (m²).</li>
                      <li><strong>R:</strong> Hydraulic radius (Area / Wetted Perimeter).</li>
                      <li><strong>S:</strong> Pipe invert bed slope (gradient %).</li>
                    </ul>
                  </div>
                  <div className="text-[#221B15]">
                    <strong>2015 Chennai Event Calibration:</strong> CCTV probes logged 55% solid siltation in 1000mm trunk conduits, slashing discharge capacity to 2.76 m³/s.
                  </div>
                </div>
              )}
            </div>

            {/* 05 Outfall Boundary */}
            <div
              onClick={() => setExpandedFormula(expandedFormula === "outfall" ? null : "outfall")}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                expandedFormula === "outfall"
                  ? "border-terracotta-400 bg-white shadow-lift ring-2 ring-terracotta-200"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-mono font-bold text-terracotta-800 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                  STAGE 05 · BOUNDARY CONDITION
                </span>
                <span className="text-xs font-bold text-terracotta-600">
                  {expandedFormula === "outfall" ? "Collapse ▲" : "Expand Details ▼"}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#221B15]">
                05 · Canal Outfall Boundary Stage H_tail
              </h4>
              <div className="font-mono text-sm font-bold bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7] text-terracotta-800 my-2">
                H_tail = Z_canal + Δη_tide
              </div>
              <p className="text-xs text-[#554638] leading-relaxed">
                <strong>Plain English:</strong> The water height in Buckingham Canal at the drain exit. When high tide rises above the pipe crown, water cannot exit by gravity.
              </p>

              {expandedFormula === "outfall" && (
                <div className="mt-3.5 pt-3 border-t border-[#E8DFD3] space-y-2 text-xs">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7]">
                    <span className="font-bold text-[#221B15] block mb-1">Variable Breakdown:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#554638]">
                      <li><strong>Z_canal:</strong> Canal baseline bed level above Mean Sea Level (m MSL).</li>
                      <li><strong>Δη_tide:</strong> Astronomical storm surge tidal lift (m).</li>
                    </ul>
                  </div>
                  <div className="text-[#221B15]">
                    <strong>2015 Chennai Event Calibration:</strong> Buckingham Canal crested at +1.3m MSL, fully submerging outfall flap-gates and killing gravity flow.
                  </div>
                </div>
              )}
            </div>

            {/* 06 Backwater Inversion */}
            <div
              onClick={() => setExpandedFormula(expandedFormula === "backwater" ? null : "backwater")}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                expandedFormula === "backwater"
                  ? "border-terracotta-400 bg-white shadow-lift ring-2 ring-terracotta-200"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-mono font-bold text-terracotta-800 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                  STAGE 06 · HYDRAULIC SURCHARGE
                </span>
                <span className="text-xs font-bold text-terracotta-600">
                  {expandedFormula === "backwater" ? "Collapse ▲" : "Expand Details ▼"}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#221B15]">
                06 · Saint-Venant Backwater Inversion Wave
              </h4>
              <div className="font-mono text-sm font-bold bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7] text-terracotta-800 my-2">
                dy/dx = (S₀ - Sf) / (1 - Fr²)
              </div>
              <p className="text-xs text-[#554638] leading-relaxed">
                <strong>Plain English:</strong> Gradually Varied Flow backwater curve. High downstream canal water pushes upstream backward, blowing manhole covers off like geysers.
              </p>

              {expandedFormula === "backwater" && (
                <div className="mt-3.5 pt-3 border-t border-[#E8DFD3] space-y-2 text-xs">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7]">
                    <span className="font-bold text-[#221B15] block mb-1">Variable Breakdown:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#554638]">
                      <li><strong>S₀:</strong> Pipe invert slope.</li>
                      <li><strong>Sf:</strong> Friction gradient slope.</li>
                      <li><strong>Fr:</strong> Froude number (v / √(g·y) &lt; 1 for subcritical flow).</li>
                    </ul>
                  </div>
                  <div className="text-[#221B15]">
                    <strong>2015 Chennai Event Calibration:</strong> A positive backwater surge head of +1.03m turned Anna Nagar street manholes into pressurized outward fountains.
                  </div>
                </div>
              )}
            </div>

            {/* 07 Urban Stagnation */}
            <div
              onClick={() => setExpandedFormula(expandedFormula === "stagnation" ? null : "stagnation")}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 md:col-span-2 ${
                expandedFormula === "stagnation"
                  ? "border-terracotta-400 bg-white shadow-lift ring-2 ring-terracotta-200"
                  : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-mono font-bold text-terracotta-800 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                  STAGE 07 · INUNDATION OUTCOME
                </span>
                <span className="text-xs font-bold text-terracotta-600">
                  {expandedFormula === "stagnation" ? "Collapse ▲" : "Expand Details ▼"}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#221B15]">
                07 · Urban Inundation Stagnation Depth
              </h4>
              <div className="font-mono text-sm font-bold bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7] text-terracotta-800 my-2">
                D_pond = f(ΔQ, ΔH_back)
              </div>
              <p className="text-xs text-[#554638] leading-relaxed">
                <strong>Plain English:</strong> The final standing flood water level in front of houses, combining surface overflow excess plus the reverse fountain surge from manholes.
              </p>

              {expandedFormula === "stagnation" && (
                <div className="mt-3.5 pt-3 border-t border-[#E8DFD3] space-y-2 text-xs">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E0D5C7]">
                    <span className="font-bold text-[#221B15] block mb-1">Variable Breakdown:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#554638]">
                      <li><strong>ΔQ:</strong> Intake deficit (Q_in − Q_cap in m³/s).</li>
                      <li><strong>ΔH_back:</strong> Positive reverse backwater head (meters).</li>
                      <li><strong>D_pond:</strong> Surface stagnation ponding depth (meters).</li>
                    </ul>
                  </div>
                  <div className="text-[#221B15]">
                    <strong>2015 Chennai Event Calibration:</strong> Ward 101 registered 0.7m to 1.2m of toxic standing water that lingered for over 15 hours until canal gates opened.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Color & Risk Conventions */}
        <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#221B15] block">
            3. Color &amp; Risk Level Legend
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-emerald-200">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-800 block">🟢 Resilient Flow</span>
                <span className="text-[11px] text-[#554638] leading-relaxed">
                  Conduit discharge exceeds inflow; slope provides positive outward velocity.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-amber-200">
              <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-800 block">🟡 Throttled / Warning</span>
                <span className="text-[11px] text-[#554638] leading-relaxed">
                  Conduit velocity slowed by moderate silt or high canal stage; safety buffer eroded.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-red-200">
              <span className="h-3 w-3 rounded-full bg-red-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-800 block">🔴 Critical Failure</span>
                <span className="text-[11px] text-[#554638] leading-relaxed">
                  Conduit choked; reverse backwater head forces positive geysering onto streets.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
