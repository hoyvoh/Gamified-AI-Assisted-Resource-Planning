"use client";

import { RotateCcw } from "lucide-react";

import { LivingTacticalMap } from "@/features/analysis-chamber/components/scan-lobby/scan-lobby-map";
import { SCAN_LOBBY_TOKENS } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";
import type {
  LiveScanChamberState,
  ScanProgressPhase,
  ScanRun,
} from "@/features/analysis-chamber/components/scan-lobby/scan-lobby.types";

const toneClasses: Record<
  LiveScanChamberState,
  {
    border: string;
    badge: string;
    panelBg: string;
    panelBorder: string;
    title: string;
  }
> = {
  opening: {
    border: SCAN_LOBBY_TOKENS.panelBorderStrong,
    badge: SCAN_LOBBY_TOKENS.chipText,
    panelBg: SCAN_LOBBY_TOKENS.chipBg,
    panelBorder: SCAN_LOBBY_TOKENS.chipBorder,
    title: SCAN_LOBBY_TOKENS.title,
  },
  dispatching: {
    border: "rgba(125, 177, 255, 0.24)",
    badge: "#d8e7ff",
    panelBg: "rgba(91, 140, 255, 0.08)",
    panelBorder: "rgba(125, 177, 255, 0.18)",
    title: SCAN_LOBBY_TOKENS.title,
  },
  scouting: {
    border: "rgba(125, 177, 255, 0.24)",
    badge: "#d8e7ff",
    panelBg: "rgba(91, 140, 255, 0.08)",
    panelBorder: "rgba(125, 177, 255, 0.18)",
    title: SCAN_LOBBY_TOKENS.title,
  },
  success: {
    border: "rgba(110, 214, 156, 0.28)",
    badge: "#cff6df",
    panelBg: "rgba(78, 209, 165, 0.08)",
    panelBorder: "rgba(110, 214, 156, 0.18)",
    title: "#e5fff0",
  },
  redirecting: {
    border: "rgba(110, 214, 156, 0.28)",
    badge: "#cff6df",
    panelBg: "rgba(78, 209, 165, 0.08)",
    panelBorder: "rgba(110, 214, 156, 0.18)",
    title: "#e5fff0",
  },
  failed: {
    border: "rgba(216, 123, 109, 0.28)",
    badge: "#ffc3bb",
    panelBg: "rgba(130, 71, 64, 0.14)",
    panelBorder: "rgba(216, 123, 109, 0.18)",
    title: "#ffe3de",
  },
};

const getHeadline = (state: LiveScanChamberState) => {
  if (state === "opening") {
    return {
      badge: "Starting Scan",
      status: "Preparing scan window",
    };
  }

  if (state === "dispatching") {
    return {
      badge: "Dispatching",
      status: "Opening live scan chamber",
    };
  }

  if (state === "scouting") {
    return {
      badge: "Scan in Progress",
      status: "Gathering live scan signals",
    };
  }

  if (state === "success") {
    return {
      badge: "Scan Complete",
      status: "Profile ready",
    };
  }

  if (state === "redirecting") {
    return {
      badge: "Redirecting",
      status: "Opening profile",
    };
  }

  return {
    badge: "Scan Failed",
    status: "Retry required",
  };
};

export function LiveScanChamber({
  state,
  phase,
  run,
  history,
  reducedMotion,
  memberName,
  periodLabel,
  onRetry,
  onReturnToScan,
}: {
  state: LiveScanChamberState;
  phase: ScanProgressPhase;
  run: ScanRun | undefined;
  history: ScanRun[];
  reducedMotion: boolean;
  memberName: string;
  periodLabel: string;
  onRetry: (() => void) | null;
  onReturnToScan: (() => void) | null;
}) {
  const tone = toneClasses[state];
  const headline = getHeadline(state);
  const mapMode =
    state === "failed"
      ? "failed"
      : state === "success" || state === "redirecting"
        ? "success"
        : state === "dispatching"
          ? "dispatching"
          : "scouting";

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/72 backdrop-blur-md" />
      <div
        className="absolute inset-0"
        style={{ background: MEDIEVAL_THEME.gradients.page }}
      />

      <section className="relative flex h-screen items-center justify-center overflow-y-auto p-3 sm:p-5 lg:p-6">
        <div
          className="relative my-auto flex max-h-[calc(100vh-24px)] w-full max-w-[1320px] flex-col overflow-hidden rounded-[28px] border shadow-[0_30px_120px_rgba(0,0,0,0.58)] sm:max-h-[calc(100vh-40px)] lg:max-h-[calc(100vh-48px)]"
          style={{
            borderColor: tone.border,
            background: MEDIEVAL_THEME.gradients.shell,
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-28"
            style={{ background: MEDIEVAL_THEME.gradients.shellOverlay }}
          />

          <div className="relative z-10 flex flex-1 flex-col gap-3.5 overflow-y-auto p-4 sm:gap-4 sm:p-5 lg:gap-5 lg:px-6 lg:pb-6 lg:pt-6">
            <header className="flex flex-col gap-2.5 pt-1 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                <span
                  className="rounded-full border px-2 py-0.75 font-mono text-[8px] uppercase tracking-[0.18em]"
                  style={{
                    borderColor: tone.panelBorder,
                    background: tone.panelBg,
                    color: tone.badge,
                  }}
                >
                  {headline.badge}
                </span>
                <p className="truncate font-serif text-[1.35rem] leading-none sm:text-[1.55rem]" style={{ color: tone.title }}>
                  {memberName}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: SCAN_LOBBY_TOKENS.metaText }}>
                  {headline.status}
                </p>
              </div>

              <div
                className="rounded-lg border px-3 py-2"
                style={{ borderColor: tone.panelBorder, background: tone.panelBg }}
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: SCAN_LOBBY_TOKENS.labelText }}>
                  Campaign Window
                </p>
                <p className="mt-1 font-mono text-[10px]" style={{ color: SCAN_LOBBY_TOKENS.bodyTextStrong }}>{periodLabel}</p>
              </div>
            </header>

            <LivingTacticalMap
              mode={mapMode}
              phase={phase}
              activeRun={run}
              history={history}
              reducedMotion={reducedMotion}
              className="h-[clamp(430px,61vh,680px)] min-h-0 rounded-[24px] border-white/10 bg-[#100907] lg:h-[min(64vh,680px)]"
            />

            <footer className="flex flex-col gap-3 pb-1 lg:flex-row lg:items-center lg:justify-end">
              {state === "failed" && (
                <div className="flex flex-wrap gap-3">
                  <div className="mr-2 rounded-lg border border-red-300/18 bg-red-950/12 px-3 py-2 font-mono text-[11px] text-red-100/78">
                    {run?.errorMessage ?? "The chamber returned a failed verdict."}
                  </div>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200/30 bg-red-950/20 px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-red-50 transition hover:border-red-100/50 hover:bg-red-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Retry Dispatch
                    </button>
                  )}
                  {onReturnToScan && (
                    <button
                      type="button"
                      onClick={onReturnToScan}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                      style={{
                        borderColor: "rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        color: SCAN_LOBBY_TOKENS.bodyTextStrong,
                      }}
                    >
                      Return to Scan
                    </button>
                  )}
                </div>
              )}
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}
