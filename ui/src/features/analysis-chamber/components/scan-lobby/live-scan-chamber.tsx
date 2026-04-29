"use client";

import { RotateCcw } from "lucide-react";

import { LivingTacticalMap } from "@/features/analysis-chamber/components/scan-lobby/scan-lobby-map";
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
    panel: string;
    title: string;
  }
> = {
  opening: {
    border: "border-amber-200/20",
    badge: "text-amber-100",
    panel: "border-amber-200/15 bg-amber-200/5",
    title: "text-amber-50",
  },
  dispatching: {
    border: "border-sky-300/20",
    badge: "text-sky-100",
    panel: "border-sky-300/15 bg-sky-300/5",
    title: "text-amber-50",
  },
  scouting: {
    border: "border-sky-300/20",
    badge: "text-sky-100",
    panel: "border-sky-300/15 bg-sky-300/5",
    title: "text-amber-50",
  },
  success: {
    border: "border-emerald-300/25",
    badge: "text-emerald-100",
    panel: "border-emerald-300/15 bg-emerald-300/6",
    title: "text-emerald-50",
  },
  redirecting: {
    border: "border-emerald-300/25",
    badge: "text-emerald-100",
    panel: "border-emerald-300/15 bg-emerald-300/6",
    title: "text-emerald-50",
  },
  failed: {
    border: "border-red-300/25",
    badge: "text-red-100",
    panel: "border-red-300/15 bg-red-950/16",
    title: "text-red-50",
  },
};

const getHeadline = (state: LiveScanChamberState) => {
  if (state === "opening") {
    return {
      badge: "Opening Chamber",
      status: "Sealing dispatch order",
    };
  }

  if (state === "dispatching") {
    return {
      badge: "Dispatching",
      status: "Raising live chamber",
    };
  }

  if (state === "scouting") {
    return {
      badge: "Scan in Progress",
      status: "Gathering live signal",
    };
  }

  if (state === "success") {
    return {
      badge: "Verdict Locked",
      status: "Dossier fortified",
    };
  }

  if (state === "redirecting") {
    return {
      badge: "Redirecting",
      status: "Opening profile",
    };
  }

  return {
    badge: "Broken Banner",
    status: "Dispatch failed",
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(214,168,79,0.14),transparent_34%),linear-gradient(180deg,rgba(8,5,5,0.74),rgba(3,2,2,0.92))]" />

      <section className="relative flex h-screen items-center justify-center overflow-y-auto p-3 sm:p-5 lg:p-6">
        <div
          className={`relative my-auto flex max-h-[calc(100vh-24px)] w-full max-w-[1320px] flex-col overflow-hidden rounded-[28px] border bg-[#0d0807]/96 shadow-[0_30px_120px_rgba(0,0,0,0.58)] sm:max-h-[calc(100vh-40px)] lg:max-h-[calc(100vh-48px)] ${tone.border}`}
        >
          <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(214,168,79,0.08),transparent)]" />

          <div className="relative z-10 flex flex-1 flex-col gap-3.5 overflow-y-auto p-4 sm:gap-4 sm:p-5 lg:gap-5 lg:px-6 lg:pb-6 lg:pt-6">
            <header className="flex flex-col gap-2.5 pt-1 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                <span
                  className={`rounded-full border px-2 py-0.75 font-mono text-[8px] uppercase tracking-[0.18em] ${tone.panel} ${tone.badge}`}
                >
                  {headline.badge}
                </span>
                <p className="truncate font-serif text-[1.35rem] leading-none text-amber-50 sm:text-[1.55rem]">
                  {memberName}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/44">
                  {headline.status}
                </p>
              </div>

              <div className={`rounded-lg border px-3 py-2 ${tone.panel}`}>
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/30">
                  Campaign Window
                </p>
                <p className="mt-1 font-mono text-[10px] text-white/64">{periodLabel}</p>
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
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-white/70 transition hover:border-white/25 hover:text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
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
