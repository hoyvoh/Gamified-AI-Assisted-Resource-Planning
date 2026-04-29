"use client";

import React, { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { type BranchTier } from "@/features/analysis-chamber/lib/branch-tier";
import { TIER_MASTER_CRIMSON, TIER_MASTER_GOLD, TIER_ADVANCED_BRASS } from "@/features/analysis-chamber/lib/branch-tier-colors";

const SHIELD_TOKENS = {
  plateShadow: "#000000",
  white: "#ffffff",
  transparentWhite: "rgba(255,255,255,0)",
  rimDark: "rgba(0,0,0,0.06)",
  rimDarkSoft: "rgba(0,0,0,0.05)",
} as const;

export interface BranchShieldProps {
  accent: string;
  background: string;
  sigilColor: string;
  scored: boolean;
  active: boolean;
  size?: number;
  tier?: BranchTier;
}

function isHexColor(color: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color);
}

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
  if (isHexColor(color)) return hexToRgba(color, alpha);
  if (color.startsWith("rgba(")) return color.replace(/rgba\(([^)]+),\s*([^)]+)\)/, "rgba($1," + alpha + ")");
  if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
  return color;
}

export function BranchShield({
  accent,
  background,
  sigilColor,
  scored,
  active,
  size = 74,
  tier = "intermediate",
}: BranchShieldProps) {
  const reducedMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");

  // Tier-scaled animation timings
  const pulseDuration =
    tier === "master" ? (active ? 2.4 : 3.8) :
    tier === "advanced" ? (active ? 3.8 : 5.4) :
    (active ? 5.4 : 7.2);

  const shimmerDuration =
    tier === "master" ? (active ? 2.2 : 3.6) :
    tier === "advanced" ? (active ? 3.6 : 5.2) :
    (active ? 5.2 : 6.8);

  const shimmerRepeatDelay =
    tier === "master" ? (active ? 0.4 : 0.9) :
    tier === "advanced" ? (active ? 1.1 : 1.6) :
    (active ? 1.6 : 2.2);

  const rivetR =
    tier === "master" ? (active ? 3.7 : 3.5) :
    tier === "advanced" ? (active ? 3.3 : 3.1) :
    (active ? 2.9 : 2.7);

  const ids = useMemo(
    () => ({
      fill: `shieldFill-${uid}`,
      border: `shieldBorder-${uid}`,
      inner: `shieldInner-${uid}`,
      sigilClip: `sigilClip-${uid}`,
      shimmer: `sigilShimmer-${uid}`,
    }),
    [uid],
  );

  const borderA = withAlpha(accent, active ? 0.92 : 0.74);
  const borderB = withAlpha(accent, active ? 0.32 : 0.22);
  const plateA = withAlpha(background, scored ? 0.70 : 0.42);
  const plateB = withAlpha(background, scored ? 0.22 : 0.12);
  const sigilA = withAlpha(sigilColor, active ? 0.95 : 0.78);

  return (
    <motion.svg
      aria-hidden="true"
      height={size + 10}
      width={size}
      viewBox="0 0 64 74"
      overflow="visible"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id={ids.fill} cx="28%" cy="18%" r="86%">
          <stop offset="0%" stopColor={plateA} />
          <stop offset="55%" stopColor={plateB} />
          {tier === "master" ? (
            <>
              <stop offset="78%" stopColor={withAlpha(TIER_MASTER_CRIMSON, scored ? 0.22 : 0.12)} />
              <stop offset="100%" stopColor={withAlpha(TIER_MASTER_CRIMSON, scored ? 0.14 : 0.07)} />
            </>
          ) : (
            <stop offset="100%" stopColor={SHIELD_TOKENS.rimDark} />
          )}
        </radialGradient>

        <linearGradient id={ids.border} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={borderA} />
          <stop offset="55%" stopColor={borderB} />
          <stop offset="100%" stopColor={
            tier === "master"
              ? withAlpha(TIER_MASTER_CRIMSON, active ? 0.80 : 0.60)
              : withAlpha(accent, 0.44)
          } />
        </linearGradient>

        <linearGradient id={ids.inner} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={withAlpha(SHIELD_TOKENS.white, active ? 0.12 : 0.08)} />
          <stop offset="55%" stopColor={withAlpha(accent, active ? 0.10 : 0.06)} />
          <stop offset="100%" stopColor={SHIELD_TOKENS.rimDarkSoft} />
        </linearGradient>

        <linearGradient id={ids.shimmer} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={SHIELD_TOKENS.transparentWhite} />
          <stop offset="45%" stopColor={
            tier === "master"
              ? withAlpha(TIER_MASTER_GOLD, active ? 0.40 : 0.26)
              : tier === "advanced"
              ? withAlpha(TIER_ADVANCED_BRASS, active ? 0.32 : 0.20)
              : withAlpha(SHIELD_TOKENS.white, active ? 0.26 : 0.16)
          } />
          <stop offset="58%" stopColor={
            tier === "master"
              ? withAlpha(TIER_MASTER_CRIMSON, active ? 0.24 : 0.14)
              : withAlpha(SHIELD_TOKENS.white, active ? 0.18 : 0.10)
          } />
          <stop offset="100%" stopColor={SHIELD_TOKENS.transparentWhite} />
        </linearGradient>

        <clipPath id={ids.sigilClip}>
          <path d="M32 24c6.2 0 10.9 4.1 10.9 9.6 0 5.8-3.4 10.4-10.9 17.1-7.5-6.7-10.9-11.3-10.9-17.1 0-5.5 4.7-9.6 10.9-9.6Z" />
        </clipPath>
      </defs>

      {/* Master halo rings — rendered behind everything */}
      {tier === "master" && !reducedMotion && (
        <>
          {/* Outer crimson halo */}
          <motion.ellipse
            cx="32" cy="37" rx="37" ry="40"
            fill="none"
            stroke={withAlpha(TIER_MASTER_CRIMSON, 0.48)}
            strokeWidth="1.4"
            animate={{ opacity: [0.18, 0.55, 0.18], strokeWidth: [1.2, 1.9, 1.2] }}
            transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          {/* Inner gold halo */}
          <motion.ellipse
            cx="32" cy="37" rx="32" ry="35"
            fill="none"
            stroke={withAlpha(accent, 0.55)}
            strokeWidth="0.9"
            animate={{ opacity: [0.28, 0.72, 0.28] }}
            transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.6 }}
          />
        </>
      )}

      {/* shadow plate */}
      <path
        d="M13 7h38c4 0 7 3.1 7 7v19.7c0 13.2-8.4 25.3-26 33.8-17.6-8.5-26-20.6-26-33.8V14c0-3.9 3-7 7-7Z"
        fill={withAlpha(SHIELD_TOKENS.plateShadow, 0.28)}
        opacity={active ? 0.38 : 0.26}
        transform="translate(0 2)"
      />

      {/* main shield */}
      <path
        d="M13 7h38c4 0 7 3.1 7 7v19.7c0 13.2-8.4 25.3-26 33.8-17.6-8.5-26-20.6-26-33.8V14c0-3.9 3-7 7-7Z"
        fill={`url(#${ids.fill})`}
        stroke={`url(#${ids.border})`}
        strokeWidth={active ? 2.2 : 1.8}
      />

      {/* inner frame */}
      <motion.path
        d="M16 11h32c3 0 5 2.2 5 5v17.3c0 10.6-7 20.5-21 27.8-14-7.3-21-17.2-21-27.8V16c0-2.8 2.2-5 5-5Z"
        fill="none"
        stroke={`url(#${ids.inner})`}
        strokeWidth="1.2"
        animate={
          reducedMotion
            ? { opacity: 0.72 }
            : { opacity: active ? [0.72, 0.95, 0.72] : [0.55, 0.78, 0.55] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: pulseDuration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
      />

      {/* tiny rivet / socket */}
      <circle
        cx="32"
        cy="32"
        r={rivetR}
        fill={withAlpha(accent, active ? 0.65 : 0.42)}
        stroke={withAlpha(SHIELD_TOKENS.white, active ? 0.18 : 0.12)}
        strokeWidth="1"
        opacity={scored ? 1 : 0.72}
      />

      {/* sigil */}
      <g clipPath={`url(#${ids.sigilClip})`} opacity={scored ? 1 : 0.72}>
        <motion.path
          d="M32 24c6.2 0 10.9 4.1 10.9 9.6 0 5.8-3.4 10.4-10.9 17.1-7.5-6.7-10.9-11.3-10.9-17.1 0-5.5 4.7-9.6 10.9-9.6Z"
          fill="none"
          stroke={sigilA}
          strokeWidth="1.5"
          animate={
            reducedMotion
              ? { opacity: 0.84 }
              : { opacity: active ? [0.78, 1, 0.78] : [0.62, 0.9, 0.62] }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: active ? 2.8 : 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
          }
        />

        {/* minimal rune (chevron + bar) */}
        <path
          d="M32 30l6.8 6.2-1.8 2L32 33.7l-5 4.5-1.8-2L32 30Zm-7.8 13.6h15.6v2.4H24.2v-2.4Z"
          fill={withAlpha(sigilColor, active ? 0.92 : 0.74)}
        />

        {/* shimmer sweep */}
        {!reducedMotion && (
          <motion.rect
            x="-24"
            y="20"
            width="24"
            height="40"
            fill={`url(#${ids.shimmer})`}
            opacity={active ? 0.9 : 0.7}
            animate={{ x: ["-24", "76"] }}
            transition={{
              duration: shimmerDuration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              repeatDelay: shimmerRepeatDelay,
            }}
          />
        )}
      </g>

      {/* top glint */}
      <path
        d="M16 12h32c2.4 0 4.3 1.5 4.8 3.7 0 0-7.3 3.9-20.8 3.9S11.2 15.7 11.2 15.7c.5-2.2 2.4-3.7 4.8-3.7Z"
        fill={withAlpha(SHIELD_TOKENS.white, active ? 0.10 : 0.06)}
      />
    </motion.svg>
  );
}
