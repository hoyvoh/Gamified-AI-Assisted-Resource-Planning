import type { ScanLobbyMode, ScanProgressPhase } from "../scan-lobby.types";
import { PHASES, PHASE_LABELS } from "./map-constants";

export function MapPhaseRail({
  phase,
  mode,
  progressPct,
}: {
  phase: ScanProgressPhase;
  mode: ScanLobbyMode;
  progressPct: number | undefined;
}) {
  const currentIndex = PHASES.indexOf(phase);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/26">
          Phase Rail
        </p>
        <p className="font-mono text-[8px] text-white/34">
          Phase {currentIndex + 1} of {PHASES.length}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {PHASES.map((phaseKey, index) => {
          const complete = index < currentIndex || mode === "success";
          const current = index === currentIndex && mode !== "success";
          const failed = mode === "failed" && index === currentIndex;

          return (
            <div key={phaseKey} className="min-w-0">
              <div
                className={`h-0.75 rounded-full ${
                  failed
                    ? "bg-red-300"
                    : complete
                      ? "bg-emerald-200"
                      : current
                        ? "bg-amber-200 shadow-[0_0_14px_rgba(214,168,79,0.55)]"
                        : "bg-white/7"
                }`}
              />
              <p
                className={`mt-0.5 truncate font-mono text-[6px] uppercase tracking-[0.1em] ${
                  failed
                    ? "text-red-100"
                    : complete || current
                      ? "text-amber-100"
                      : "text-white/20"
                }`}
              >
                {PHASE_LABELS[phaseKey]}
              </p>
            </div>
          );
        })}
      </div>

      {typeof progressPct === "number" && (
        <div className="mt-1.5 h-0.75 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-emerald-300 transition-all duration-500"
            style={{ width: `${Math.max(progressPct, 8)}%` }}
          />
        </div>
      )}
    </div>
  );
}
