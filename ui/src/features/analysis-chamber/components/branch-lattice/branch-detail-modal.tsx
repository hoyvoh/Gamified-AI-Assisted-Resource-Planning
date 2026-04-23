"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

import type { BranchNodeData } from "./branch-node";

export interface BranchDetailModalProps {
  open: boolean;
  branch: BranchNodeData | null;
  onClose: () => void;
}

const MODAL_KEYFRAMES = `
  /* ── Backdrop ── */
  @keyframes modalBackdropIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalBackdropOut { from { opacity: 1; } to { opacity: 0; } }

  /*
   * ── Float wrapper (centering + vertical bob) ──
   * Only ever animates translateY — centering is baked into the wrapper's
   * static transform: translate(-50%, -50%); no conflict with card entry.
   */
  @keyframes modalFloat {
    0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
    50%       { transform: translate(-50%, -50%) translateY(-3px); }
  }
  @keyframes modalFloatOut {
    from { transform: translate(-50%, -50%) translateY(var(--float-y, 0px)); }
    to   { transform: translate(-50%, -50%) translateY(4px); }
  }

  /*
   * ── Card inner (scale + blur + opacity only, no translate) ──
   * Summon: rises via scale + subtle Y inside the flow, blur clears, tiny overshoot.
   */
  @keyframes modalCardIn {
    0%   { opacity: 0; transform: scale(0.86) translateY(8px);  filter: blur(10px); }
    45%  { opacity: 1; filter: blur(1px); }
    72%  { transform: scale(1.013) translateY(-1px); filter: blur(0); }
    100% { opacity: 1; transform: scale(1)   translateY(0px);   filter: blur(0); }
  }
  @keyframes modalCardOut {
    0%   { opacity: 1; transform: scale(1)    translateY(0px); filter: blur(0); }
    100% { opacity: 0; transform: scale(0.91) translateY(6px); filter: blur(5px); }
  }

  /* ── Breathing glow (box-shadow only, lives on inner card) ── */
  @keyframes modalBreathGlow {
    0%, 100% {
      box-shadow:
        0 24px 64px rgba(0,0,0,0.72),
        0 0 0 1px var(--modal-border),
        0 0 24px var(--modal-glow-dim);
    }
    50% {
      box-shadow:
        0 28px 80px rgba(0,0,0,0.78),
        0 0 0 1px var(--modal-border-bright),
        0 0 54px var(--modal-glow),
        0 0 88px var(--modal-glow-far);
    }
  }

  /* ── One-time open bloom (runs before breathGlow settles in) ── */
  @keyframes modalOpenBloom {
    0%   { box-shadow: 0 0 0 1px var(--modal-border-bright), 0 0 72px var(--modal-glow-bright), 0 0 140px var(--modal-glow); }
    100% { box-shadow: 0 0 0 1px var(--modal-border),        0 0 0px  transparent,               0 0 0px   transparent; }
  }

  /* ── Score bar shimmer ── */
  @keyframes barShimmer {
    0%   { transform: translateX(-120%); }
    100% { transform: translateX(320%); }
  }

  /* ── Sparkle particles ── */
  @keyframes sparkleFloat {
    0%   { opacity: 0; transform: translate(0, 0) scale(0); }
    40%  { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--sx, 12px), var(--sy, -18px)) scale(1); }
  }

  /* ── Sigil glow pulse ── */
  @keyframes sigilGlow {
    0%, 100% { box-shadow: 0 0 10px var(--modal-glow-dim); }
    50%       { box-shadow: 0 0 28px var(--modal-glow); }
  }

  /* ── Ember particle drift (infinite: fade-in → drift → fade-out → repeat) ── */
  @keyframes emberDrift {
    0%   { opacity: 0;                       transform: translate(0px, 0px) scale(0.5); }
    20%  { opacity: var(--ep-peak, 0.35);    transform: translate(0px, 0px) scale(1);   }
    80%  { opacity: var(--ep-peak, 0.35);    transform: translate(calc(var(--ep-dx,6px)*0.6), calc(var(--ep-dy,-18px)*0.55)); }
    100% { opacity: 0;                       transform: translate(var(--ep-dx, 6px), var(--ep-dy, -18px)) scale(0.5); }
  }

  /* ── Aura container enter / exit ── */
  @keyframes auraIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes auraOut { from { opacity: 1; } to { opacity: 0; } }

  /* ── Reduced-motion ── */
  @media (prefers-reduced-motion: reduce) {
    [data-modal-float]   { animation: none !important; transform: translate(-50%, -50%) !important; }
    [data-modal-card]    { animation: none !important; transform: none !important; }
    [data-modal-backdrop]{ animation: none !important; }
    [data-bar-shimmer]   { animation: none !important; }
    [data-sigil-icon]    { animation: none !important; }
    [data-modal-aura]    { display: none !important; }
  }
`;

const SPARKLES = [
  { sx: "18px",  sy: "-28px", delay: "0ms",   left: "8%",  top: "16%" },
  { sx: "-14px", sy: "-22px", delay: "60ms",  left: "84%", top: "12%" },
  { sx: "10px",  sy: "-32px", delay: "120ms", left: "52%", top: "4%"  },
  { sx: "-18px", sy: "-16px", delay: "30ms",  left: "93%", top: "46%" },
  { sx: "12px",  sy: "-24px", delay: "90ms",  left: "4%",  top: "58%" },
  { sx: "-8px",  sy: "-20px", delay: "150ms", left: "70%", top: "80%" },
];

/**
 * Ambient ember / ash particles scattered around the modal aura ring.
 * Contained inside a 560×620 fixed box — safe on all viewport sizes.
 * --ep-peak: peak opacity; --ep-dx/dy: drift direction.
 */
const EMBER_PARTICLES: {
  left: string; top: string; size: number;
  dur: string; delay: string; dx: string; dy: string; peak: number;
}[] = [
  // top edge
  { left: "10%",  top: "6%",  size: 3.5, dur: "3.12s", delay: "0s",    dx: "7px",   dy: "-22px", peak: 0.38 },
  { left: "28%",  top: "2%",  size: 2.5, dur: "4.08s", delay: "0.4s",  dx: "-5px",  dy: "-26px", peak: 0.24 },
  { left: "50%",  top: "1%",  size: 4.5, dur: "3.36s", delay: "0.8s",  dx: "4px",   dy: "-24px", peak: 0.20 },
  { left: "72%",  top: "3%",  size: 2.5, dur: "2.96s", delay: "0.2s",  dx: "6px",   dy: "-20px", peak: 0.32 },
  { left: "88%",  top: "7%",  size: 3.5, dur: "3.72s", delay: "0.6s",  dx: "-4px",  dy: "-22px", peak: 0.26 },
  // right side
  { left: "95%",  top: "26%", size: 2.5, dur: "3.48s", delay: "0.3s",  dx: "10px",  dy: "-14px", peak: 0.30 },
  { left: "97%",  top: "52%", size: 3.5, dur: "4.2s", delay: "1.0s",   dx: "8px",   dy: "-18px", peak: 0.20 },
  { left: "94%",  top: "74%", size: 2.5, dur: "3.24s", delay: "0.15s", dx: "6px",   dy: "-16px", peak: 0.28 },
  // bottom edge
  { left: "76%",  top: "92%", size: 3.5, dur: "3.84s", delay: "0.7s",  dx: "-6px",  dy: "-20px", peak: 0.26 },
  { left: "50%",  top: "95%", size: 2.5, dur: "3.0s", delay: "0.5s",   dx: "4px",   dy: "-22px", peak: 0.32 },
  { left: "24%",  top: "92%", size: 4.5, dur: "3.96s", delay: "0.9s",  dx: "-8px",  dy: "-18px", peak: 0.18 },
  // left side
  { left: "5%",   top: "72%", size: 2.5, dur: "3.36s", delay: "0.25s", dx: "-10px", dy: "-14px", peak: 0.24 },
  { left: "3%",   top: "48%", size: 3.5, dur: "2.76s", delay: "0.55s", dx: "-8px",  dy: "-20px", peak: 0.36 },
  { left: "6%",   top: "24%", size: 2.5, dur: "4.32s", delay: "0.1s",  dx: "-6px",  dy: "-24px", peak: 0.28 },
  // accent specks (slightly brighter)
  { left: "38%",  top: "5%",  size: 2.5, dur: "2.64s", delay: "1.2s",  dx: "3px",   dy: "-16px", peak: 0.48 },
  { left: "63%",  top: "90%", size: 2.5, dur: "3.54s", delay: "0.35s", dx: "-3px",  dy: "-14px", peak: 0.44 },
  // additional particles (4 more for 1.25x count)
  { left: "18%",  top: "14%", size: 2.5, dur: "3.9s",  delay: "0.75s", dx: "5px",   dy: "-20px", peak: 0.30 },
  { left: "82%",  top: "38%", size: 2.5, dur: "3.6s",  delay: "0.45s", dx: "-6px",  dy: "-16px", peak: 0.28 },
  { left: "42%",  top: "78%", size: 3.5, dur: "4.15s", delay: "0.2s",  dx: "4px",   dy: "-18px", peak: 0.24 },
  { left: "68%",  top: "20%", size: 2.5, dur: "3.42s", delay: "0.85s", dx: "-4px",  dy: "-22px", peak: 0.34 },
];

const SIGNAL_CONFIG = [
  { key: "positiveSignals" as const, label: "Positive", icon: "▲", color: "rgba(34,197,94,0.9)",   border: "rgba(34,197,94,0.28)",   bg: "rgba(34,197,94,0.07)"   },
  { key: "negativeSignals" as const, label: "Negative", icon: "▼", color: "rgba(230,80,40,0.9)",   border: "rgba(230,80,40,0.28)",   bg: "rgba(230,80,40,0.07)"   },
  { key: "mixedSignals"    as const, label: "Mixed",    icon: "◆", color: "rgba(154,171,184,0.9)", border: "rgba(154,171,184,0.28)", bg: "rgba(154,171,184,0.07)" },
];

function ScoreBar({ score, accentColor }: { score: number; accentColor: string }) {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    setFill(0);
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setFill(score));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, [score]);

  return (
    <div
      className="relative h-1.5 w-full overflow-hidden rounded-full"
      style={{ background: "rgba(154,171,184,0.12)" }}
    >
      {/* filled track */}
      <div
        style={{
          height: "100%",
          width: "100%",
          transform: `scaleX(${fill / 100})`,
          transformOrigin: "left",
          transition: "transform 640ms cubic-bezier(0.4,0,0.2,1)",
          background: `linear-gradient(90deg, ${accentColor}77, ${accentColor})`,
          boxShadow: `0 0 8px ${accentColor}55`,
          borderRadius: "9999px",
        }}
      />
      {/* shimmer sweep over the filled portion */}
      {fill > 0 && (
        <span
          data-bar-shimmer=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-12 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}cc, white, ${accentColor}cc, transparent)`,
            animation: "barShimmer 2.4s ease-in-out 900ms infinite",
            opacity: 0.55,
          }}
        />
      )}
    </div>
  );
}

export function BranchDetailModal({ open, branch, onClose }: BranchDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydration guard
  useEffect(() => setMounted(true), []);

  // Drive open/exit animation
  useEffect(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (open) {
      setExiting(false);
      setVisible(true);
    } else if (visible) {
      setExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, 280);
    }
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Esc to close — handled inside the modal for self-containment
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!mounted || !visible || !branch) return null;

  const accentColor  = branch.toneColor  || palette.gold;
  const accentBorder = branch.toneBorder || palette.gold;

  const hasSignals =
    branch.positiveSignals + branch.negativeSignals + branch.mixedSignals > 0;

  return createPortal(
    <>
      <style>{MODAL_KEYFRAMES}</style>

      {/* ── Backdrop: dim + blur ── */}
      <div
        data-modal-backdrop=""
        aria-hidden="true"
        className="fixed inset-0 z-[1000]"
        style={{
          background: "rgba(4, 2, 1, 0.74)",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          animation: exiting
            ? "modalBackdropOut 280ms ease forwards"
            : "modalBackdropIn 220ms ease forwards",
        }}
        onClick={onClose}
      />

      {/*
       * ── Ember dust aura ──
       * Fixed container centered over the modal, z-1001 (above backdrop, below modal).
       * pointer-events: none — never intercepts clicks.
       * 560×620 bounds keep particles from bleeding to viewport edges.
       * NO haze / gradient — only individual floating particle dots.
       */}
      <div
        data-modal-aura=""
        aria-hidden="true"
        className="pointer-events-none fixed"
        style={{
          top: "50%",
          left: "50%",
          width: 560,
          height: 620,
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          animation: exiting
            ? "auraOut 280ms ease forwards"
            : "auraIn 700ms ease 200ms both",
        }}
      >
        {EMBER_PARTICLES.map((p, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: accentColor,
              boxShadow: p.size >= 2 ? `0 0 ${p.size * 2}px ${accentColor}66` : undefined,
              ["--ep-peak" as string]: p.peak,
              ["--ep-dx" as string]: p.dx,
              ["--ep-dy" as string]: p.dy,
              animation: `emberDrift ${p.dur} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/*
       * ── Float wrapper ──
       * Owns centering (translate -50%,-50%) and the gentle vertical bob.
       * Never changes during card entry — no transform conflict.
       */}
      <div
        data-modal-float=""
        className="fixed z-[1002] select-none"
        style={{
          top: "50%",
          left: "50%",
          width: "min(460px, calc(100vw - 32px))",
          /* static centering; float animation adds translateY on top */
          transform: "translate(-50%, -50%)",
          animation: exiting
            ? "modalFloatOut 280ms ease-in forwards"
            : "modalFloat 5200ms ease-in-out 780ms infinite",
        }}
      >
      {/*
       * ── Inner card ──
       * Owns scale/blur entry + box-shadow glow. No translate at all.
       */}
      <div
        data-modal-card=""
        data-testid="branch-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${branch.label} branch reading`}
        className="overflow-hidden rounded-2xl"
        style={
          {
            /* CSS custom props for glow keyframes */
            "--modal-border":        `${accentBorder}44`,
            "--modal-border-bright": `${accentBorder}88`,
            "--modal-glow":          `${accentColor}44`,
            "--modal-glow-dim":      `${accentColor}22`,
            "--modal-glow-far":      `${accentColor}18`,
            "--modal-glow-bright":   `${accentColor}88`,
            background:
              "linear-gradient(160deg, rgba(22,10,4,0.98) 0%, rgba(12,5,2,0.99) 100%)",
            border: `1px solid ${accentBorder}44`,
            animation: exiting
              ? "modalCardOut 280ms cubic-bezier(0.4,0,1,1) forwards"
              /* bloom first (wins while active), then breathGlow owns box-shadow */
              : [
                  "modalCardIn    480ms cubic-bezier(0.22,1,0.36,1) both",
                  "modalOpenBloom 900ms ease-out 160ms forwards",
                  "modalBreathGlow 4000ms ease-in-out 820ms infinite",
                ].join(", "),
          } as React.CSSProperties
        }
      >
        {/* Sparkle particles */}
        {!exiting &&
          SPARKLES.map((s, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute h-1 w-1 rounded-full"
              style={
                {
                  left: s.left,
                  top: s.top,
                  background: accentColor,
                  "--sx": s.sx,
                  "--sy": s.sy,
                  animation: `sparkleFloat 1100ms ease-out ${s.delay} both`,
                  opacity: 0,
                } as React.CSSProperties
              }
            />
          ))}

        {/* Top accent strip */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${accentColor}99 40%, ${accentColor} 50%, ${accentColor}99 60%, transparent 100%)`,
            boxShadow: `0 0 6px ${accentColor}44`,
          }}
        />

        <div className="px-6 py-5">
          {/* ── Header: sigil + names + close ── */}
          <div className="flex items-start gap-3">
            <span
              data-sigil-icon=""
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm"
              style={{
                borderColor: accentBorder,
                color: accentColor,
                background: `${accentColor}18`,
                boxShadow: `0 0 18px ${accentColor}40`,
                animation: `sigilGlow 4000ms ease-in-out 1400ms infinite`,
              }}
            >
              {branch.scored ? "◆" : "◇"}
            </span>

            <div className="min-w-0 flex-1">
              <p
                className="font-display text-sm uppercase leading-tight tracking-[0.14em]"
                style={{ color: accentColor }}
              >
                {branch.shortLabel}
              </p>
              <p
                className="mt-0.5 text-[11px] leading-5"
                style={{ color: palette.inkMuted }}
              >
                {branch.label}
              </p>
            </div>

            <button
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm transition-colors hover:border-current hover:text-white"
              onClick={onClose}
              style={{
                borderColor: "rgba(154,171,184,0.22)",
                color: palette.silver,
              }}
              type="button"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* ── Divider ── */}
          <div
            className="my-4"
            style={{
              height: 1,
              background: `linear-gradient(90deg, ${accentBorder}55, transparent)`,
            }}
          />

          {/* ── Tier badge + score ── */}
          <div className="flex items-center justify-between gap-3">
            <span
              className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em]"
              style={{
                borderColor: branch.scored ? accentBorder : "rgba(154,171,184,0.28)",
                color: branch.scored ? accentColor : palette.silver,
                background: branch.scored ? `${accentColor}0e` : "transparent",
              }}
            >
              {branch.scored ? branch.tier : "Awaiting proof"}
            </span>

            {branch.score !== null && branch.scored ? (
              <span
                className="font-display text-3xl leading-none"
                style={{ color: palette.gold }}
              >
                {branch.score}
                <span
                  className="ml-0.5 text-[11px]"
                  style={{ color: palette.inkSoft }}
                >
                  /100
                </span>
              </span>
            ) : null}
          </div>

          {/* ── Score bar ── */}
          {branch.score !== null && branch.scored ? (
            <div className="mt-3">
              <ScoreBar score={branch.score} accentColor={accentColor} />
            </div>
          ) : null}

          {/* ── Summary reading ── */}
          {branch.summary ? (
            <div
              className="mt-4 rounded-xl border px-4 py-3"
              style={{
                borderColor: `${accentBorder}2a`,
                background: `linear-gradient(180deg, ${accentColor}0d, ${accentColor}05)`,
              }}
            >
              <p
                className="mb-1.5 text-[9px] uppercase tracking-[0.16em]"
                style={{ color: `${accentColor}bb` }}
              >
                Reading
              </p>
              <p
                className="text-[12px] leading-6"
                style={{ color: palette.inkSoft }}
              >
                {branch.summary}
              </p>
            </div>
          ) : null}

          {/* ── Signal breakdown ── */}
          {branch.scored && hasSignals ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p
                  className="text-[9px] uppercase tracking-[0.16em]"
                  style={{ color: `${accentColor}bb` }}
                >
                  Signal breakdown
                </p>
                {branch.totalSignals != null ? (
                  <p
                    className="text-[9px]"
                    style={{ color: palette.inkMuted }}
                  >
                    {branch.totalSignals} total
                  </p>
                ) : null}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SIGNAL_CONFIG.map(({ key, label, icon, color, border, bg }) => (
                  <div
                    key={key}
                    className="rounded-lg border px-2 py-3 text-center"
                    style={{ borderColor: border, background: bg }}
                  >
                    <p
                      className="text-[9px] uppercase tracking-wider"
                      style={{ color }}
                    >
                      <span className="mr-0.5 text-[7px]">{icon}</span>
                      {label}
                    </p>
                    <p
                      className="mt-1 font-display text-xl"
                      style={{ color: palette.ink }}
                    >
                      {branch[key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ── Confidence + Opportunity row ── */}
          {branch.scored && (branch.confidenceLabel || branch.opportunityLabel) ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {branch.confidenceLabel ? (
                <div
                  className="rounded-xl border px-3 py-3"
                  style={{
                    borderColor: "rgba(74,122,186,0.28)",
                    background: "rgba(42,90,154,0.06)",
                  }}
                >
                  <p
                    className="text-[9px] uppercase tracking-[0.14em]"
                    style={{ color: "rgba(100,150,220,0.8)" }}
                  >
                    Confidence
                  </p>
                  <p
                    className="mt-1.5 text-xs font-semibold leading-5"
                    style={{ color: palette.ink }}
                  >
                    {branch.confidenceLabel}
                  </p>
                  {branch.confidenceScore != null ? (
                    <p
                      className="text-[10px]"
                      style={{ color: palette.inkMuted }}
                    >
                      {Math.round(branch.confidenceScore * 100)}%
                    </p>
                  ) : null}
                </div>
              ) : null}
              {branch.opportunityLabel ? (
                <div
                  className="rounded-xl border px-3 py-3"
                  style={{
                    borderColor: "rgba(255,149,0,0.22)",
                    background: "rgba(255,149,0,0.05)",
                  }}
                >
                  <p
                    className="text-[9px] uppercase tracking-[0.14em]"
                    style={{ color: "rgba(255,149,0,0.8)" }}
                  >
                    Opportunity
                  </p>
                  <p
                    className="mt-1.5 text-xs font-semibold leading-5"
                    style={{ color: palette.ink }}
                  >
                    {branch.opportunityLabel}
                  </p>
                  {branch.opportunityScore != null ? (
                    <p
                      className="text-[10px]"
                      style={{ color: palette.inkMuted }}
                    >
                      {Math.round(branch.opportunityScore * 100)}%
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* ── Delta / trend ── */}
          {branch.scored && branch.deltaLabel ? (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={{
                borderColor: "rgba(154,171,184,0.18)",
                background: "rgba(154,171,184,0.04)",
              }}
            >
              <span
                className="text-[9px] uppercase tracking-[0.14em]"
                style={{ color: palette.inkMuted }}
              >
                Trend
              </span>
              <span
                className="text-xs"
                style={{ color: palette.inkSoft }}
              >
                {branch.deltaLabel}
              </span>
              {branch.deltaValue != null ? (
                <span
                  className="ml-auto font-display text-sm"
                  style={{
                    color:
                      branch.deltaValue > 0
                        ? "rgba(34,197,94,0.9)"
                        : branch.deltaValue < 0
                          ? "rgba(230,80,40,0.9)"
                          : palette.silver,
                  }}
                >
                  {branch.deltaValue > 0 ? "+" : ""}
                  {branch.deltaValue.toFixed(1)}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* ── Limitation notes ── */}
          {branch.limitationNotes && branch.limitationNotes.length > 0 ? (
            <div
              className="mt-4 rounded-xl border px-4 py-3"
              style={{
                borderColor: "rgba(230,80,40,0.18)",
                background: "rgba(230,80,40,0.04)",
              }}
            >
              <p
                className="mb-2 text-[9px] uppercase tracking-[0.16em]"
                style={{ color: "rgba(230,80,40,0.7)" }}
              >
                Analyst notes
              </p>
              <ul className="space-y-1">
                {branch.limitationNotes.map((note, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[11px] leading-5"
                    style={{ color: palette.inkSoft }}
                  >
                    <span style={{ color: "rgba(230,80,40,0.5)" }}>•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Bottom accent strip */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accentBorder}33, transparent)`,
          }}
        />
      </div>
      {/* ── end float wrapper ── */}
      </div>
    </>,
    document.body,
  );
}
