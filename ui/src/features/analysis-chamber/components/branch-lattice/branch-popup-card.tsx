"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  BRANCH_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

import type { BranchNodeData } from "./branch-node";

export interface BranchPopupCardProps {
  /** Whether the popup is visible */
  open: boolean;
  /** The branch data to display */
  branch: BranchNodeData | null;
  /** The bounding rect of the trigger node, used for positioning */
  anchorRect: DOMRect | null;
  /** Called when the popup should close */
  onClose: () => void;
}

const POPUP_KEYFRAMES = `
  @keyframes branchPopupIn {
    0%   { opacity: 0; transform: translateY(10px) scale(0.94); filter: blur(3px); }
    60%  { filter: blur(0); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }
  @keyframes branchPopupOut {
    0%   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    100% { opacity: 0; transform: translateY(8px) scale(0.95); filter: blur(2px); }
  }
  @keyframes sparkleFloat {
    0%   { opacity: 0; transform: translate(0, 0) scale(0); }
    40%  { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--sx, 12px), var(--sy, -18px)) scale(1); }
  }
  @keyframes cardGlowPulse {
    0%, 100% { box-shadow: 0 0 0 1px var(--card-border), 0 24px 60px rgba(0,0,0,0.5), 0 0 32px var(--card-glow); }
    50%       { box-shadow: 0 0 0 1px var(--card-border), 0 24px 60px rgba(0,0,0,0.5), 0 0 52px var(--card-glow); }
  }
`;

const SPARKLES = [
  { sx: "14px", sy: "-22px", delay: "0ms", left: "10%", top: "20%" },
  { sx: "-12px", sy: "-18px", delay: "60ms", left: "80%", top: "15%" },
  { sx: "8px", sy: "-26px", delay: "120ms", left: "50%", top: "5%" },
  { sx: "-16px", sy: "-14px", delay: "30ms", left: "90%", top: "50%" },
  { sx: "10px", sy: "-20px", delay: "90ms", left: "5%", top: "60%" },
];

function ScoreBar({
  score,
  accentColor,
}: {
  score: number;
  accentColor: string;
}) {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    setFill(0);
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setFill(score));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [score]);

  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full"
      style={{ background: BRANCH_TOKENS.popupTrack }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          transform: `scaleX(${fill / 100})`,
          transformOrigin: "left",
          transition: "transform 600ms cubic-bezier(0.4,0,0.2,1)",
          background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`,
          boxShadow: `0 0 6px ${accentColor}66`,
          borderRadius: "9999px",
        }}
      />
    </div>
  );
}

export function BranchPopupCard({
  open,
  branch,
  anchorRect,
  onClose,
}: BranchPopupCardProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mount after hydration
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
      }, 220);
    }

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted || !visible || !branch || !anchorRect) return null;

  const CARD_WIDTH = 280;
  const CARD_APPROX_HEIGHT = 320;
  const OFFSET = 12; // gap between node and card

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  // Horizontal: center over anchor, clamp to viewport
  let left = anchorRect.left + anchorRect.width / 2 - CARD_WIDTH / 2;
  left = Math.max(8, Math.min(left, viewportW - CARD_WIDTH - 8));

  // Vertical: prefer above, flip below if insufficient space
  const spaceAbove = anchorRect.top;
  const spaceBelow = viewportH - anchorRect.bottom;
  let top: number;
  const placeBelow = spaceAbove < CARD_APPROX_HEIGHT + OFFSET && spaceBelow > spaceAbove;
  if (placeBelow) {
    top = anchorRect.bottom + OFFSET;
  } else {
    top = anchorRect.top - CARD_APPROX_HEIGHT - OFFSET;
  }
  top = Math.max(8, Math.min(top, viewportH - CARD_APPROX_HEIGHT - 8));

  const accentColor = branch.toneColor || palette.gold;
  const accentBorder = branch.toneBorder || palette.gold;
  const accentGlow = `${accentColor}44`;

  return createPortal(
    <>
      <style>{POPUP_KEYFRAMES}</style>
      {/* Backdrop dismiss layer */}
      <div
        className="fixed inset-0 z-[998]"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-label={`${branch.label} branch reading`}
        data-testid="branch-popup-card"
        className="fixed z-[999] select-none overflow-hidden rounded-2xl"
        style={
          {
            top,
            left,
            width: CARD_WIDTH,
            "--card-border": accentBorder,
            "--card-glow": accentGlow,
            background: BRANCH_TOKENS.popupSurface,
            border: `1px solid ${accentBorder}55`,
            boxShadow: `0 0 0 1px ${accentBorder}22, ${BRANCH_TOKENS.popupShadow}, 0 0 36px ${accentGlow}`,
            backdropFilter: "blur(12px)",
            animationName: exiting ? "branchPopupOut" : "cardGlowPulse, branchPopupIn",
            animationDuration: exiting ? "200ms" : "280ms, 3s",
            animationTimingFunction: exiting
              ? "cubic-bezier(0.4,0,1,1)"
              : "cubic-bezier(0.22,1,0.36,1), ease-in-out",
            animationDelay: exiting ? "0ms" : "0ms, 320ms",
            animationIterationCount: exiting ? "1" : "1, infinite",
            animationFillMode: "forwards",
          } as React.CSSProperties
        }
      >
        {/* Sparkle particles — only on open */}
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
                  animation: `sparkleFloat 900ms ease-out ${s.delay} both`,
                  opacity: 0,
                } as React.CSSProperties
              }
            />
          ))}

        {/* Top accent strip */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            boxShadow: `0 0 8px ${accentColor}`,
          }}
        />

        <div className="px-5 py-4">
          {/* Header: sigil + name */}
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs"
              style={{
                borderColor: accentBorder,
                color: accentColor,
                background: `${accentColor}18`,
                boxShadow: `0 0 12px ${accentGlow}`,
              }}
            >
              {branch.scored ? "◆" : "◇"}
            </span>
            <div className="min-w-0">
              <p
                className="font-display text-xs uppercase leading-tight tracking-[0.14em]"
                style={{ color: accentColor }}
              >
                {branch.shortLabel}
              </p>
              <p
                className="mt-0.5 text-[10px] leading-4"
                style={{ color: palette.inkMuted }}
              >
                {branch.label}
              </p>
            </div>
            {/* Close button */}
            <button
              className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px]"
              onClick={onClose}
              style={{
                borderColor: BRANCH_TOKENS.popupButtonBorder,
                color: palette.silver,
              }}
              type="button"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Divider */}
          <div
            className="my-3"
            style={{
              height: 1,
              background: `linear-gradient(90deg, ${accentBorder}44, transparent)`,
            }}
          />

          {/* Tier badge + score */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em]"
              style={{
                borderColor: branch.scored ? accentBorder : BRANCH_TOKENS.popupUnscoredBorder,
                color: branch.scored ? accentColor : palette.silver,
              }}
            >
              {branch.scored ? branch.tier : "Awaiting proof"}
            </span>
            {branch.score !== null && branch.scored ? (
              <span
                className="font-display text-xl leading-none"
                style={{ color: palette.gold }}
              >
                {branch.score}
                <span
                  className="ml-0.5 text-[10px]"
                  style={{ color: palette.inkSoft }}
                >
                  /100
                </span>
              </span>
            ) : null}
          </div>

          {/* Score bar */}
          {branch.score !== null && branch.scored ? (
            <div className="mt-2">
              <ScoreBar score={branch.score} accentColor={accentColor} />
            </div>
          ) : null}

          {/* Summary reading */}
          {branch.summary ? (
            <div
              className="mt-3 rounded-xl border px-3 py-3"
              style={{
                borderColor: `${accentBorder}33`,
                background: `linear-gradient(180deg, ${accentColor}0e, ${accentColor}06)`,
              }}
            >
              <p
                className="mb-1.5 text-[9px] uppercase tracking-[0.16em]"
                style={{ color: accentColor }}
              >
                Reading
              </p>
              <p
                className="text-[11px] leading-5"
                style={{ color: palette.inkSoft }}
              >
                {branch.summary}
              </p>
            </div>
          ) : null}

          {/* Signal counters */}
          {branch.scored &&
          branch.positiveSignals + branch.negativeSignals + branch.mixedSignals > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[
                {
                  label: "Pos",
                  value: branch.positiveSignals,
                  color: BRANCH_TOKENS.popupPositive,
                  border: BRANCH_TOKENS.popupPositiveBorder,
                  bg: BRANCH_TOKENS.popupPositiveBg,
                },
                {
                  label: "Neg",
                  value: branch.negativeSignals,
                  color: BRANCH_TOKENS.popupNegative,
                  border: BRANCH_TOKENS.popupNegativeBorder,
                  bg: BRANCH_TOKENS.popupNegativeBg,
                },
                {
                  label: "Mix",
                  value: branch.mixedSignals,
                  color: BRANCH_TOKENS.popupMixed,
                  border: BRANCH_TOKENS.popupMixedBorder,
                  bg: BRANCH_TOKENS.popupMixedBg,
                },
              ].map(({ label, value, color, border, bg }) => (
                <div
                  key={label}
                  className="rounded-lg border px-1 py-2 text-center"
                  style={{ borderColor: border, background: bg }}
                >
                  <p
                    className="text-[8px] uppercase tracking-widest"
                    style={{ color }}
                  >
                    {label}
                  </p>
                  <p
                    className="mt-0.5 font-display text-base leading-none"
                    style={{ color: palette.ink }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Bottom accent strip */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accentBorder}44, transparent)`,
          }}
        />
      </div>
    </>,
    document.body,
  );
}
