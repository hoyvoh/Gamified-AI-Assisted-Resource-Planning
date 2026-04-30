"use client";

import React, { forwardRef, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  BRANCH_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

import { BranchShield } from "./branch-shield";
import { resolveTier } from "@/features/analysis-chamber/lib/branch-tier";
import { TIER_MASTER_CRIMSON } from "@/features/analysis-chamber/lib/branch-tier-colors";

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
    const reducedMotion = useReducedMotion();
    const accent = data.scored ? data.toneBorder : BRANCH_TOKENS.fallbackBorder;
    const sigilColor = data.scored ? data.toneColor : palette.silver;
    const plate = data.scored ? data.toneBackground : BRANCH_TOKENS.fallbackPlate;
    const nodeTier = data.scored ? resolveTier(data.tier) : "intermediate";
    const isMaster = nodeTier === "master";

    function hexToRgba(hex: string, alpha: number) {
      const cleaned = hex.replace("#", "");
      const expanded =
        cleaned.length === 3
          ? cleaned
              .split("")
              .map((c) => c + c)
              .join("")
          : cleaned.length === 8
            ? cleaned.slice(0, 6)
            : cleaned;
      const r = Number.parseInt(expanded.slice(0, 2), 16);
      const g = Number.parseInt(expanded.slice(2, 4), 16);
      const b = Number.parseInt(expanded.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function withAlpha(color: string, alpha: number) {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
        return hexToRgba(color, alpha);
      }
      if (color.startsWith("rgba(")) {
        return color.replace(
          /rgba\(([^)]+),\s*([^)]+)\)/,
          "rgba($1," + alpha + ")",
        );
      }
      if (color.startsWith("rgb(")) {
        return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
      }
      return color;
    }

    const delaySeconds = useMemo(
      () => Math.max(0, animationDelay) / 1000,
      [animationDelay],
    );

    const idleFloat = reducedMotion
      ? undefined
      : {
          y: [nodeOffset, nodeOffset - 2, nodeOffset],
        };

    const idleTransition = reducedMotion
      ? undefined
      : {
          duration: 5.6,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.42, 0, 0.58, 1] as const,
        };

    const accentGlow = withAlpha(accent, isActive ? 0.20 : 0.12);
    const crimsonGlow = isMaster
      ? (isActive
          ? ` drop-shadow(0 0 24px ${withAlpha(TIER_MASTER_CRIMSON, 0.22)})`
          : ` drop-shadow(0 0 16px ${withAlpha(TIER_MASTER_CRIMSON, 0.12)})`)
      : "";
    const baseGlow = isActive
      ? `drop-shadow(0 18px 26px ${BRANCH_TOKENS.baseShadowActive}) drop-shadow(0 0 18px ${accentGlow})${crimsonGlow}`
      : `drop-shadow(0 18px 26px ${BRANCH_TOKENS.baseShadowIdle}) drop-shadow(0 0 12px ${accentGlow})${crimsonGlow}`;

    return (
      <motion.button
        ref={ref}
        data-testid={`branch-node-${data.id}`}
        className="group relative flex w-28 shrink-0 flex-col items-center text-center"
        onClick={() => onClick(data.id)}
        initial={
          reducedMotion
            ? { opacity: 1, y: nodeOffset, scale: 1, filter: baseGlow }
            : {
                opacity: 0,
                y: nodeOffset + 14,
                scale: 0.92,
                filter: "blur(2px)",
              }
        }
        animate={
          reducedMotion
            ? { opacity: 1, y: nodeOffset, scale: isActive ? 1.06 : 1, filter: baseGlow }
            : {
                opacity: 1,
                scale: isActive ? 1.07 : 1,
                filter: baseGlow,
                ...(idleFloat ?? { y: nodeOffset }),
              }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                opacity: {
                  duration: 0.55,
                  delay: delaySeconds,
                  ease: [0.22, 1, 0.36, 1],
                },
                scale: {
                  duration: 0.55,
                  delay: delaySeconds,
                  ease: [0.22, 1, 0.36, 1],
                },
                y: idleTransition,
                filter: { duration: 0.32 },
              }
        }
        whileHover={
          reducedMotion
            ? undefined
            : {
                y: nodeOffset - 6,
                scale: isActive ? 1.08 : 1.03,
              }
        }
        whileTap={{ scale: isActive ? 1.05 : 0.99 }}
        type="button"
        aria-pressed={isActive}
      >
        {/* Shield crest */}
        <motion.span
          className="relative"
          animate={
            reducedMotion
              ? undefined
              : { opacity: isActive ? [0.96, 1, 0.96] : [0.92, 0.98, 0.92] }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: isActive ? 2.9 : 4.6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
          }
          style={{
            filter: isActive
              ? `drop-shadow(0 0 18px ${withAlpha(accent, 0.16)})`
              : `drop-shadow(0 0 12px ${BRANCH_TOKENS.inactiveDropShadow})`,
          }}
        >
          <BranchShield
            accent={accent}
            background={plate}
            sigilColor={sigilColor}
            scored={data.scored}
            active={isActive}
            tier={nodeTier}
          />
        </motion.span>

        {/* Label */}
        <span
          className="mt-3 min-h-10 font-display text-[10px] uppercase leading-5 tracking-[0.12em]"
          style={{
            color: palette.ink,
          }}
        >
          {data.shortLabel}
        </span>

        {/* Tier badge */}
        <span
          className="mt-1 rounded-full border px-2 py-0.5 text-[8px] uppercase tracking-[0.12em]"
          style={{
            borderColor: data.scored
              ? accent
              : BRANCH_TOKENS.tierIdleBorder,
            color: data.scored ? sigilColor : palette.silver,
            transition: "border-color 0.3s ease, color 0.3s ease",
            background: isActive
              ? BRANCH_TOKENS.tierActiveBg
              : BRANCH_TOKENS.tierIdleBg,
          }}
        >
          {data.scored ? data.tier : "Proof"}
        </span>

        {/* Signal counts */}
        {data.scored ? (
          <span
            className="mt-2 text-[9px] uppercase tracking-[0.08em]"
            style={{
              color: isActive
                ? BRANCH_TOKENS.signalTextActive
                : BRANCH_TOKENS.signalTextIdle,
            }}
          >
            +{data.positiveSignals} -{data.negativeSignals} ~{data.mixedSignals}
          </span>
        ) : (
          <span
            className="mt-2 text-[9px] uppercase tracking-[0.08em]"
            style={{ color: BRANCH_TOKENS.pendingText }}
          >
            Not sealed
          </span>
        )}
      </motion.button>
    );
  },
);
