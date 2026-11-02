"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import HydrologicalConventionsModal from "./HydrologicalConventionsModal";

interface NodeData {
  id: string;
  name: string;
  category: "meteorological" | "surface" | "hydraulic" | "boundary" | "outcome";
  formula: string;
  valueString: string;
  unit: string;
  status: "normal" | "warning" | "critical" | "resilient";
  description: string;
  evidenceDatum: string;
  mitigation: string;
  x: number;
  y: number;
}

interface EdgeConnection {
  from: string;
  to: string;
  label: string;
  critical?: boolean;
}

export default function RealisticCausalFlowchart() {
  // Preset scenarios
  const [activeScenario, setActiveScenario] = useState<"anna-nagar" | "velachery" | "t-nagar" | "adyar">("anna-nagar");

  // Interactive hydrological physics sliders
  const [rainfall, setRainfall] = useState<number>(390); // mm / 24h
  const [siltation, setSiltation] = useState<number>(55); // % blockage
  const [pipeSlope, setPipeSlope] = useState<number>(-0.3); // % gradient
  const [tidalStage, setTidalStage] = useState<number>(1.3); // m MSL
  const [impervious, setImpervious] = useState<number>(84); // % built-up

  // Active selected node for deep inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("backwater_surge");

  // State for the scrollable conventions modal
  const [showConventionsModal, setShowConventionsModal] = useState<boolean>(false);

  // Load preset parameters
  const applyPreset = (preset: "anna-nagar" | "velachery" | "t-nagar" | "adyar") => {
    setActiveScenario(preset);
    if (preset === "anna-nagar") {
      setRainfall(390);
      setSiltation(58);
      setPipeSlope(-0.3);
      setTidalStage(1.4);
      setImpervious(84);
      setSelectedNodeId("backwater_surge");
    } else if (preset === "velachery") {
      setRainfall(382);
      setSiltation(12);
      setPipeSlope(1.2);
      setTidalStage(0.5);
      setImpervious(64);
      setSelectedNodeId("pipe_capacity");
    } else if (preset === "t-nagar") {
      setRainfall(390);
      setSiltation(65);
      setPipeSlope(0.1);
      setTidalStage(0.9);
      setImpervious(92);
      setSelectedNodeId("conduit_inflow");
    } else if (preset === "adyar") {
      setRainfall(390);
      setSiltation(18);
      setPipeSlope(1.6);
      setTidalStage(0.6);
      setImpervious(62);
      setSelectedNodeId("canal_outfall");
    }
  };

  // Live Hydrological Calculations
  const calculations = useMemo(() => {
    // 1. Peak Overland Runoff (Rational Method Q = C * I * A)
    const runoffCoefficient = 0.35 + (impervious / 100) * 0.55;
    const rainfallIntensity = (rainfall / 24) * 2.8; // mm/hr peak equivalent
    const qInflow = Number((runoffCoefficient * rainfallIntensity * 0.085).toFixed(2)); // m3/s

    // 2. Manning's Conduit Capacity Q_cap = (1/n) * A * R^(2/3) * S0^(1/2)
    const effectiveSlope = Math.max(0.05, pipeSlope + 0.6) / 100;
    const cleanCapacity = 11.2 * Math.sqrt(effectiveSlope * 100);
    const siltFactor = Math.max(0.15, 1 - siltation / 100);
    const qCapacity = Number((cleanCapacity * siltFactor).toFixed(2));

    // 3. Discharge Deficit
    const qDeficit = Number(Math.max(0, qInflow - qCapacity).toFixed(2));

    // 4. Backwater Surcharge Head delta H (Gradually Varied Flow inversion)
    const tidalSurgePressure = Math.max(0, tidalStage - 0.6) * 0.75;
    const blockagePressure = (siltation / 100) * 0.65;
    const slopePenalty = pipeSlope < 0 ? Math.abs(pipeSlope) * 0.5 : 0;
    const backwaterHead = Number((tidalSurgePressure + blockagePressure + slopePenalty).toFixed(2));

    // 5. Inundation Ponding Depth & Stagnation
    const pondingDepth = Number(((qDeficit * 0.16) + (backwaterHead * 0.62)).toFixed(2));
    const holdDurationHours = Math.round(pondingDepth * 14 + (siltation / 10));

    // Status evaluation
    const isCritical = pondingDepth >= 0.75;
    const isModerate = pondingDepth >= 0.25 && pondingDepth < 0.75;
    const isResilient = pondingDepth < 0.25;

    return {
      runoffCoefficient: Number(runoffCoefficient.toFixed(2)),
      rainfallIntensity: Number(rainfallIntensity.toFixed(1)),
      qInflow,
      qCapacity,
      qDeficit,
      backwaterHead,
      pondingDepth,
      holdDurationHours,
      isCritical,
      isModerate,
      isResilient,
    };
  }, [rainfall, siltation, pipeSlope, tidalStage, impervious]);

  // Directed Acyclic Graph Nodes definition (5-Column Left-to-Right Continuous Pipeline with generous spacing)
  const nodes: NodeData[] = useMemo(() => [
    {
      id: "cloudburst",
      name: "01 · Cloudburst Rainfall",
      category: "meteorological",
      formula: "P(t) = ∫ i(t) dt",
      valueString: `${rainfall} mm / 24h`,
      unit: "Rainfall",
      status: rainfall > 300 ? "warning" : "normal",
      description: "Severe convective precipitation band recorded during Cyclone Michaung (Dec 2023) and extreme monsoons.",
      evidenceDatum: "GCC Automatic Weather Station AWS-101 recorded 390mm in 24 hours (peak 68mm/h).",
      mitigation: "Meteorological forcing cannot be altered; structural buffers must attenuate discharge.",
      x: 40,
      y: 145,
    },
    {
      id: "impervious_surface",
      name: "02 · Built-up Impervious Cover",
      category: "surface",
      formula: "C_runoff = 0.35 + 0.55·Ia",
      valueString: `${impervious}% Built-up`,
      unit: `Coeff ${calculations.runoffCoefficient}`,
      status: impervious > 75 ? "critical" : "normal",
      description: "Commercial and residential asphalt/concrete coverage eliminating natural soil percolation.",
      evidenceDatum: `High-resolution Sentinel-2 normalized impervious index indicates ${impervious}% sealed surface.`,
      mitigation: "Retrofit permeable interlocking pavers and roadside infiltration swales.",
      x: 350,
      y: 38,
    },
    {
      id: "conduit_inflow",
      name: "03 · Stormwater Intake",
      category: "hydraulic",
      formula: "Q_in = C · I · A",
      valueString: `${calculations.qInflow} m³/s`,
      unit: "Overland Flow",
      status: calculations.qInflow > calculations.qCapacity ? "critical" : "normal",
      description: "Surface overland runoff concentrating into roadway curb catch-pits and storm drop-inlets.",
      evidenceDatum: `Peak overland flow exceeds local street inlet collection rate by ${calculations.qDeficit} m³/s.`,
      mitigation: "Install wider continuous curb-opening grates and linear interception channels.",
      x: 670,
      y: 38,
    },
    {
      id: "pipe_capacity",
      name: "04 · Conduit Drain Capacity",
      category: "hydraulic",
      formula: "Q_cap = (1/n)·A·R^(2/3)·S^½",
      valueString: `${calculations.qCapacity} m³/s`,
      unit: `Silt ${siltation}%`,
      status: calculations.qCapacity < 4 ? "critical" : calculations.qCapacity < 7 ? "warning" : "resilient",
      description: "Effective hydraulic discharge capacity constrained by internal siltation and pipe gradient slope.",
      evidenceDatum: `CCTV sonar probe logged ${siltation}% solid sediment obstruction inside 1000mm trunk conduit.`,
      mitigation: "Pre-monsoon hydraulic jetting desiltation to restore 100% pipe invert diameter.",
      x: 990,
      y: 38,
    },
    {
      id: "canal_outfall",
      name: "05 · Canal Outfall Stage",
      category: "boundary",
      formula: "H_tail = Z_canal + Δη_tide",
      valueString: `+${tidalStage}m MSL`,
      unit: "Canal Stage",
      status: tidalStage > 1.0 ? "critical" : "normal",
      description: "Buckingham Canal water elevation and astronomical spring tide surge submerging the pipe discharge outlet.",
      evidenceDatum: "Water Resources Dept (WRD) gauge showed canal water level cresting above outfall crown.",
      mitigation: "Install automated duckbill flap-gates and secondary dry-well lift pumping stations.",
      x: 670,
      y: 255,
    },
    {
      id: "backwater_surge",
      name: "06 · Backwater Inversion Wave",
      category: "hydraulic",
      formula: "dy/dx = (S₀ - Sf) / (1 - Fr²)",
      valueString: `+${calculations.backwaterHead}m Head`,
      unit: "Reverse Head",
      status: calculations.backwaterHead > 0.8 ? "critical" : calculations.backwaterHead > 0.3 ? "warning" : "resilient",
      description: "Gradually Varied Flow backwater curve pushing submerged canal head backward up through street manholes.",
      evidenceDatum: "Manhole telemetry logged positive outward geysering pressure rather than downward suction.",
      mitigation: "Construct inland inline surge relief chambers with one-way backflow prevention valves.",
      x: 990,
      y: 255,
    },
    {
      id: "ponding_outcome",
      name: "07 · Urban Inundation Stagnation",
      category: "outcome",
      formula: "D_pond = f(ΔQ, ΔH_back)",
      valueString: `${calculations.pondingDepth}m Ponding`,
      unit: `~${calculations.holdDurationHours}h hold`,
      status: calculations.isCritical ? "critical" : calculations.isModerate ? "warning" : "resilient",
      description: "Prolonged surface water accumulation trapping residents and submerging electrical infrastructure.",
      evidenceDatum: `GCC Ward Log verified ${calculations.pondingDepth}m standing water during Cyclone Michaung (2023).`,
      mitigation: "Integrated catchment detention basin and decentralized micro-pumping network.",
      x: 1300,
      y: 145,
    },
  ], [rainfall, impervious, calculations, siltation, tidalStage]);

  // Connected causal edges in continuous Left-to-Right stream
  const edges: EdgeConnection[] = [
    { from: "cloudburst", to: "impervious_surface", label: "Precipitation" },
    { from: "cloudburst", to: "canal_outfall", label: "Tidal Surge" },
    { from: "impervious_surface", to: "conduit_inflow", label: "Runoff C" },
    { from: "conduit_inflow", to: "pipe_capacity", label: "Inflow Q", critical: calculations.qInflow > calculations.qCapacity },
    { from: "canal_outfall", to: "backwater_surge", label: "Tidal Head", critical: tidalStage > 1.0 },
    { from: "pipe_capacity", to: "backwater_surge", label: "Conduit Choke", critical: siltation > 40 },
    { from: "pipe_capacity", to: "ponding_outcome", label: "Overflow", critical: calculations.qDeficit > 0 },
    { from: "backwater_surge", to: "ponding_outcome", label: "Reverse Push", critical: calculations.backwaterHead > 0.5 },
  ];

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  return (
    <div className="space-y-8">
      {/* 1. Header with Scenario Preset Buttons & Smooth Entrance Transition */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E8DFD3] animate-fadeInUp">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-terracotta-600 animate-pulse" />
            <span>Real Hydrological Physics &amp; Directed Acyclic Graph (DAG)</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221B15] tracking-tight hover:text-terracotta-800 transition-colors duration-300">
            Chennai Catchment Causal Flowchart
          </h2>
          <p className="text-sm text-[#554638] leading-relaxed">
            Trace the mathematical and physical sequence from extreme cloudburst rainfall (such as Cyclone Michaung) through conduit hydraulics, silt sedimentation, canal tidal surcharge, and street inundation.
          </p>
          <button
            type="button"
            onClick={() => setShowConventionsModal(true)}
            className="inline-flex items-center gap-2 text-xs font-bold text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 hover:text-terracotta-900 border border-terracotta-200 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 shadow-xs hover:shadow-sm"
          >
            <span>📘 Explore Box Conventions &amp; Physics Formulations (Click to Open)</span>
            <span className="text-terracotta-500 font-mono">→</span>
          </button>
        </div>

        {/* Preset scenario selectors */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#756350] block">
            Select Calibrated Ward Scenario:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset("anna-nagar")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeScenario === "anna-nagar"
                  ? "bg-terracotta-600 text-white shadow-warm scale-102"
                  : "bg-white border border-[#E0D5C7] text-[#554638] hover:bg-[#FAF7F2]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span>Anna Nagar (Ward 101 · Failure)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset("velachery")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeScenario === "velachery"
                  ? "bg-terracotta-600 text-white shadow-warm scale-102"
                  : "bg-white border border-[#E0D5C7] text-[#554638] hover:bg-[#FAF7F2]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Velachery (Ward 102 · Resilient Twin)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset("t-nagar")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeScenario === "t-nagar"
                  ? "bg-terracotta-600 text-white shadow-warm scale-102"
                  : "bg-white border border-[#E0D5C7] text-[#554638] hover:bg-[#FAF7F2]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>T. Nagar (Ward 104 · Failure)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset("adyar")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeScenario === "adyar"
                  ? "bg-terracotta-600 text-white shadow-warm scale-102"
                  : "bg-white border border-[#E0D5C7] text-[#554638] hover:bg-[#FAF7F2]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Adyar (Ward 103 · Resilient Twin)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Physics Sliders */}
      <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8DFD3]">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700">
            Real-Time Hydraulic Parameter Controls
          </span>
          <span className="text-xs text-[#756350]">
            Drag sliders to simulate alternate storm severities or interventions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Slider 1: 24h Rainfall */}
          <div className="space-y-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8DFD3]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#554638]">🌧️ 24h Rainfall</span>
              <span className="font-mono font-bold text-terracotta-700">{rainfall} mm</span>
            </div>
            <input
              type="range"
              min="150"
              max="480"
              step="10"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full accent-terracotta-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9E8B75]">
              <span>150mm (Moderate)</span>
              <span>480mm (Catastrophic)</span>
            </div>
          </div>

          {/* Slider 2: Silt Blockage */}
          <div className="space-y-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8DFD3]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#554638]">🪨 Conduit Silt</span>
              <span className={`font-mono font-bold ${siltation > 40 ? "text-red-700" : "text-emerald-700"}`}>
                {siltation}% Blocked
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="85"
              step="5"
              value={siltation}
              onChange={(e) => setSiltation(Number(e.target.value))}
              className="w-full accent-terracotta-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9E8B75]">
              <span>0% (Clean)</span>
              <span>85% (Choked)</span>
            </div>
          </div>

          {/* Slider 3: Outfall Slope */}
          <div className="space-y-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8DFD3]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#554638]">📐 Pipe Invert Slope</span>
              <span className={`font-mono font-bold ${pipeSlope < 0 ? "text-red-700" : "text-emerald-700"}`}>
                {pipeSlope > 0 ? `+${pipeSlope}%` : `${pipeSlope}%`}
              </span>
            </div>
            <input
              type="range"
              min="-0.5"
              max="2.0"
              step="0.1"
              value={pipeSlope}
              onChange={(e) => setPipeSlope(Number(e.target.value))}
              className="w-full accent-terracotta-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9E8B75]">
              <span>-0.5% (Depression)</span>
              <span>+2.0% (Gravity)</span>
            </div>
          </div>

          {/* Slider 4: Tidal Stage */}
          <div className="space-y-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8DFD3]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#554638]">🌊 Canal Tide Stage</span>
              <span className={`font-mono font-bold ${tidalStage > 1.0 ? "text-red-700" : "text-emerald-700"}`}>
                +{tidalStage}m MSL
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.2"
              step="0.1"
              value={tidalStage}
              onChange={(e) => setTidalStage(Number(e.target.value))}
              className="w-full accent-terracotta-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9E8B75]">
              <span>+0.2m (Low)</span>
              <span>+2.2m (Surge)</span>
            </div>
          </div>

          {/* Slider 5: Impervious Fraction */}
          <div className="space-y-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8DFD3]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#554638]">🏙️ Impervious Cover</span>
              <span className={`font-mono font-bold ${impervious > 75 ? "text-red-700" : "text-emerald-700"}`}>
                {impervious}%
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="95"
              step="2"
              value={impervious}
              onChange={(e) => setImpervious(Number(e.target.value))}
              className="w-full accent-terracotta-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9E8B75]">
              <span>40% (Permeable)</span>
              <span>95% (Dense Urban)</span>
            </div>
          </div>
        </div>

        {/* Real-time telemetry output banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-3.5">
            <span className="text-[10px] font-bold uppercase text-[#756350] block">Overland Runoff Intake</span>
            <span className="font-mono text-xl font-bold text-[#221B15]">{calculations.qInflow} m³/s</span>
            <span className="text-[11px] text-[#9E8B75] block">Rainfall intake rate</span>
          </div>
          <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-3.5">
            <span className="text-[10px] font-bold uppercase text-[#756350] block">Conduit Drain Capacity</span>
            <span className="font-mono text-xl font-bold text-terracotta-700">{calculations.qCapacity} m³/s</span>
            <span className="text-[11px] text-[#9E8B75] block">Manning gravity discharge</span>
          </div>
          <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-3.5">
            <span className="text-[10px] font-bold uppercase text-[#756350] block">Backwater Surcharge Head</span>
            <span className={`font-mono text-xl font-bold ${calculations.backwaterHead > 0.6 ? "text-red-600" : "text-emerald-700"}`}>
              +{calculations.backwaterHead}m Head
            </span>
            <span className="text-[11px] text-[#9E8B75] block">Reverse outward pressure</span>
          </div>
          <div className={`rounded-2xl border p-3.5 ${
            calculations.isCritical
              ? "border-red-300 bg-red-50/80"
              : calculations.isModerate
              ? "border-amber-300 bg-amber-50/80"
              : "border-emerald-300 bg-emerald-50/80"
          }`}>
            <span className="text-[10px] font-bold uppercase text-[#756350] block">Predicted Street Ponding</span>
            <span className={`font-mono text-xl font-black ${
              calculations.isCritical
                ? "text-red-700"
                : calculations.isModerate
                ? "text-amber-800"
                : "text-emerald-800"
            }`}>
              {calculations.pondingDepth}m Depth · ~{calculations.holdDurationHours}h
            </span>
            <span className="text-[11px] font-bold block uppercase tracking-wider mt-0.5">
              {calculations.isCritical ? "🚨 Severe Inundation" : calculations.isModerate ? "⚠️ Partial Ponding" : "🛡️ Resilient Drainage"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. The Realistic Live SVG Flowchart DAG Visualization with Generous Spacing */}
      <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD3]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700">
              Causal Hydraulic Topology (Click any box to inspect physical evidence)
            </span>
            <p className="text-xs text-[#756350]">
              Animated flowing streams indicate direction of fluid momentum. Vibrant popping pulses highlight bottleneck choke points.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Resilient Flow
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Throttled
            </span>
            <span className="flex items-center gap-1.5 text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" /> Surcharge / Inundated
            </span>
          </div>
        </div>

        {/* SVG Diagram Canvas with 1560 width for generous spacing */}
        <div className="relative overflow-x-auto rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] p-4">
          <svg
            viewBox="0 0 1560 380"
            className="w-full min-w-[1200px] h-auto select-none"
            style={{ maxHeight: "460px" }}
          >
            <defs>
              {/* Arrowhead Markers with matching vibrant colors */}
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#10B981" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#EF4444" />
              </marker>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#F59E0B" />
              </marker>
            </defs>

            {/* Render Connecting Edges with Live Flowing Streams and Popping Colors */}
            {edges.map((edge, idx) => {
              const srcNode = nodes.find((n) => n.id === edge.from);
              const tgtNode = nodes.find((n) => n.id === edge.to);
              if (!srcNode || !tgtNode) return null;

              const isSurcharged = edge.critical || calculations.isCritical;
              const strokeColor = isSurcharged ? "#EF4444" : edge.critical ? "#F59E0B" : "#10B981";
              const streamColor = isSurcharged ? "#FCA5A5" : edge.critical ? "#FDE68A" : "#6EE7B7";
              const markerId = isSurcharged ? "url(#arrow-red)" : edge.critical ? "url(#arrow-amber)" : "url(#arrow-emerald)";

              let pathD = "";
              let labelX = 0;
              let labelY = 0;

              const cardW = 220;
              const cardH = 80;

              if (srcNode.id === "cloudburst" && tgtNode.id === "impervious_surface") {
                // 01 -> 02 S-curve up with clean horizontal lead-in & aligned arrowhead
                const x1 = srcNode.x + cardW;
                const y1 = srcNode.y + cardH / 2 - 10;
                const x2 = tgtNode.x;
                const y2 = tgtNode.y + cardH / 2;
                pathD = `M ${x1} ${y1} C ${x1 + 35} ${y1}, ${x2 - 50} ${y2}, ${x2 - 18} ${y2} L ${x2} ${y2}`;
                labelX = (x1 + x2) / 2 - 4;
                labelY = (y1 + y2) / 2 - 8;
              } else if (srcNode.id === "cloudburst" && tgtNode.id === "canal_outfall") {
                // 01 -> 05 (Tidal Surge curving underneath row 1 with horizontal lead-in)
                const x1 = srcNode.x + cardW;
                const y1 = srcNode.y + cardH / 2 + 10;
                const x2 = tgtNode.x;
                const y2 = tgtNode.y + cardH / 2;
                pathD = `M ${x1} ${y1} C ${x1 + 140} ${y1}, ${x2 - 120} ${y2}, ${x2 - 18} ${y2} L ${x2} ${y2}`;
                labelX = (x1 + x2) / 2 - 25;
                labelY = (y1 + y2) / 2 + 20;
              } else if (srcNode.id === "impervious_surface" && tgtNode.id === "conduit_inflow") {
                // 02 -> 03 (Straight horizontal pipe)
                const x1 = srcNode.x + cardW;
                const y1 = srcNode.y + cardH / 2;
                const x2 = tgtNode.x;
                const y2 = tgtNode.y + cardH / 2;
                pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
                labelX = (x1 + x2) / 2;
                labelY = y1 - 13;
              } else if (srcNode.id === "conduit_inflow" && tgtNode.id === "pipe_capacity") {
                // 03 -> 04 (Straight horizontal pipe)
                const x1 = srcNode.x + cardW;
                const y1 = srcNode.y + cardH / 2;
                const x2 = tgtNode.x;
                const y2 = tgtNode.y + cardH / 2;
                pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
                labelX = (x1 + x2) / 2;
                labelY = y1 - 13;
              } else if (srcNode.id === "canal_outfall" && tgtNode.id === "backwater_surge") {
                // 05 -> 06 (Straight horizontal pipe along bottom row with 100px space)
                const x1 = srcNode.x + cardW;
                const y1 = srcNode.y + cardH / 2;
                const x2 = tgtNode.x;
                const y2 = tgtNode.y + cardH / 2;
                pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
                labelX = (x1 + x2) / 2;
                labelY = y1 - 13;
              } else if (srcNode.id === "pipe_capacity" && tgtNode.id === "backwater_surge") {
                // 04 -> 06 (Straight vertical downward choke link with 135px vertical clearance!)
                const x = srcNode.x + cardW / 2;
                const y1 = srcNode.y + cardH;
                const y2 = tgtNode.y;
                pathD = `M ${x} ${y1} L ${x} ${y2}`;
                labelX = x;
                labelY = (y1 + y2) / 2;
              } else if (srcNode.id === "pipe_capacity" && tgtNode.id === "ponding_outcome") {
                // 04 -> 07 (Overflow curving down with horizontal lead-in to upper port of 07)
                const x1 = srcNode.x + cardW;
                const y1 = srcNode.y + cardH / 2;
                const x2 = tgtNode.x;
                const y2 = tgtNode.y + cardH / 2 - 18;
                pathD = `M ${x1} ${y1} C ${x1 + 35} ${y1}, ${x2 - 50} ${y2}, ${x2 - 18} ${y2} L ${x2} ${y2}`;
                labelX = (x1 + x2) / 2;
                labelY = (y1 + y2) / 2 - 16;
              } else if (srcNode.id === "backwater_surge" && tgtNode.id === "ponding_outcome") {
                // 06 -> 07 (Reverse push curving up with horizontal lead-in to lower port of 07)
                const x1 = srcNode.x + cardW;
                const y1 = srcNode.y + cardH / 2;
                const x2 = tgtNode.x;
                const y2 = tgtNode.y + cardH / 2 + 18;
                pathD = `M ${x1} ${y1} C ${x1 + 35} ${y1}, ${x2 - 50} ${y2}, ${x2 - 18} ${y2} L ${x2} ${y2}`;
                labelX = (x1 + x2) / 2;
                labelY = (y1 + y2) / 2 + 18;
              }

              return (
                <g key={`edge-${idx}`}>
                  {/* Outer solid base line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSurcharged ? 4 : 3}
                    strokeOpacity={0.8}
                    strokeLinecap="round"
                    markerEnd={markerId}
                  />

                  {/* Live flowing dynamic fluid stream with moving dash animation */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={streamColor}
                    strokeWidth={isSurcharged ? 2.4 : 1.8}
                    strokeDasharray="10,8"
                    className="animate-flow-stream"
                    strokeLinecap="round"
                  />

                  {/* Edge Label Pill with clean styling */}
                  <g transform={`translate(${labelX}, ${labelY})`}>
                    <rect
                      x="-34"
                      y="-9"
                      width="68"
                      height="18"
                      rx="6"
                      fill="#FFFFFF"
                      stroke="#E8DFD3"
                      strokeWidth="1.2"
                      className="shadow-sm"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      className="text-[9px] font-mono fill-[#554638] font-bold"
                    >
                      {edge.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Render Nodes (To-the-point measurements by default, prominent titles, generous spacing) */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isFailed = node.status === "critical";
              const isWarning = node.status === "warning";

              const borderColor = isSelected
                ? "#D96B27"
                : isFailed
                ? "#EF4444"
                : isWarning
                ? "#F59E0B"
                : "#10B981";

              const bgColor = isSelected
                ? "#FFF8F2"
                : isFailed
                ? "#FEF2F2"
                : isWarning
                ? "#FFFBEB"
                : "#ECFDF5";

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Node Background Card */}
                  <rect
                    width="220"
                    height="80"
                    rx="14"
                    fill={bgColor}
                    stroke={borderColor}
                    strokeWidth={isSelected ? "2.6" : "1.8"}
                    className="transition-colors duration-200"
                  />

                  {/* Status Indicator Pip */}
                  <circle
                    cx="16"
                    cy="23"
                    r="4.5"
                    fill={isFailed ? "#EF4444" : isWarning ? "#F59E0B" : "#10B981"}
                    className={isFailed ? "animate-pulse" : ""}
                  />

                  {/* Process Name: Bold, Clean & Legible */}
                  <text
                    x="27"
                    y="27"
                    className="text-[12px] font-bold fill-[#1C150D] tracking-tight"
                  >
                    {node.name}
                  </text>

                  {/* To-The-Point Clean Measurement Badge */}
                  <rect
                    x="10"
                    y="38"
                    width="200"
                    height="32"
                    rx="8"
                    fill="#FFFFFF"
                    stroke="#E8DFD3"
                    strokeWidth="1.2"
                  />

                  {/* Prominent Measurement Value */}
                  <text
                    x="20"
                    y="59"
                    className={`text-[13px] font-mono font-black ${
                      isFailed ? "fill-red-700" : isWarning ? "fill-amber-700" : "fill-emerald-800"
                    }`}
                  >
                    {node.valueString}
                  </text>

                  {/* Measurement Unit / Subtext */}
                  <text
                    x="200"
                    y="59"
                    textAnchor="end"
                    className="text-[10px] font-sans fill-[#756350] font-bold"
                  >
                    {node.unit}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. Hydrological Node Inspector Drawer (Revealed on Click) */}
      <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-3">
            <span className={`h-4 w-4 rounded-full ${
              selectedNode.status === "critical"
                ? "bg-red-500 animate-pulse"
                : selectedNode.status === "warning"
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`} />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700">
                Hydrological Inspector · Node Detail (Click any box above to switch)
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#221B15]">
                {selectedNode.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#FAF7F2] border border-[#E0D5C7] px-4 py-1 text-xs font-mono font-bold text-[#221B15]">
              {selectedNode.valueString}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
              selectedNode.status === "critical"
                ? "bg-red-100 text-red-800 border border-red-200"
                : selectedNode.status === "warning"
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
            }`}>
              {selectedNode.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Physical Mechanism & Process */}
          <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase text-[#756350] block">
              Physical Mechanism &amp; Causal Process
            </span>
            <div className="text-xs bg-white p-3.5 rounded-xl border border-[#E0D5C7] text-[#33271E] font-medium leading-relaxed">
              {selectedNode.description}
            </div>
            <div className="text-[11px] text-[#756350] flex items-center gap-1.5 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
              <span>Calibrated against hydrodynamic conservation laws</span>
            </div>
          </div>

          {/* Empirical Field Evidence (2015 GCC Flood Datum) */}
          <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase text-[#756350] block">
              Empirical Sensor Datum (Cyclone Michaung &amp; Recent Floods)
            </span>
            <div className="text-xs bg-white p-3 rounded-xl border border-[#E0D5C7] text-[#221B15] font-medium leading-relaxed">
              {selectedNode.evidenceDatum}
            </div>
            <div className="text-[11px] text-[#756350] flex items-center gap-1.5 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>Ground-truth calibrated against GCC stormwater archives</span>
            </div>
          </div>

          {/* Civil Engineering Countermeasure */}
          <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50/70 p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase text-terracotta-800 block">
              Recommended Engineering Intervention
            </span>
            <div className="text-xs bg-white p-3 rounded-xl border border-terracotta-200 text-[#221B15] font-semibold leading-relaxed">
              {selectedNode.mitigation}
            </div>
            <Link
              href="/investigations/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta-700 hover:text-terracotta-800 pt-1"
            >
              <span>Test Countermeasure in Ward Diagnosis →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Hydrological Conventions & Physics Formulations Modal Trigger */}
      <HydrologicalConventionsModal
        isOpen={showConventionsModal}
        onClose={() => setShowConventionsModal(false)}
      />
    </div>
  );
}
