"use client";

import type { JourneyMilestoneViewModel } from "@/features/analysis-chamber/components/stages/journey/journey-stage.types";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

const stateTone = {
  conquered: {
    border: "rgba(255,184,77,0.20)",
    background: "rgba(255,184,77,0.10)",
    text: palette.ink,
    dot: palette.gold,
  },
  frontier: {
    border: "rgba(255,184,77,0.38)",
    background:
      "linear-gradient(90deg, rgba(255,184,77,0.20) 0%, rgba(255,184,77,0.10) 100%)",
    text: "#fff1d2",
    dot: "#ffe6b6",
  },
  unconquered: {
    border: "rgba(154,171,184,0.16)",
    background: "rgba(255,255,255,0.03)",
    text: palette.inkMuted,
    dot: palette.silver,
  },
} as const;

export const JourneyExpeditionLog = ({
  milestones,
  focusedMilestoneId,
  onSelectMilestone,
}: {
  milestones: JourneyMilestoneViewModel[];
  focusedMilestoneId: string | null;
  onSelectMilestone: (milestoneId: string) => void;
}) => (
  <div
    className="border-t px-5 py-4 md:px-7"
    style={{
      background: palette.parchmentMid,
      borderColor: "rgba(255,184,77,0.18)",
    }}
  >
    <div className="flex items-start justify-between gap-6">
      <div>
        <p
          className="font-display text-[10px] uppercase tracking-[0.18em]"
          style={{ color: palette.gold }}
        >
          Expedition log
        </p>
        <p className="mt-2 text-xs leading-5" style={{ color: palette.inkMuted }}>
          The route log mirrors the same conquered, frontier, and locked states shown on the campaign map.
        </p>
      </div>
    </div>

    {milestones.length > 0 ? (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {milestones.map((item, index) => {
          const tone = stateTone[item.state];
          const isFocused = item.milestone.id === focusedMilestoneId;

          return (
            <div key={item.milestone.id} className="flex items-center gap-2">
              <button
                type="button"
                className="group flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-left transition duration-150 hover:brightness-110"
                onClick={() => onSelectMilestone(item.milestone.id)}
                style={{
                  borderColor: isFocused ? "rgba(255,184,77,0.42)" : tone.border,
                  background: isFocused ? "rgba(255,184,77,0.18)" : tone.background,
                  color: tone.text,
                  boxShadow: isFocused ? "0 6px 18px rgba(0,0,0,0.18)" : "none",
                }}
              >
                <span
                  className="font-display text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: isFocused ? palette.gold : palette.inkMuted }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: tone.dot, opacity: item.state === "unconquered" ? 0.65 : 1 }}
                />
                <span className="max-w-[180px] truncate text-[11px] uppercase tracking-[0.08em]">
                  {item.milestone.title}
                </span>
              </button>
              {index < milestones.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="text-[11px]"
                  style={{
                    color:
                      item.state === "unconquered"
                        ? "rgba(154,171,184,0.34)"
                        : "rgba(255,184,77,0.34)",
                  }}
                >
                  →
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    ) : (
      <p className="mt-4 text-xs" style={{ color: "rgba(138,112,88,0.56)" }}>
        No expedition entries yet.
      </p>
    )}
  </div>
);
