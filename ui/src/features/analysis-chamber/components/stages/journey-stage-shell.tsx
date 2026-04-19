"use client";

import { useMemo } from "react";

import type { ChamberMilestoneResponse } from "@/features/analysis-chamber/api/analysis-chamber-api.types";
import { useAnalysisChamberJourneyData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

const MILESTONE_POSITIONS: Array<{ left: string; top: string }> = [
  { left: "10%", top: "64%" },
  { left: "28%", top: "38%" },
  { left: "48%", top: "22%" },
  { left: "68%", top: "36%" },
  { left: "84%", top: "18%" },
];

const humanizeMilestoneType = (milestoneType: string) =>
  milestoneType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatMilestoneDate = (timestamp: string) => {
  try {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
};

const getMilestoneTypeAccent = (milestoneType: string) => {
  const t = milestoneType.toLowerCase();
  if (t.includes("growth") || t.includes("advance"))
    return { border: palette.azure, dot: palette.azure };
  if (t.includes("achiev") || t.includes("complet"))
    return { border: palette.gold, dot: palette.gold };
  if (t.includes("challenge") || t.includes("risk"))
    return { border: palette.ember, dot: palette.ember };
  return { border: "rgba(154,171,184,0.55)", dot: palette.silver };
};

export const JourneyStageShell = ({ memberId }: { memberId: string }) => {
  const journey = useAnalysisChamberJourneyData(memberId);
  const { state, updateQuery } = useAnalysisChamberRouteState();
  const milestones = journey.data?.milestones ?? [];
  const focusedMilestone = useMemo(
    () =>
      milestones.find(
        (milestone) => milestone.milestone_id === state.milestone,
      ) ??
      milestones[0] ??
      null,
    [milestones, state.milestone],
  );
  const focusedIndex = focusedMilestone
    ? milestones.findIndex(
        (m) => m.milestone_id === focusedMilestone.milestone_id,
      )
    : -1;
  const prevMilestone =
    focusedIndex > 0 ? (milestones[focusedIndex - 1] ?? null) : null;
  const nextMilestone =
    focusedIndex >= 0 && focusedIndex < milestones.length - 1
      ? (milestones[focusedIndex + 1] ?? null)
      : null;
  const hasMap = milestones.length > 0;

  return (
    <section className="grid h-full gap-0 lg:grid-rows-[1fr_140px]">
      {/* Map area — full bleed, no outer card wrapper */}
      <div className="relative min-h-130 overflow-hidden">
        {/* Atmosphere backdrop */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 22% 36%, rgba(26,74,122,0.18), transparent 28%), radial-gradient(circle at 62% 20%, rgba(200,150,30,0.14), transparent 24%)",
          }}
        />
        <div className="relative z-10 h-full p-4 md:p-5">
          {/* Map grid: canvas + landmark panel */}
          <div className="grid h-full gap-4 lg:grid-cols-[1fr_280px]">
            {/* Map canvas */}
            <div
              className="relative min-h-75 overflow-hidden rounded-2xl border p-4"
              style={{
                borderColor: "rgba(200,150,30,0.2)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {/* Terrain lines — always rendered as atmosphere */}
              <div
                className="pointer-events-none absolute left-[8%] top-[66%] h-px w-[84%]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(200,150,30,0.28), transparent)",
                }}
              />
              <div
                className="pointer-events-none absolute left-[14%] top-[22%] h-[46%] w-px rotate-12"
                style={{ background: "rgba(26,74,122,0.18)" }}
              />
              <div
                className="pointer-events-none absolute left-[44%] top-[12%] h-[48%] w-px -rotate-12"
                style={{ background: "rgba(200,150,30,0.16)" }}
              />
              <div
                className="pointer-events-none absolute left-[68%] top-[22%] h-[42%] w-px rotate-6"
                style={{ background: "rgba(26,74,122,0.18)" }}
              />

              {hasMap ? (
                milestones.slice(0, 5).map((milestone, index) => {
                  const position =
                    MILESTONE_POSITIONS[index] ?? MILESTONE_POSITIONS[0];
                  const isFocused =
                    focusedMilestone?.milestone_id === milestone.milestone_id;
                  const accent = getMilestoneTypeAccent(
                    milestone.milestone_type,
                  );

                  return (
                    <button
                      key={milestone.milestone_id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-left transition-all duration-200"
                      onClick={() =>
                        updateQuery({
                          milestone: milestone.milestone_id,
                          highlight: milestone.milestone_id,
                        })
                      }
                      style={position}
                      type="button"
                    >
                      {/* Beacon dot */}
                      <div className="flex justify-center">
                        <div
                          className="rounded-full border-2"
                          style={{
                            width: isFocused ? 28 : 20,
                            height: isFocused ? 28 : 20,
                            borderColor: isFocused
                              ? palette.gold
                              : accent.border,
                            background: isFocused
                              ? "rgba(200,150,30,0.35)"
                              : "rgba(255,255,255,0.08)",
                            boxShadow: isFocused
                              ? `0 0 0 8px rgba(200,150,30,0.12), 0 0 0 16px rgba(200,150,30,0.06), 0 0 24px rgba(200,150,30,0.4)`
                              : "none",
                            transition: "all 0.2s",
                          }}
                        />
                      </div>
                      {/* Landmark card */}
                      <div
                        className="mt-2 w-36 rounded-md border px-3 py-2"
                        style={{
                          borderColor: isFocused
                            ? palette.gold
                            : "rgba(200,150,30,0.18)",
                          background: isFocused
                            ? "rgba(200,150,30,0.18)"
                            : "rgba(255,255,255,0.05)",
                          boxShadow: isFocused
                            ? "0 4px 20px rgba(200,150,30,0.22)"
                            : "none",
                        }}
                      >
                        {/* Type badge */}
                        <p
                          className="text-[9px] uppercase tracking-widest"
                          style={{
                            color: isFocused ? palette.gold : accent.dot,
                          }}
                        >
                          {humanizeMilestoneType(milestone.milestone_type)}
                        </p>
                        <p
                          className="mt-1 font-display text-[11px] uppercase tracking-[0.06em] leading-4"
                          style={{
                            color: isFocused ? palette.ink : palette.inkSoft,
                          }}
                        >
                          {milestone.title}
                        </p>
                        {isFocused &&
                        milestone.impact_score !== null &&
                        milestone.impact_score !== undefined ? (
                          <p
                            className="mt-1 text-[10px]"
                            style={{ color: palette.gold }}
                          >
                            Impact{" "}
                            {Math.round((milestone.impact_score ?? 0) * 100)}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              ) : (
                /* Empty state — compass rose */
                <div className="flex h-full min-h-55 flex-col items-center justify-center gap-5">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    {/* Outer ring */}
                    <div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: "rgba(200,150,30,0.22)" }}
                    />
                    {/* Inner ring */}
                    <div
                      className="absolute inset-3 rounded-full border"
                      style={{ borderColor: "rgba(200,150,30,0.14)" }}
                    />
                    {/* Cardinal crosshairs */}
                    <div
                      className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
                      style={{ background: "rgba(200,150,30,0.18)" }}
                    />
                    <div
                      className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2"
                      style={{ background: "rgba(200,150,30,0.18)" }}
                    />
                    {/* Center dot */}
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(200,150,30,0.6), rgba(200,150,30,0.2))",
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="font-display text-xs uppercase tracking-widest"
                      style={{ color: palette.inkMuted }}
                    >
                      No landmarks yet
                    </p>
                    <p
                      className="mt-1 text-xs leading-5"
                      style={{ color: "rgba(138,112,88,0.5)" }}
                    >
                      No landmarks have been charted yet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Focused landmark panel */}
            <div
              className="flex flex-col gap-4 rounded-2xl border px-4 py-4"
              style={{
                borderColor: "rgba(200,150,30,0.2)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {focusedMilestone ? (
                <>
                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className="text-[9px] uppercase tracking-widest"
                        style={{ color: palette.gold }}
                      >
                        Landmark {focusedIndex + 1}
                      </p>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest"
                        style={{
                          borderColor: getMilestoneTypeAccent(
                            focusedMilestone.milestone_type,
                          ).border,
                          color: getMilestoneTypeAccent(
                            focusedMilestone.milestone_type,
                          ).dot,
                        }}
                      >
                        {humanizeMilestoneType(focusedMilestone.milestone_type)}
                      </span>
                    </div>
                    <div
                      className="mt-2"
                      style={{
                        height: "2px",
                        background: palette.gold,
                        borderRadius: "1px",
                        width: "28px",
                      }}
                    />
                    <p
                      className="mt-3 font-display text-sm uppercase tracking-[0.06em] leading-5"
                      style={{ color: palette.ink }}
                    >
                      {focusedMilestone.title}
                    </p>
                    {formatMilestoneDate(focusedMilestone.timestamp) ? (
                      <p
                        className="mt-2 text-[10px] uppercase tracking-widest"
                        style={{ color: palette.inkMuted }}
                      >
                        {formatMilestoneDate(focusedMilestone.timestamp)}
                      </p>
                    ) : null}
                  </div>

                  {focusedMilestone.impact_score !== null &&
                  focusedMilestone.impact_score !== undefined ? (
                    <div
                      className="rounded-md border px-3 py-2"
                      style={{
                        borderColor: "rgba(200,150,30,0.28)",
                        background: "rgba(200,150,30,0.08)",
                      }}
                    >
                      <p
                        className="text-[9px] uppercase tracking-widest"
                        style={{ color: palette.inkMuted }}
                      >
                        Impact score
                      </p>
                      <p
                        className="mt-1 font-display text-xl"
                        style={{ color: palette.gold }}
                      >
                        {Math.round((focusedMilestone.impact_score ?? 0) * 100)}
                        <span
                          className="ml-1 text-xs"
                          style={{ color: palette.inkSoft }}
                        >
                          /100
                        </span>
                      </p>
                    </div>
                  ) : null}

                  <p
                    className="flex-1 text-sm leading-6"
                    style={{ color: palette.inkSoft }}
                  >
                    {focusedMilestone.summary ??
                      "This landmark is charted on the map but the annotation has not been written yet."}
                  </p>

                  {/* Prev / next navigation */}
                  {(prevMilestone ?? nextMilestone) ? (
                    <div className="flex items-center gap-2">
                      {prevMilestone ? (
                        <button
                          className="rounded border px-3 py-2 text-[10px] uppercase tracking-widest"
                          onClick={() =>
                            updateQuery({
                              milestone: prevMilestone.milestone_id,
                              highlight: prevMilestone.milestone_id,
                            })
                          }
                          style={{
                            borderColor: "rgba(200,150,30,0.25)",
                            background: "rgba(255,255,255,0.04)",
                            color: palette.inkMuted,
                          }}
                          type="button"
                        >
                          ← Prev
                        </button>
                      ) : null}
                      {nextMilestone ? (
                        <button
                          className="rounded border px-3 py-2 text-[10px] uppercase tracking-widest"
                          onClick={() =>
                            updateQuery({
                              milestone: nextMilestone.milestone_id,
                              highlight: nextMilestone.milestone_id,
                            })
                          }
                          style={{
                            borderColor: palette.gold,
                            background: "rgba(200,150,30,0.10)",
                            color: palette.ink,
                          }}
                          type="button"
                        >
                          Next →
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p
                    className="font-display text-[10px] uppercase tracking-widest"
                    style={{ color: palette.gold }}
                  >
                    Focused landmark
                  </p>
                  <p
                    className="text-sm leading-6"
                    style={{ color: palette.inkMuted }}
                  >
                    {hasMap
                      ? "Select a landmark on the map to anchor the chamber."
                      : (journey.data?.growth_journey_summary ??
                        "The expedition has not yet produced landmark data for this period.")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Timeline strip / expedition log */}
      <div
        className="border-t px-5 py-4 md:px-7"
        style={{
          background: palette.parchmentMid,
          borderColor: "rgba(200, 150, 30, 0.35)",
        }}
      >
        <p
          className="font-display text-[10px] uppercase tracking-[0.18em]"
          style={{ color: palette.gold }}
        >
          Expedition log
        </p>
        {hasMap ? (
          <div className="mt-3 flex flex-wrap items-center gap-1">
            {milestones.slice(0, 5).map((milestone, index) => {
              const isFocused =
                focusedMilestone?.milestone_id === milestone.milestone_id;
              const accent = getMilestoneTypeAccent(milestone.milestone_type);

              return (
                <div
                  key={milestone.milestone_id}
                  className="flex items-center gap-1"
                >
                  <button
                    className="flex items-center gap-2 rounded border px-3 py-2 transition-all duration-150"
                    onClick={() =>
                      updateQuery({
                        milestone: milestone.milestone_id,
                        highlight: milestone.milestone_id,
                      })
                    }
                    style={{
                      borderColor: isFocused
                        ? palette.gold
                        : "rgba(200,150,30,0.18)",
                      background: isFocused
                        ? "rgba(200,150,30,0.18)"
                        : "rgba(255,255,255,0.04)",
                      color: isFocused ? palette.ink : palette.inkMuted,
                      boxShadow: isFocused
                        ? "0 2px 10px rgba(200,150,30,0.20)"
                        : "none",
                    }}
                    type="button"
                  >
                    <span
                      className="font-display text-[10px]"
                      style={{
                        color: isFocused
                          ? palette.gold
                          : "rgba(138,112,88,0.5)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: isFocused ? palette.gold : accent.dot,
                        opacity: isFocused ? 1 : 0.55,
                      }}
                    />
                    <span className="text-[11px] uppercase tracking-[0.08em]">
                      {milestone.title}
                    </span>
                  </button>
                  {index < Math.min(milestones.length, 5) - 1 ? (
                    <span
                      className="text-[10px]"
                      style={{ color: "rgba(200,150,30,0.3)" }}
                    >
                      →
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-xs" style={{ color: "rgba(138,112,88,0.5)" }}>
            No expedition log entries yet.
          </p>
        )}
      </div>
    </section>
  );
};
