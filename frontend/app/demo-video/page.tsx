"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Scene {
  id: number;
  duration: number; // in seconds
  title: string;
  subtitle: string;
  badge: string;
  voiceover: string;
  bulletPoints: string[];
  visualType: "hook" | "concept" | "architecture" | "demo" | "impact" | "outro";
}

const SCENES: Scene[] = [
  {
    id: 1,
    duration: 25,
    title: "The Urban Flood Paradox",
    subtitle: "Why did your street drown when the next ward stayed dry?",
    badge: "01 · PROBLEM STATEMENT",
    voiceover:
      "Every monsoon in coastal metropolises like Chennai, citizens face a baffling paradox: identical cloudburst rainfall drowns one street in 3 feet of water, while the adjacent ward stays completely dry. Conventional flood maps only show static blue water depth polygons after the damage is done. They fail to explain the physical root cause.",
    bulletPoints: [
      "Rainfall is uniform across adjacent wards (390mm+ cloudburst)",
      "Standard flood warning maps only display depth, not cause",
      "Citizens & engineers lack actionable diagnostics of underground failure",
    ],
    visualType: "hook",
  },
  {
    id: 2,
    duration: 35,
    title: "Introducing FloodLens",
    subtitle: "Differential Urban Hydrological Intelligence",
    badge: "02 · THE INNOVATION",
    voiceover:
      "Meet FloodLens: the world's first differential urban flood mechanism diagnostic engine. Inspired by clinical twin studies in medical science, FloodLens pairs inundated urban catchments with resilient twin wards across elevation gradients, stormwater drain conduits, and impervious cover to mathematically isolate the exact structural failure mechanism.",
    bulletPoints: [
      "Twin Catchment Formulation: Compares flooded sites with resilient twins",
      "Physical Mechanism Isolation: Identifies silt choke vs. tidal backwater",
      "Deterministic Lineage: Every claim traces back to raw satellite & GCC datum",
    ],
    visualType: "concept",
  },
  {
    id: 3,
    duration: 40,
    title: "Serverless AWS Cloud Architecture",
    subtitle: "Production-grade, secure, and infinitely scalable",
    badge: "03 · TECH STACK & AWS",
    voiceover:
      "FloodLens is powered by a production serverless AWS cloud pipeline. Datasets from Copernicus DEM, ESA WorldCover, and Greater Chennai Corporation are synced to an AES-256 encrypted, versioned Amazon S3 bucket with SHA-256 integrity verification. Our FastAPI backend is packaged in Amazon ECR and runs on AWS Lambda using the AWS Lambda Web Adapter for sub-millisecond response times at zero idle cost. For causal AI inference, Amazon Bedrock runs Claude 3.5 Sonnet to generate verified physical explanations.",
    bulletPoints: [
      "Amazon S3: Encrypted, versioned hydrological datum with SHA-256 manifests",
      "Amazon ECR + AWS Lambda: Containerized FastAPI via AWS Lambda Web Adapter",
      "Amazon Bedrock: APAC Claude 3.5 Sonnet for causal AI & defensibility audits",
      "AWS CloudFormation: 100% Infrastructure-as-Code automated deployment",
    ],
    visualType: "architecture",
  },
  {
    id: 4,
    duration: 35,
    title: "Interactive Causal Simulation",
    subtitle: "From Directed Acyclic Graphs to Counterfactual Interventions",
    badge: "04 · LIVE DEMO",
    voiceover:
      "Our interactive platform lets users explore physical infrastructure cross-sections, click underground conduit pins to inspect silt accumulation, and manipulate real-time hydraulic parameters like Manning's pipe slope and tidal surge. With the built-in Counterfactual Simulator, civil planners can test interventions—like desilting conduits or expanding pervious green cover—to calculate exact reductions in inundation depth.",
    bulletPoints: [
      "Interactive 3D Conduit Cross-Section: Explains bottlenecks to citizens",
      "Dynamic DAG Causal Flowchart: Animated fluid momentum and pressure heads",
      "Counterfactual Simulator: Real-time calculation of intervention impact",
    ],
    visualType: "demo",
  },
  {
    id: 5,
    duration: 25,
    title: "Civic & Environmental Impact",
    subtitle: "Transforming disaster relief into proactive urban prevention",
    badge: "05 · IMPACT & GROWTH",
    voiceover:
      "FloodLens shifts urban resilience from reactive disaster relief to precision prevention. Municipal corporations can prioritize high-ROI desilting before cyclones hit, while citizens gain transparent, evidence-backed explanations of their flood risk. Building this on AWS proved that modern serverless cloud and generative AI can solve critical environmental crises.",
    bulletPoints: [
      "Saves millions in misallocated municipal drainage budgets",
      "Empowers vulnerable communities with transparent causal evidence",
      "Scalable blueprint for coastal cities across the Global South",
    ],
    visualType: "impact",
  },
];

export default function DemoVideoPage() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);

  const currentScene = SCENES[currentSceneIndex];
  const totalDuration = SCENES.reduce((acc, s) => acc + s.duration, 0);

  // Calculate overall elapsed time
  const elapsedBeforeCurrent = SCENES.slice(0, currentSceneIndex).reduce(
    (acc, s) => acc + s.duration,
    0
  );
  const currentTotalElapsed = elapsedBeforeCurrent + (sceneProgress / 100) * currentScene.duration;

  // Playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSceneProgress((prev) => {
          if (prev >= 100) {
            if (currentSceneIndex < SCENES.length - 1) {
              setCurrentSceneIndex((idx) => idx + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          const step = (100 / currentScene.duration) * 0.1;
          return Math.min(prev + step, 100);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIndex, currentScene.duration]);

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const jumpToScene = (index: number) => {
    setCurrentSceneIndex(index);
    setSceneProgress(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex items-center justify-between py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <span>← Back to Live App</span>
          </Link>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Demo Showcase Pitch Reel (Under 3 Mins)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTeleprompter(!showTeleprompter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showTeleprompter
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {showTeleprompter ? "🎙️ Teleprompter ON" : "🎙️ Teleprompter OFF"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            {isFullscreen ? "Exit Fullscreen" : "⛶ Fullscreen Recording"}
          </button>
        </div>
      </header>

      {/* Main 16:9 Video Canvas Frame */}
      <main
        ref={playerRef}
        className="relative my-6 w-full max-w-6xl aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B0F19] via-[#080C14] to-[#04060A] border border-cyan-500/20 shadow-2xl flex flex-col justify-between p-6 sm:p-10 select-none transition-all"
      >
        {/* Animated Background Ambience */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] animate-pulse"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>

        {/* Top Video Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-sm shadow-cyan-500/10">
              {currentScene.badge}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">
              Scene {currentScene.id} of {SCENES.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
              REC · 1080p60
            </span>
            <span className="text-xs font-mono text-slate-500 ml-2">
              {formatTime(currentTotalElapsed)} / {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* Scene Dynamic Body Content */}
        <div className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Title & Key Narrative */}
          <div className="md:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              {currentScene.title}
            </h1>
            <p className="text-base sm:text-lg text-cyan-300 font-medium">
              {currentScene.subtitle}
            </p>

            <ul className="space-y-2.5 pt-2">
              {currentScene.bulletPoints.map((pt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-xl backdrop-blur-sm"
                >
                  <span className="text-cyan-400 font-bold">▶</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Visual Diagram Cards per Scene */}
          <div className="md:col-span-5 flex justify-center">
            {currentScene.visualType === "hook" && (
              <div className="w-full space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-red-500/30 backdrop-blur-md">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-red-400 font-bold">🚨 2023 CLOUDBURST ANOMALY</span>
                  <span className="text-slate-400">390mm / 24h</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40">
                    <span className="text-[10px] text-slate-400 block font-bold">Ward 101 (Anna Nagar)</span>
                    <span className="text-xl font-mono font-black text-red-400">1.2m PONDING</span>
                    <span className="text-[10px] text-red-300 block">Severe Inundation</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                    <span className="text-[10px] text-slate-400 block font-bold">Ward 102 (Velachery)</span>
                    <span className="text-xl font-mono font-black text-emerald-400">0.0m DRAINED</span>
                    <span className="text-[10px] text-emerald-300 block">Dry Resilient Twin</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center italic">
                  Identical rainfall. Opposite outcomes. Why?
                </p>
              </div>
            )}

            {currentScene.visualType === "concept" && (
              <div className="w-full space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-md">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Twin Catchment Causal Formulation
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-cyan-400 space-y-1">
                  <div>Q_peak = C · I · A</div>
                  <div className="text-amber-300">Q_conduit = (1/n) · A · R^(2/3) · S^(1/2)</div>
                  <div className="text-red-400">Δ_Surcharge = H_canal - Z_invert &gt; 0</div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                  <span>Elevation Gradient</span>
                  <span className="text-cyan-400 font-bold">✓ Calibrated</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Conduit Silt Profile</span>
                  <span className="text-red-400 font-bold">⚠️ Isolated Bottleneck</span>
                </div>
              </div>
            )}

            {currentScene.visualType === "architecture" && (
              <div className="w-full space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30 backdrop-blur-md">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                  AWS Cloud Pipeline Stack
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-amber-400">📦 Amazon S3</span>
                    <span className="font-mono text-[10px] text-slate-400">AES-256 + SHA-256 Hashes</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-cyan-400">⚡ AWS Lambda Container</span>
                    <span className="font-mono text-[10px] text-slate-400">Lambda Web Adapter (FastAPI)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-purple-400">🧠 Amazon Bedrock</span>
                    <span className="font-mono text-[10px] text-slate-400">Claude 3.5 Sonnet (APAC)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-emerald-400">📜 CloudFormation</span>
                    <span className="font-mono text-[10px] text-slate-400">1-Command Automated IaC</span>
                  </div>
                </div>
              </div>
            )}

            {currentScene.visualType === "demo" && (
              <div className="w-full space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-md">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Counterfactual Intervention Test
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Baseline Runoff:</span>
                    <span className="font-mono font-bold text-red-400">3.14 m³/s</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Intervention:</span>
                    <span className="font-mono text-cyan-300">30% Desilting + Bioswales</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span>Counterfactual Discharge:</span>
                    <span className="font-mono font-bold text-emerald-400">1.82 m³/s</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center font-mono font-bold text-emerald-300 text-sm">
                    ▼ 42.0% Flood Depth Reduction
                  </div>
                </div>
              </div>
            )}

            {currentScene.visualType === "impact" && (
              <div className="w-full space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-md text-center">
                <div className="text-3xl font-black text-cyan-300 font-mono">100%</div>
                <div className="text-xs font-bold text-slate-200">
                  Defensible Root Cause Lineage
                </div>
                <p className="text-[11px] text-slate-400">
                  Zero black-box hallucinations. Every AI explanation is anchored in physical hydraulic equations and satellite truth.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    Municipal Ready
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Civic Open Data
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Teleprompter Subtitles Overlay */}
        {showTeleprompter && (
          <div className="relative z-10 p-3.5 rounded-2xl bg-slate-950/85 border border-cyan-500/20 backdrop-blur-md text-xs sm:text-sm text-slate-200 leading-relaxed text-center shadow-lg">
            <span className="text-cyan-400 font-bold mr-2">🎙️ Voiceover:</span>
            {currentScene.voiceover}
          </div>
        )}

        {/* Player Controls & Scrubber */}
        <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            {SCENES.map((s, idx) => {
              const widthPct = (s.duration / totalDuration) * 100;
              let fillPct = 0;
              if (idx < currentSceneIndex) fillPct = 100;
              else if (idx === currentSceneIndex) fillPct = sceneProgress;
              return (
                <div
                  key={s.id}
                  style={{ width: `${widthPct}%` }}
                  className="h-full border-r border-slate-950/40 relative cursor-pointer group"
                  onClick={() => jumpToScene(idx)}
                >
                  <div
                    style={{ width: `${fillPct}%` }}
                    className="h-full bg-cyan-400 transition-all duration-100 group-hover:bg-cyan-300"
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Buttons & Scene Quick Jump */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>{isPlaying ? "⏸ Pause" : "▶ Play Pitch"}</span>
              </button>

              <button
                onClick={() => {
                  if (currentSceneIndex > 0) jumpToScene(currentSceneIndex - 1);
                }}
                disabled={currentSceneIndex === 0}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                ⏮ Prev
              </button>

              <button
                onClick={() => {
                  if (currentSceneIndex < SCENES.length - 1)
                    jumpToScene(currentSceneIndex + 1);
                }}
                disabled={currentSceneIndex === SCENES.length - 1}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                Next ⏭
              </button>
            </div>

            {/* Scene Selector Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {SCENES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => jumpToScene(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    idx === currentSceneIndex
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {s.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Screen-Recording Quick Instructions Footer */}
      <footer className="w-full max-w-6xl py-3 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">💡 How to Record This:</span>
          <span>
            Click <strong>⛶ Fullscreen Recording</strong>, hit <strong>Win + Alt + R</strong> (Windows Game Bar) or OBS, and press <strong>▶ Play Pitch</strong>.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-cyan-400 font-bold">Target Duration: 2m 40s (&lt; 3 mins)</span>
        </div>
      </footer>
    </div>
  );
}
