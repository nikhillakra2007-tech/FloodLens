"use client";

import React from "react";

interface HydrologicalFlowchartVisualProps {
  className?: string;
  compact?: boolean;
}

export default function HydrologicalFlowchartVisual({
  className = "",
  compact = false,
}: HydrologicalFlowchartVisualProps) {
  return (
    <div
      className={`w-full relative select-none ${className}`}
      role="img"
      aria-label="Scientific hydrological causal chain: 1. Rainfall Forcing (390mm Michaung) -> 2. Catchment Runoff (Q=CIA) -> 3. Drainage Network (SWD Culvert) -> 4. Hydraulic Bottleneck (+1.03m Head dy/dx) -> 5. Flood Risk Output (Ponding)"
    >
      <svg
        viewBox="0 0 360 270"
        className="w-full h-auto drop-shadow-2xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Arrow Markers for Directional Flow */}
          <marker
            id="flow-arrow-blue"
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="5"
            markerHeight="5"
            orient="auto-reverse"
          >
            <path d="M 0 1 L 5 3 L 0 5 z" fill="#2563EB" />
          </marker>

          <marker
            id="flow-arrow-amber"
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="5"
            markerHeight="5"
            orient="auto-reverse"
          >
            <path d="M 0 1 L 5 3 L 0 5 z" fill="#D97706" />
          </marker>

          <marker
            id="flow-arrow-slate"
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="5"
            markerHeight="5"
            orient="auto-reverse"
          >
            <path d="M 0 1 L 5 3 L 0 5 z" fill="#475569" />
          </marker>

          <marker
            id="flow-arrow-crimson"
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="5"
            markerHeight="5"
            orient="auto-reverse"
          >
            <path d="M 0 1 L 5 3 L 0 5 z" fill="#DC2626" />
          </marker>

          {/* Hatch pattern for inundation ponding area */}
          <pattern
            id="inundationHatch"
            width="6"
            height="6"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#EA580C" strokeWidth="1.2" strokeOpacity="0.4" />
          </pattern>
        </defs>

        {/* Outer Background Card */}
        <rect
          x="1"
          y="1"
          width="358"
          height="268"
          rx="12"
          fill="#FAF8F5"
          stroke="#E5DDD0"
          strokeWidth="1"
        />

        {/* ================================================================ */}
        {/* STAGE 1: RAINFALL FORCING (Top-Left)                            */}
        {/* ================================================================ */}
        <g id="stage-1-rainfall">
          <rect
            x="12"
            y="12"
            width="145"
            height="62"
            rx="8"
            fill="#EFF6FF"
            stroke="#BFDBFE"
            strokeWidth="1.2"
          />
          {/* Stage badge */}
          <circle cx="24" cy="24" r="7" fill="#2563EB" />
          <text x="24" y="27" fill="#FFFFFF" fontSize="8" fontWeight="700" textAnchor="middle">
            1
          </text>
          <text x="36" y="26" fill="#1E3A8A" fontSize="9" fontWeight="700" fontFamily="sans-serif">
            Rainfall Forcing
          </text>

          {/* Radar / Cloudburst Details */}
          <g transform="translate(20, 36)">
            {/* Doppler Cloud Icon */}
            <path
              d="M5 14a4 4 0 0 1-1-7.87 5 5 0 0 1 9.5-1.5 3.5 3.5 0 0 1 4 4.37A3 3 0 0 1 17 14H5z"
              fill="#DBEAFE"
              stroke="#3B82F6"
              strokeWidth="1"
            />
            {/* Falling rain streaks */}
            <line x1="6" y1="16" x2="4" y2="20" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" />
            <line x1="11" y1="16" x2="9" y2="20" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" />
            <line x1="16" y1="16" x2="14" y2="20" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" />
          </g>

          <text x="44" y="44" fill="#1E40AF" fontSize="8.5" fontWeight="600" fontFamily="monospace">
            390 mm / 24h
          </text>
          <text x="44" y="55" fill="#3B82F6" fontSize="7" fontWeight="500" fontFamily="sans-serif">
            IMD Doppler Cloudburst
          </text>
        </g>

        {/* FLOW ARROW 1 -> 2 (Rainfall to Catchment) */}
        <path
          d="M 157 43 L 195 43"
          stroke="#2563EB"
          strokeWidth="1.5"
          fill="none"
          markerEnd="url(#flow-arrow-blue)"
        />
        <text x="176" y="38" fill="#1D4ED8" fontSize="6.5" fontWeight="600" textAnchor="middle">
          Inflow
        </text>

        {/* ================================================================ */}
        {/* STAGE 2: CATCHMENT RUNOFF (Top-Right)                           */}
        {/* ================================================================ */}
        <g id="stage-2-catchment">
          <rect
            x="203"
            y="12"
            width="145"
            height="62"
            rx="8"
            fill="#FEFCE8"
            stroke="#FDE047"
            strokeWidth="1.2"
          />
          {/* Stage badge */}
          <circle cx="215" cy="24" r="7" fill="#D97706" />
          <text x="215" y="27" fill="#FFFFFF" fontSize="8" fontWeight="700" textAnchor="middle">
            2
          </text>
          <text x="227" y="26" fill="#854D0E" fontSize="9" fontWeight="700" fontFamily="sans-serif">
            Catchment Runoff
          </text>

          {/* Topographic Contours Illustration */}
          <g transform="translate(215, 34)">
            <path d="M 0 6 Q 16 0, 32 8" stroke="#CA8A04" strokeWidth="0.9" strokeDasharray="2 1" fill="none" />
            <path d="M 0 14 Q 16 7, 32 15" stroke="#A16207" strokeWidth="1" fill="none" />
            <path d="M 0 22 Q 16 14, 32 23" stroke="#854D0E" strokeWidth="1.2" fill="none" />
          </g>

          <text x="255" y="44" fill="#854D0E" fontSize="8.5" fontWeight="600" fontFamily="monospace">
            Q = C·I·A
          </text>
          <text x="255" y="55" fill="#A16207" fontSize="7" fontWeight="500" fontFamily="sans-serif">
            DEM 12.4m → 8.2m Slope
          </text>
        </g>

        {/* FLOW ARROW 2 -> 3 (Catchment Runoff to Drainage Network) */}
        <path
          d="M 275 74 L 275 95"
          stroke="#D97706"
          strokeWidth="1.5"
          fill="none"
          markerEnd="url(#flow-arrow-amber)"
        />
        <text x="288" y="87" fill="#B45309" fontSize="6.5" fontWeight="600">
          Runoff
        </text>

        {/* ================================================================ */}
        {/* STAGE 3: DRAINAGE NETWORK (Center-Right)                        */}
        {/* ================================================================ */}
        <g id="stage-3-drainage">
          <rect
            x="190"
            y="97"
            width="158"
            height="62"
            rx="8"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          {/* Stage badge */}
          <circle cx="202" cy="109" r="7" fill="#475569" />
          <text x="202" y="112" fill="#FFFFFF" fontSize="8" fontWeight="700" textAnchor="middle">
            3
          </text>
          <text x="214" y="111" fill="#1E293B" fontSize="9" fontWeight="700" fontFamily="sans-serif">
            Drainage Network
          </text>

          {/* SWD Box Culvert Conduit Illustration */}
          <g transform="translate(202, 120)">
            {/* Culvert outer walls */}
            <rect x="0" y="0" width="36" height="24" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
            {/* Water flow layer inside conduit */}
            <rect x="2" y="8" width="32" height="14" rx="1" fill="#93C5FD" opacity="0.6" />
            {/* Velocity vectors */}
            <line x1="6" y1="15" x2="28" y2="15" stroke="#1D4ED8" strokeWidth="1" strokeDasharray="3 2" />
          </g>

          <text x="246" y="129" fill="#1E293B" fontSize="8.5" fontWeight="600" fontFamily="monospace">
            SWD Box Culvert
          </text>
          <text x="246" y="140" fill="#64748B" fontSize="7" fontWeight="500" fontFamily="sans-serif">
            Manning n = 0.015 | S₀ -0.3%
          </text>
        </g>

        {/* FLOW ARROW 3 -> 4 (Drainage to Bottleneck) */}
        <path
          d="M 190 128 L 158 128"
          stroke="#475569"
          strokeWidth="1.5"
          fill="none"
          markerEnd="url(#flow-arrow-slate)"
        />
        <text x="174" y="122" fill="#475569" fontSize="6.5" fontWeight="600" textAnchor="middle">
          Conduit
        </text>

        {/* ================================================================ */}
        {/* STAGE 4: HYDRAULIC BOTTLENECK (Center-Left)                     */}
        {/* ================================================================ */}
        <g id="stage-4-bottleneck">
          <rect
            x="12"
            y="97"
            width="144"
            height="62"
            rx="8"
            fill="#FEF2F2"
            stroke="#FECACA"
            strokeWidth="1.2"
          />
          {/* Stage badge */}
          <circle cx="24" cy="109" r="7" fill="#DC2626" />
          <text x="24" y="112" fill="#FFFFFF" fontSize="8" fontWeight="700" textAnchor="middle">
            4
          </text>
          <text x="36" y="111" fill="#991B1B" fontSize="9" fontWeight="700" fontFamily="sans-serif">
            Hydraulic Bottleneck
          </text>

          {/* Backwater Surge Node Indicator */}
          <g transform="translate(20, 122)">
            {/* Obstruction / constricted constriction */}
            <path d="M 0 0 L 12 10 L 0 20 Z" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1" />
            {/* Backwater head wave */}
            <path d="M 15 5 Q 22 0, 30 10 T 36 20" stroke="#DC2626" strokeWidth="1.5" fill="none" />
            <circle cx="28" cy="10" r="3" fill="#DC2626" />
          </g>

          <text x="60" y="129" fill="#991B1B" fontSize="8.5" fontWeight="700" fontFamily="monospace">
            +1.03 m Backwater
          </text>
          <text x="60" y="140" fill="#DC2626" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            GVF Gradient dy/dx &gt; 0
          </text>
        </g>

        {/* FLOW ARROW 4 -> 5 (Bottleneck Surcharge to Flood Risk) */}
        <path
          d="M 84 159 L 84 175 Q 84 185, 96 185 L 140 185"
          stroke="#DC2626"
          strokeWidth="1.5"
          fill="none"
          markerEnd="url(#flow-arrow-crimson)"
        />
        <text x="96" y="178" fill="#B91C1C" fontSize="6.5" fontWeight="600">
          Surcharge Overflow
        </text>

        {/* ================================================================ */}
        {/* STAGE 5: FLOOD RISK OUTPUT (Bottom-Center-Right)                */}
        {/* ================================================================ */}
        <g id="stage-5-floodrisk">
          <rect
            x="148"
            y="166"
            width="200"
            height="58"
            rx="8"
            fill="#FFF7ED"
            stroke="#FDBA74"
            strokeWidth="1.2"
          />
          {/* Stage badge */}
          <circle cx="160" cy="178" r="7" fill="#EA580C" />
          <text x="160" y="181" fill="#FFFFFF" fontSize="8" fontWeight="700" textAnchor="middle">
            5
          </text>
          <text x="172" y="180" fill="#9A3412" fontSize="9" fontWeight="700" fontFamily="sans-serif">
            Flood Risk Output
          </text>

          {/* Ponding / Inundation Hazard Polygon */}
          <g transform="translate(160, 189)">
            <rect
              x="0"
              y="2"
              width="42"
              height="24"
              rx="4"
              fill="url(#inundationHatch)"
              stroke="#EA580C"
              strokeWidth="1"
            />
            <text x="21" y="16" fill="#C2410C" fontSize="7" fontWeight="700" textAnchor="middle">
              Ponding
            </text>
          </g>

          <text x="210" y="197" fill="#9A3412" fontSize="8.5" fontWeight="700" fontFamily="monospace">
            Velachery Ward 170
          </text>
          <text x="210" y="208" fill="#C2410C" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            0.45m Surface Waterlogging Isolated
          </text>
        </g>

        {/* ================================================================ */}
        {/* BOTTOM SCIENTIFIC LEGEND                                         */}
        {/* ================================================================ */}
        <g id="scientific-legend" transform="translate(12, 234)">
          <rect
            x="0"
            y="0"
            width="336"
            height="26"
            rx="6"
            fill="#FFFFFF"
            stroke="#E2D7C7"
            strokeWidth="0.8"
          />

          {/* Item 1 */}
          <circle cx="12" cy="13" r="3.5" fill="#2563EB" />
          <text x="19" y="16" fill="#1E3A8A" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            1. Rainfall
          </text>

          {/* Item 2 */}
          <circle cx="72" cy="13" r="3.5" fill="#D97706" />
          <text x="79" y="16" fill="#854D0E" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            2. Runoff
          </text>

          {/* Item 3 */}
          <circle cx="130" cy="13" r="3.5" fill="#475569" />
          <text x="137" y="16" fill="#334155" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            3. Conduit
          </text>

          {/* Item 4 */}
          <circle cx="190" cy="13" r="3.5" fill="#DC2626" />
          <text x="197" y="16" fill="#991B1B" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            4. Bottleneck
          </text>

          {/* Item 5 */}
          <circle cx="264" cy="13" r="3.5" fill="#EA580C" />
          <text x="271" y="16" fill="#9A3412" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            5. Risk Output
          </text>
        </g>
      </svg>
    </div>
  );
}

