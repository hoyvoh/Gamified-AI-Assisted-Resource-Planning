"use client";

import React, { forwardRef } from "react";

import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

export interface BranchNodeData {
  id: string;
  label: string;
  shortLabel: string;
  /** Maturity tier label, e.g. "Intermediate", "Advanced" */
  tier: string;
  /** Normalised 0-100 score, null if unscored */
  score: number | null;
  scored: boolean;
  positiveSignals: number;
  negativeSignals: number;
  mixedSignals: number;
  totalSignals?: number;
  /** Short textual reading for the modal */
  summary?: string | null;
  /** Confidence 0-1 */
  confidenceScore?: number | null;
  confidenceLabel?: string | null;
  /** Opportunity score 0-1 */
  opportunityScore?: number | null;
  opportunityLabel?: string | null;
  /** Score delta vs previous period */
  deltaValue?: number | null;
  deltaLabel?: string | null;
  /** Analyst limitation notes */
  limitationNotes?: string[];
  toneColor: string;
  toneBorder: string;
  toneBackground: string;
}

export interface BranchNodeProps {
  data: BranchNodeData;
  isActive: boolean;
  animationDelay?: number;
  nodeOffset?: number;
  onClick: (id: string) => void;
}

export const BranchNode = forwardRef<HTMLButtonElement, BranchNodeProps>(
  function BranchNode(
    { data, isActive, animationDelay = 0, nodeOffset = 0, onClick },
    ref,
  ) {
    const nodeColor = isActive
      ? palette.gold
      : data.scored
        ? data.toneBorder
        : "rgba(154,171,184,0.42)";

    return (
      <button
        ref={ref}
        data-node-item
        data-testid={`branch-node-${data.id}`}
        className="group relative flex w-28 shrink-0 flex-col items-center text-center hover:-translate-y-1"
        onClick={() => onClick(data.id)}
        style={
          {
            "--node-offset": `${nodeOffset}px`,
            animation: `nodeReveal 600ms cubic-bezier(0.22, 1, 0.36, 1) ${animationDelay}ms both`,
            transition: "transform 0.2s ease",
          } as React.CSSProperties
        }
        type="button"
        aria-pressed={isActive}
      >
        {/* Diamond body */}
        <span
          className="relative flex h-16 w-16 rotate-45 items-center justify-center border"
          style={{
            borderColor: nodeColor,
            background: isActive
              ? "radial-gradient(circle, rgba(255,149,0,0.30), rgba(255,149,0,0.08))"
              : data.scored
                ? "radial-gradient(circle, rgba(42,90,154,0.20), rgba(255,255,255,0.035))"
                : "radial-gradient(circle, rgba(154,171,184,0.10), rgba(255,255,255,0.02))",
            boxShadow: isActive
              ? "0 0 32px rgba(255,149,0,0.28), 0 0 0 2px rgba(255,149,0,0.18)"
              : "0 10px 22px rgba(0,0,0,0.20)",
            transition: "box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease",
          }}
        >
          <span
            className="-rotate-45 font-display text-xs uppercase tracking-[0.12em]"
            style={{
              color: nodeColor,
              transition: "color 0.3s ease",
            }}
          >
            {data.scored ? "◆" : "◇"}
          </span>
        </span>

        {/* Label */}
        <span
          className="mt-4 min-h-10 font-display text-[10px] uppercase leading-5 tracking-[0.10em]"
          style={{
            color: isActive ? palette.gold : palette.ink,
            transition: "color 0.3s ease",
          }}
        >
          {data.shortLabel}
        </span>

        {/* Tier badge */}
        <span
          className="mt-1 rounded-full border px-2 py-0.5 text-[8px] uppercase tracking-[0.12em]"
          style={{
            borderColor: data.scored
              ? data.toneBorder
              : "rgba(154,171,184,0.26)",
            color: data.scored ? data.toneColor : palette.silver,
            transition: "border-color 0.3s ease, color 0.3s ease",
          }}
        >
          {data.scored ? data.tier : "Proof"}
        </span>

        {/* Signal counts */}
        {data.scored ? (
          <span
            className="mt-2 text-[9px] uppercase tracking-[0.08em]"
            style={{ color: "rgba(255,184,77,0.58)" }}
          >
            +{data.positiveSignals} -{data.negativeSignals} ~{data.mixedSignals}
          </span>
        ) : (
          <span
            className="mt-2 text-[9px] uppercase tracking-[0.08em]"
            style={{ color: "rgba(255,184,77,0.44)" }}
          >
            Not sealed
          </span>
        )}
      </button>
    );
  },
);
