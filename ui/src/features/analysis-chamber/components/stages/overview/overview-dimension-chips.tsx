"use client";

import {
  CHAMBER_CHROME_TOKENS,
  DIMENSION_LABELS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

interface OverviewDimensionChipsProps {
  growthDimensionIds: string[];
  strengthDimensionIds: string[];
}

const renderDimensionLabel = (id: string) =>
  DIMENSION_LABELS[id] ?? id.replaceAll("_", " ");

const labelStyles = {
  strength: {
    color: MEDIEVAL_THEME.accents.brassSoft,
    textShadow:
      "0 0 8px rgba(255, 198, 116, 0.12), 0 0 18px rgba(196, 140, 42, 0.06)",
  },
  growth: {
    color: MEDIEVAL_THEME.text.soft,
    textShadow:
      "0 0 8px rgba(176, 193, 255, 0.1), 0 0 18px rgba(120, 138, 184, 0.05)",
  },
} as const;

const chipStyles = {
  strength: {
    lead: {
      auraColor: "rgba(232, 167, 64, 0.42)",
      borderColor: CHAMBER_CHROME_TOKENS.actionBorder,
      background:
        "linear-gradient(180deg, rgba(118,92,34,0.18), rgba(86,72,28,0.08))",
      color: MEDIEVAL_THEME.text.secondary,
      boxShadow:
        "inset 0 1px 0 rgba(255,232,192,0.16), 0 0 0 1px rgba(196,140,42,0.06), 0 0 20px rgba(148,96,24,0.08)",
      glowColor: "rgba(255, 210, 132, 0.92)",
    },
    default: {
      auraColor: "rgba(155, 177, 120, 0.22)",
      borderColor: "rgba(112, 106, 79, 0.3)",
      background:
        "linear-gradient(180deg, rgba(76,68,40,0.12), rgba(54,48,28,0.06))",
      color: "#c7d7b0",
      boxShadow:
        "inset 0 1px 0 rgba(255,232,192,0.05), 0 0 14px rgba(120,150,82,0.05)",
      glowColor: "rgba(197, 224, 164, 0.82)",
    },
  },
  growth: {
    lead: {
      auraColor: "rgba(132, 150, 232, 0.34)",
      borderColor: "rgba(104, 112, 164, 0.38)",
      background:
        "linear-gradient(180deg, rgba(55,66,114,0.18), rgba(40,46,84,0.08))",
      color: "#dde5fb",
      boxShadow:
        "inset 0 1px 0 rgba(226,232,255,0.1), 0 0 0 1px rgba(104,112,164,0.05), 0 0 20px rgba(84,96,164,0.08)",
      glowColor: "rgba(220, 228, 255, 0.94)",
    },
    default: {
      auraColor: "rgba(118, 142, 226, 0.2)",
      borderColor: "rgba(83, 95, 145, 0.28)",
      background:
        "linear-gradient(180deg, rgba(42,48,82,0.12), rgba(30,34,60,0.06))",
      color: "#a9bce4",
      boxShadow:
        "inset 0 1px 0 rgba(210,220,255,0.05), 0 0 14px rgba(94,116,194,0.05)",
      glowColor: "rgba(178, 194, 248, 0.84)",
    },
  },
} as const;

export const OverviewDimensionChips = ({
  growthDimensionIds,
  strengthDimensionIds,
}: OverviewDimensionChipsProps) => {
  if (strengthDimensionIds.length === 0 && growthDimensionIds.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-3">
      <style jsx global>{`
        @keyframes overviewStrengthLabelRune {
          0%,
          18%,
          100% {
            text-shadow:
              0 0 1px rgba(255, 198, 116, 0.02),
              0 0 4px rgba(222, 150, 50, 0.02);
            filter: brightness(0.82);
          }

          28% {
            text-shadow:
              0 0 5px rgba(255, 210, 136, 0.12),
              0 0 10px rgba(232, 166, 62, 0.07);
            filter: brightness(0.96);
          }

          38% {
            text-shadow:
              0 0 12px rgba(255, 224, 162, 0.34),
              0 0 26px rgba(232, 166, 62, 0.2);
            filter: brightness(1.14);
          }

          54% {
            text-shadow:
              0 0 3px rgba(255, 206, 130, 0.08),
              0 0 8px rgba(232, 166, 62, 0.05);
            filter: brightness(0.9);
          }
        }

        @keyframes overviewGrowthLabelRune {
          0%,
          20%,
          100% {
            text-shadow:
              0 0 1px rgba(176, 193, 255, 0.02),
              0 0 4px rgba(112, 132, 218, 0.02);
            filter: brightness(0.82);
          }

          30% {
            text-shadow:
              0 0 5px rgba(208, 218, 255, 0.1),
              0 0 10px rgba(138, 154, 232, 0.06);
            filter: brightness(0.95);
          }

          40% {
            text-shadow:
              0 0 12px rgba(216, 226, 255, 0.3),
              0 0 26px rgba(138, 154, 232, 0.18);
            filter: brightness(1.12);
          }

          56% {
            text-shadow:
              0 0 3px rgba(208, 218, 255, 0.07),
              0 0 8px rgba(138, 154, 232, 0.04);
            filter: brightness(0.9);
          }
        }

        @keyframes overviewRuneAura {
          0%,
          22%,
          100% {
            opacity: 0.02;
            transform: scale(0.92);
          }

          34% {
            opacity: 0.12;
            transform: scale(1);
          }

          42% {
            opacity: 0.68;
            transform: scale(1.14);
          }

          58% {
            opacity: 0.06;
            transform: scale(0.98);
          }
        }

        @keyframes overviewRuneText {
          0%,
          18%,
          100% {
            filter: brightness(0.72);
            opacity: 0.68;
          }

          30% {
            filter: brightness(0.92);
            opacity: 0.88;
          }

          40% {
            filter: brightness(1.34);
            opacity: 1;
          }

          56% {
            filter: brightness(0.8);
            opacity: 0.76;
          }
        }

        .overview-rune-chip {
          position: relative;
          display: inline-flex;
          overflow: visible;
          isolation: isolate;
        }

        .overview-rune-chip::before {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            var(--overview-rune-aura-color) 0%,
            transparent 72%
          );
          opacity: 0.02;
          filter: blur(12px);
          z-index: -1;
          animation: overviewRuneAura var(--overview-rune-aura-duration)
            ease-in-out var(--overview-rune-delay) infinite;
          pointer-events: none;
        }

        .overview-rune-text {
          position: relative;
          z-index: 1;
          display: inline-block;
          color: var(--overview-rune-text-color);
          text-shadow:
            0 0 8px var(--overview-rune-glow-color),
            0 0 18px color-mix(
              in srgb,
              var(--overview-rune-glow-color) 62%,
              transparent
            ),
            0 0 34px color-mix(
              in srgb,
              var(--overview-rune-glow-color) 28%,
              transparent
            );
          animation: overviewRuneText var(--overview-rune-text-duration)
            ease-in-out var(--overview-rune-delay) infinite;
        }

        .overview-rune-label-strength {
          animation: overviewStrengthLabelRune 4.8s ease-in-out infinite;
        }

        .overview-rune-label-growth {
          animation: overviewGrowthLabelRune 5.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .overview-rune-glow {
            animation: none !important;
          }

          .overview-rune-chip::before,
          .overview-rune-text,
          .overview-rune-label-strength,
          .overview-rune-label-growth {
            animation: none !important;
          }
        }
      `}</style>

      {strengthDimensionIds.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-[104px_minmax(0,1fr)] md:items-start">
          <span
            className="overview-rune-glow overview-rune-label-strength shrink-0 pt-1 font-display text-[10px] uppercase tracking-[0.16em]"
            style={labelStyles.strength}
          >
            Strengths
          </span>
          <div className="flex flex-wrap gap-2">
            {strengthDimensionIds.slice(0, 3).map((id, index) => {
              const tone =
                index === 0
                  ? chipStyles.strength.lead
                  : chipStyles.strength.default;

              return (
                <span
                  key={id}
                  className="overview-rune-chip overview-rune-glow rounded-full border px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.1em] transition-colors duration-200"
                  style={{
                    background: tone.background,
                    borderColor: tone.borderColor,
                    boxShadow: tone.boxShadow,
                    ["--overview-rune-aura-color" as string]: tone.auraColor,
                    ["--overview-rune-aura-duration" as string]:
                      index === 0 ? "3.8s" : "5.4s",
                    ["--overview-rune-delay" as string]: `${index * 280}ms`,
                    ["--overview-rune-glow-color" as string]: tone.glowColor,
                    ["--overview-rune-text-color" as string]: tone.color,
                    ["--overview-rune-text-duration" as string]:
                      index === 0 ? "3.8s" : "5.2s",
                  }}
                >
                  <span className="overview-rune-text">
                    {renderDimensionLabel(id)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {growthDimensionIds.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-[104px_minmax(0,1fr)] md:items-start">
          <span
            className="overview-rune-glow overview-rune-label-growth shrink-0 pt-1 font-display text-[10px] uppercase tracking-[0.16em]"
            style={labelStyles.growth}
          >
            Growth
          </span>
          <div className="flex flex-wrap gap-2">
            {growthDimensionIds.slice(0, 2).map((id, index) => {
              const tone =
                index === 0
                  ? chipStyles.growth.lead
                  : chipStyles.growth.default;

              return (
                <span
                  key={id}
                  className="overview-rune-chip overview-rune-glow rounded-full border px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.1em] transition-colors duration-200"
                  style={{
                    background: tone.background,
                    borderColor: tone.borderColor,
                    boxShadow: tone.boxShadow,
                    ["--overview-rune-aura-color" as string]: tone.auraColor,
                    ["--overview-rune-aura-duration" as string]:
                      index === 0 ? "4.1s" : "5.8s",
                    ["--overview-rune-delay" as string]: `${index * 360}ms`,
                    ["--overview-rune-glow-color" as string]: tone.glowColor,
                    ["--overview-rune-text-color" as string]: tone.color,
                    ["--overview-rune-text-duration" as string]:
                      index === 0 ? "4.1s" : "5.6s",
                  }}
                >
                  <span className="overview-rune-text">
                    {renderDimensionLabel(id)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
