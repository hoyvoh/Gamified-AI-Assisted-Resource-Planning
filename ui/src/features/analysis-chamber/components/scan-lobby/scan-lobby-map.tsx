"use client";

import { useMemo } from "react";

import type {
  ScanLobbyMode,
  ScanProgressPhase,
  ScanRun,
} from "@/features/analysis-chamber/components/scan-lobby/scan-lobby.types";

import { PHASE_COPY } from "./map/map-constants";
import { MapAnchorNodes } from "./map/map-anchor-nodes";
import { MapNetworkSvg } from "./map/map-network-svg";
import { MapPhaseRail } from "./map/map-phase-rail";
import { MapRouteLayer } from "./map/map-route-layer";
import { MapSignalCore } from "./map/map-signal-core";
import { MapSourceStates } from "./map/map-source-states";
import { getSourceStatuses } from "./map/map-utils";
import { SCAN_LOBBY_TOKENS } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

export function LivingTacticalMap({
  mode,
  phase,
  activeRun,
  history,
  reducedMotion,
  className,
}: {
  mode: ScanLobbyMode;
  phase: ScanProgressPhase;
  activeRun: ScanRun | undefined;
  history: ScanRun[];
  reducedMotion: boolean;
  className?: string;
}) {
  const sourceStatuses = useMemo(
    () => getSourceStatuses(mode, phase),
    [mode, phase],
  );

  const phaseCopy = PHASE_COPY[phase];
  const completedCount = history.filter((r) => r.status === "completed").length;
  const failedCount = history.filter((r) => r.status === "failed").length;

  const borderColor =
    mode === "failed"
      ? "rgba(216, 123, 109, 0.30)"
      : mode === "success"
        ? "rgba(110, 214, 156, 0.30)"
        : mode === "scouting" || mode === "dispatching"
          ? "rgba(125, 177, 255, 0.30)"
          : SCAN_LOBBY_TOKENS.panelBorderStrong;

  return (
    <section
      className={`relative h-[500px] overflow-hidden rounded-lg border shadow-2xl sm:h-[480px] lg:h-[460px] ${className ?? ""}`}
      style={{
        borderColor,
        background: MEDIEVAL_THEME.gradients.shell,
      }}
      aria-labelledby="living-map-title"
    >
      <div
        className={`absolute inset-0 bg-[size:auto,auto,42px_42px,42px_42px] ${
          reducedMotion ? "" : "scan-map-grid-drift"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(216,175,99,0.18), rgba(216,175,99,0.05) 34%, rgba(0,0,0,0.3) 72%, transparent 100%), linear-gradient(135deg, rgba(255,255,255,0.045), transparent 42%), linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)",
        }}
      />

      <div className="absolute inset-x-2 top-[40px] bottom-[196px] z-10 grid place-items-center sm:inset-x-4 sm:top-[40px] sm:bottom-[196px] md:top-[34px] md:bottom-[112px]">
        <div className="relative aspect-[5/2] h-full max-w-full min-w-0">
          <MapNetworkSvg mode={mode} sourceStatuses={sourceStatuses} />
          <MapRouteLayer
            mode={mode}
            sourceStatuses={sourceStatuses}
            reducedMotion={reducedMotion}
          />

          <div
            className="pointer-events-none absolute z-10"
            style={{ left: "50%", top: "46.25%", transform: "translate(-50%, -50%)" }}
          >
            <MapSignalCore
              mode={mode}
              phase={phase}
              reducedMotion={reducedMotion}
            />
          </div>

          <MapAnchorNodes
            sourceStatuses={sourceStatuses}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      <div className="relative z-30 flex h-full flex-col justify-between p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: SCAN_LOBBY_TOKENS.eyebrow }}>
              Live Scan Map
            </p>
          </div>
          <div
            className="rounded-md border px-3 py-2 text-right backdrop-blur-sm"
            style={{
              borderColor: SCAN_LOBBY_TOKENS.panelBorder,
              background: "rgba(0,0,0,0.20)",
            }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: SCAN_LOBBY_TOKENS.labelText }}>
              Run markers
            </p>
            <p className="mt-1 font-mono text-[11px]" style={{ color: SCAN_LOBBY_TOKENS.bodyTextStrong }}>
              {completedCount} fortified / {failedCount} broken
            </p>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[minmax(0,0.5fr)_minmax(170px,0.24fr)] md:items-end md:justify-between">
          <div
            className="max-w-[470px] rounded-md border p-1.5 backdrop-blur-sm"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.12)",
            }}
          >
            <MapPhaseRail
              phase={phase}
              mode={mode}
              progressPct={activeRun?.progressPct}
            />
            <p className="mt-1.5 font-mono text-[7px] uppercase tracking-[0.16em]" style={{ color: "rgba(216,175,99,0.38)" }}>
              {phaseCopy.title}
            </p>
            <p className="mt-0.5 text-[9px]" style={{ color: "rgba(241,228,207,0.46)" }}>{phaseCopy.detail}</p>
          </div>

          <MapSourceStates sourceStatuses={sourceStatuses} />
        </div>
      </div>
    </section>
  );
}
