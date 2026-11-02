"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { getGraph } from "@/lib/api/investigations";
import { LoadingSkeleton, ErrorState } from "@/components/ui";
import type { MechanismGraph, MechanismGraphNode, MechanismGraphEdge } from "@/lib/types/evidence";

export interface MechanismGraphProps {
  investigationId: string;
  selectedMechanismId?: string | null;
}

export default function MechanismGraph({ investigationId, selectedMechanismId }: MechanismGraphProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [showFullModal, setShowFullModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when full graph modal is open
  useEffect(() => {
    if (showFullModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showFullModal]);

  const { data: graph, isLoading, error } = useQuery<MechanismGraph>({
    queryKey: ["graph", investigationId],
    queryFn: () => getGraph(investigationId),
    enabled: !!investigationId,
  });

  if (isLoading) return <LoadingSkeleton variant="card" className="h-96" />;
  if (error) return <ErrorState message={`Failed to load graph: ${error.message}`} />;
  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-8 text-center">
        <p className="text-sm text-[#756350]">No mechanism graph data available for this catchment.</p>
      </div>
    );
  }

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  // Embedded Canvas Layout (Sleek, uncluttered, no edge text)
  const embeddedWidth = 760;
  const embeddedHeight = 400;
  const embeddedLayout: Record<string, { x: number; y: number }> = {
    rainfall: { x: 70, y: 110 },
    catchment: { x: 195, y: 110 },
    runoff: { x: 380, y: 65 },
    drain_network: { x: 535, y: 65 },
    bottleneck: { x: 660, y: 170 },
    flood_observation: { x: 705, y: 75 },
    terrain_storage: { x: 285, y: 310 },
    outfall: { x: 535, y: 330 },
  };

  const embeddedPositions = new Map<string, { x: number; y: number }>();
  graph.nodes.forEach((n, i) => {
    if (embeddedLayout[n.id]) {
      embeddedPositions.set(n.id, embeddedLayout[n.id]);
    } else {
      const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
      embeddedPositions.set(n.id, {
        x: embeddedWidth / 2 + 220 * Math.cos(angle),
        y: embeddedHeight / 2 + 130 * Math.sin(angle),
      });
    }
  });

  // Full-Screen Modal Canvas Layout (Strict Hierarchical DAG with zero overlapping paths)
  const modalWidth = 1120;
  const modalHeight = 520;
  const modalLayout: Record<string, { x: number; y: number }> = {
    rainfall: { x: 80, y: 140 },
    catchment: { x: 270, y: 140 },
    runoff: { x: 540, y: 80 },
    drain_network: { x: 760, y: 80 },
    bottleneck: { x: 940, y: 220 },
    flood_observation: { x: 1040, y: 90 },
    terrain_storage: { x: 400, y: 400 },
    outfall: { x: 760, y: 440 },
  };

  const modalPositions = new Map<string, { x: number; y: number }>();
  graph.nodes.forEach((n, i) => {
    if (modalLayout[n.id]) {
      modalPositions.set(n.id, modalLayout[n.id]);
    } else {
      const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
      modalPositions.set(n.id, {
        x: modalWidth / 2 + 350 * Math.cos(angle),
        y: modalHeight / 2 + 180 * Math.sin(angle),
      });
    }
  });

  // Semantic Hydrological Node Color Palettes
  const getNodeVisuals = (node: MechanismGraphNode) => {
    const id = node.id.toLowerCase();
    if (id === "rainfall") {
      return {
        fill: "#E0F2FE", // Sky 100
        stroke: "#0284C7", // Sky 600
        text: "#0369A1",
        subText: "#0284C7",
        glow: "rgba(2, 132, 199, 0.25)",
      };
    }
    if (id === "catchment") {
      return {
        fill: "#DCFCE7", // Emerald 100
        stroke: "#16A34A", // Emerald 600
        text: "#15803D",
        subText: "#16A34A",
        glow: "rgba(22, 163, 74, 0.25)",
      };
    }
    if (id === "runoff") {
      return {
        fill: "#CCFBF1", // Teal 100
        stroke: "#0D9488", // Teal 600
        text: "#0F766E",
        subText: "#0D9488",
        glow: "rgba(13, 148, 136, 0.25)",
      };
    }
    if (id === "terrain_storage" || id.includes("terrain") || id.includes("storage")) {
      return {
        fill: "#FEF3C7", // Amber 100
        stroke: "#D97706", // Amber 600
        text: "#B45309",
        subText: "#D97706",
        glow: "rgba(217, 119, 6, 0.25)",
      };
    }
    if (id === "drain_network" || id.includes("drain")) {
      return {
        fill: "#EEF2FF", // Indigo 100
        stroke: "#4F46E5", // Indigo 600
        text: "#4338CA",
        subText: "#4F46E5",
        glow: "rgba(79, 70, 229, 0.25)",
      };
    }
    if (id === "bottleneck") {
      return {
        fill: "#FFEDD5", // Orange 100
        stroke: "#EA580C", // Orange 600
        text: "#C2410C",
        subText: "#EA580C",
        glow: "rgba(234, 88, 12, 0.25)",
      };
    }
    if (id === "outfall") {
      return {
        fill: "#CFFAFE", // Cyan 100
        stroke: "#0891B2", // Cyan 600
        text: "#0E7490",
        subText: "#0891B2",
        glow: "rgba(8, 145, 178, 0.25)",
      };
    }
    if (id === "flood_observation" || node.node_type === "observation") {
      return {
        fill: "#FFE4E6", // Rose 100
        stroke: "#E11D48", // Rose 600
        text: "#BE123C",
        subText: "#E11D48",
        glow: "rgba(225, 29, 72, 0.25)",
      };
    }
    return {
      fill: "#F3E8FF", // Purple 100
      stroke: "#9333EA", // Purple 600
      text: "#7E22CE",
      subText: "#9333EA",
      glow: "rgba(147, 51, 234, 0.25)",
    };
  };

  const selectedNode = activeNodeId ? nodeMap.get(activeNodeId) : null;
  const activeIncomingEdges = activeNodeId ? graph.edges.filter((e) => e.target === activeNodeId) : [];
  const activeOutgoingEdges = activeNodeId ? graph.edges.filter((e) => e.source === activeNodeId) : [];

  // Helper to get concise, non-overlapping label for full view
  const getCleanLabel = (label: string) => {
    if (label.toLowerCase().includes("runoff generation")) {
      return "Impervious Runoff";
    }
    return label;
  };

  // Helper to render SVG content cleanly for either embedded or full modal view
  const renderGraphSvg = (
    posMap: Map<string, { x: number; y: number }>,
    svgWidth: number,
    svgHeight: number,
    showEdgeLabels: boolean,
    nodeRadius: number
  ) => {
    return (
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto select-none block"
        role="img"
        aria-label="Mechanism relationship graph. See text alternative below."
      >
        <defs>
          <marker id="dag-arrow-fact" viewBox="0 0 10 10" refX={nodeRadius + 7} refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#16A34A" />
          </marker>
          <marker id="dag-arrow-supported" viewBox="0 0 10 10" refX={nodeRadius + 7} refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#4F46E5" />
          </marker>
          <marker id="dag-arrow-hypothesis" viewBox="0 0 10 10" refX={nodeRadius + 7} refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#EA580C" />
          </marker>
          <filter id="pill-shadow" x="-10%" y="-15%" width="120%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#332418" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* Directed Causal Edges */}
        {graph.edges.map((edge, i) => {
          const src = posMap.get(edge.source);
          const tgt = posMap.get(edge.target);
          if (!src || !tgt) return null;

          const isHighlighted = activeNodeId
            ? edge.source === activeNodeId || edge.target === activeNodeId
            : true;

          const strokeColor =
            edge.certainty_level === "FACT"
              ? "#16A34A"
              : edge.certainty_level === "SUPPORTED"
              ? "#4F46E5"
              : "#EA580C";

          const markerUrl =
            edge.certainty_level === "FACT"
              ? "url(#dag-arrow-fact)"
              : edge.certainty_level === "SUPPORTED"
              ? "url(#dag-arrow-supported)"
              : "url(#dag-arrow-hypothesis)";

          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2;
          const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);

          const displayLabel = getCleanLabel(edge.label);
          const pillWidth = Math.max(88, displayLabel.length * 6.6 + 22);
          const pillHeight = 22;

          return (
            <g key={i} opacity={isHighlighted ? 1 : 0.15}>
              <line
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={strokeColor}
                strokeWidth={isHighlighted && activeNodeId ? 3.5 : 2.2}
                strokeDasharray={edge.relation_type === "CAUSAL_HYPOTHESIS" ? "5,3" : undefined}
                markerEnd={markerUrl}
              />
              {/* Process Name Pill (Rendered ONLY in full modal to guarantee zero clustering!) */}
              {showEdgeLabels && dist > 60 && (
                <g filter="url(#pill-shadow)" className="pointer-events-none select-none">
                  <rect
                    x={midX - pillWidth / 2}
                    y={midY - pillHeight / 2}
                    width={pillWidth}
                    height={pillHeight}
                    rx={pillHeight / 2}
                    fill="#FFFFFF"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    opacity={0.98}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    className="fill-[#1E293B] text-[10px] font-sans font-bold tracking-tight"
                  >
                    {displayLabel}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes (No CSS scale transforms to completely prevent flickering!) */}
        {graph.nodes.map((n) => {
          const pos = posMap.get(n.id);
          if (!pos) return null;

          const isSelected = activeNodeId === n.id;
          const visuals = getNodeVisuals(n);

          let line1 = n.label;
          let line2: string | null = null;
          if (n.label.includes(" ")) {
            const parts = n.label.split(" ");
            line1 = parts[0];
            line2 = parts.slice(1).join(" ");
          } else if (n.label.length > 9) {
            line1 = n.label;
          }

          return (
            <g
              key={n.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveNodeId(activeNodeId === n.id ? null : n.id);
              }}
              className="cursor-pointer"
            >
              {/* Outer focus halo */}
              {isSelected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius + 8}
                  fill="none"
                  stroke={visuals.stroke}
                  strokeWidth={2.5}
                  strokeDasharray="4,2"
                  opacity={0.9}
                  className="pointer-events-none"
                />
              )}
              {/* Main Node Circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill={visuals.fill}
                stroke={visuals.stroke}
                strokeWidth={isSelected ? 3.8 : 2.2}
                style={{ filter: `drop-shadow(0 2px 5px ${visuals.glow})` }}
              />
              {/* Node Label Text */}
              {line2 ? (
                <>
                  <text
                    x={pos.x}
                    y={pos.y - 3}
                    textAnchor="middle"
                    className="text-[9.5px] font-bold select-none pointer-events-none"
                    fill={visuals.text}
                  >
                    {line1}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 8}
                    textAnchor="middle"
                    className="text-[9px] font-bold select-none pointer-events-none"
                    fill={visuals.text}
                  >
                    {line2}
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    className="text-[10px] font-bold select-none pointer-events-none"
                    fill={visuals.text}
                  >
                    {line1}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 11}
                    textAnchor="middle"
                    className="text-[7.5px] uppercase font-mono font-semibold select-none pointer-events-none opacity-80"
                    fill={visuals.subText}
                  >
                    {n.node_type}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Embedded DAG Canvas (Clean, unclustered with clear directed arrows) */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E8DFD3] bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] p-4 shadow-sm">
        {/* Canvas Toolbar Header with Full Visual Graph Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]/80">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-bold text-[#554638]">Causal DAG Interaction Canvas</span>
          </div>

          <button
            type="button"
            onClick={() => setShowFullModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-terracotta-200 bg-white hover:bg-terracotta-50 text-terracotta-800 px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-warm hover:border-terracotta-300"
          >
            <svg className="h-3.5 w-3.5 text-terracotta-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>Full Visual Graph</span>
          </button>
        </div>

        {/* Embedded SVG (ShowEdgeLabels = false to eliminate text clustering!) */}
        <div className="py-2">
          {renderGraphSvg(embeddedPositions, embeddedWidth, embeddedHeight, false, 25)}
        </div>

        {/* Multi-Domain Legend */}
        <div className="pt-3 border-t border-[#E8DFD3]/80 space-y-2 text-xs font-semibold text-[#554638]" aria-hidden="true">
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center items-center">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" /> Fact Link
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4F46E5]" /> Supported Evidence
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EA580C]" /> Causal Hypothesis
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center items-center text-[11px] text-[#756350]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-[#0284C7] bg-[#E0F2FE]" /> Rainfall (Input)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-[#16A34A] bg-[#DCFCE7]" /> Catchment
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-[#0D9488] bg-[#CCFBF1]" /> Runoff
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-[#D97706] bg-[#FEF3C7]" /> Storage
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-[#4F46E5] bg-[#EEF2FF]" /> Drain Net
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-[#EA580C] bg-[#FFEDD5]" /> Bottleneck
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-[#0891B2] bg-[#CFFAFE]" /> Outfall
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border border-[#E11D48] bg-[#FFE4E6]" /> Flood Inundation
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Node Inspector */}
      {selectedNode ? (
        <div className="rounded-2xl border border-terracotta-200 bg-[#FFFDF9] p-4 space-y-3 animate-fadeIn shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700">
                Selected Node Details
              </span>
              <h4 className="font-serif text-base font-bold text-[#221B15]">
                {selectedNode.label}
              </h4>
            </div>
            <span className="rounded-full bg-terracotta-50 border border-terracotta-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-terracotta-800">
              {selectedNode.node_type}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Incoming */}
            <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD3]">
              <span className="font-bold text-[#554638] uppercase tracking-wider text-[10px] block">
                Incoming Drivers ({activeIncomingEdges.length})
              </span>
              {activeIncomingEdges.length === 0 ? (
                <span className="text-gray-400 italic">None (Root Trigger)</span>
              ) : (
                <ul className="space-y-1">
                  {activeIncomingEdges.map((e, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="font-semibold text-[#221B15]">{nodeMap.get(e.source)?.label}</span>
                      <span className="text-[10px] font-mono text-terracotta-700 font-bold">{getCleanLabel(e.label)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Outgoing */}
            <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD3]">
              <span className="font-bold text-[#554638] uppercase tracking-wider text-[10px] block">
                Outgoing Impact ({activeOutgoingEdges.length})
              </span>
              {activeOutgoingEdges.length === 0 ? (
                <span className="text-gray-400 italic">None (Terminal Outcome)</span>
              ) : (
                <ul className="space-y-1">
                  {activeOutgoingEdges.map((e, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="font-semibold text-[#221B15]">{nodeMap.get(e.target)?.label}</span>
                      <span className="text-[10px] font-mono text-blue-700 font-bold">{getCleanLabel(e.label)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DFD3C1] bg-[#FAF7F2]/50 p-3.5 text-center text-xs text-[#756350]">
          💡 Click any node in the graph above to trace its specific incoming drivers and downstream flood impacts.
        </div>
      )}

      {/* Accessible Text Alternative (Preserved for Screen Readers and Vitest test) */}
      <details className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-3 text-xs">
        <summary className="cursor-pointer font-bold text-[#554638] hover:text-terracotta-700">
          Text alternative for graph relationships
        </summary>
        <ul className="mt-2 space-y-1.5 text-xs text-[#554638]">
          {graph.edges.map((edge, i) => (
            <li key={i} className="rounded-xl bg-white border border-[#E8DFD3] p-2">
              <strong>{nodeMap.get(edge.source)?.label ?? edge.source}</strong>
              {" → "}
              <strong>{nodeMap.get(edge.target)?.label ?? edge.target}</strong>
              <div className="text-[11px] text-[#756350] mt-0.5">
                {edge.label} · {edge.relation_type.replace(/_/g, " ")} · {edge.certainty_level} ({edge.evidence_ids.length} evidence items)
              </div>
            </li>
          ))}
        </ul>
      </details>

      {/* FULL-SCREEN POPUP MODAL WITH BACKDROP BLUR (Deep blur background & spacious HD layout with process names) */}
      {showFullModal && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-fadeIn cursor-pointer"
          onClick={() => setShowFullModal(false)}
        >
          <div
            className="relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl border border-[#E8DFD3] bg-[#FFFDF9] shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Pinned at top, never scrolled away! */}
            <div className="shrink-0 flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-[#E8DFD3] bg-[#FFFDF9]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-terracotta-800">
                  <span className="h-2 w-2 rounded-full bg-terracotta-600 animate-pulse" />
                  <span>Comprehensive Causal DAG · 2023 Cyclone Michaung Calibrated</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#221B15] tracking-tight">
                  High-Definition Causal DAG Interaction Graph
                </h2>
                <p className="text-xs text-[#554638]">
                  Expanded physical failure propagation view. Process labels and hydraulic connections displayed with complete spatial breathing room.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="rounded-2xl border border-[#E0D5C7] bg-white p-2.5 text-[#554638] hover:bg-terracotta-50 hover:text-terracotta-800 hover:border-terracotta-300 transition-all cursor-pointer shadow-sm shrink-0"
                aria-label="Close Full Graph"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* HD Canvas with Spacious Process Name Pills */}
              <div className="rounded-2xl border border-[#E8DFD3] bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] p-4 sm:p-6 shadow-inner">
                {renderGraphSvg(modalPositions, modalWidth, modalHeight, true, 28)}
              </div>

              {/* Legend inside Modal */}
              <div className="pt-2 border-t border-[#E8DFD3] space-y-2 text-xs font-semibold text-[#554638]">
                <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#16A34A]" /> Fact Link (Empirical Certainty)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#4F46E5]" /> Supported Evidence (Proxy Alignment)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#EA580C]" /> Causal Hypothesis (Physical Plausibility)
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer: Pinned at bottom */}
            <div className="shrink-0 flex justify-end p-4 sm:p-5 border-t border-[#E8DFD3] bg-[#FFFDF9]">
              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 px-7 py-2.5 text-xs font-bold text-white shadow-warm transition-all cursor-pointer"
              >
                Close Full Graph
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
