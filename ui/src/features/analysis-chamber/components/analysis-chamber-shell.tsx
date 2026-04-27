"use client";

import type { ReactNode } from "react";

import { useMemo, useState } from "react";

import { usePathname } from "next/navigation";

import type { ChamberBootstrap } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

import { triggerAnalysis } from "@/features/analysis-chamber/api/analysis-chamber-api";

import { AnalysisChamberFrame } from "@/features/analysis-chamber/components/analysis-chamber-frame";

import { AnalysisChamberHeroIdentityLayer } from "@/features/analysis-chamber/components/analysis-chamber-hero-identity-layer";
import { AnalysisChamberLiveStatusTotem } from "@/features/analysis-chamber/components/analysis-chamber-live-status-totem";

import { AnalysisChamberRouteRail } from "@/features/analysis-chamber/components/analysis-chamber-route-rail";

import { AnalysisChamberTopBar } from "@/features/analysis-chamber/components/analysis-chamber-top-bar";

import { AnalysisChamberTransitionController } from "@/features/analysis-chamber/components/analysis-chamber-transition-controller";

import {
  useAnalysisChamberShellData,
  useRefreshChamber,
} from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";

import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

import type { AnalysisChamberRouteKey } from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";

import type { AnalysisStatus } from "@/types/organization";

const getActiveRoute = (pathname: string): AnalysisChamberRouteKey => {
  if (pathname.endsWith("/competency")) {
    return "competency";
  }

  if (pathname.endsWith("/kpt")) {
    return "kpt";
  }

  if (pathname.endsWith("/cases")) {
    return "cases";
  }

  if (pathname.endsWith("/journey")) {
    return "journey";
  }

  return "overview";
};

const createShellPlaceholderBootstrap = (
  memberId: string,

  analysisStatus: AnalysisStatus,
): ChamberBootstrap => ({
  member: {
    id: memberId,

    teamId: "pending-team",

    organizationId: "pending-org",

    displayName: "Analysis Chamber",

    externalId: null,

    roleProfileId: null,

    analysisStatus: analysisStatus,

    lastAnalysisAt: null,

    createdAt: "",

    updatedAt: "",
  },

  roleName: "Loading",

  teamName: "Shell placeholder",

  latestRun: null,

  analysisStatus: analysisStatus,
});

// ─── Pending / running screen ────────────────────────────────────────────────

const PENDING_COPY: Record<
  "not_analyzed" | "analyzing" | "failed",
  { headline: string; sub: string }
> = {
  not_analyzed: {
    headline: "Analysis not started",

    sub: "No analysis run has been initiated for this member yet.",
  },

  analyzing: {
    headline: "Analysis in progress",

    sub: "Profile data will appear here once the run completes. This page refreshes automatically.",
  },

  failed: {
    headline: "Analysis failed",

    sub: "The last analysis run encountered an error. Trigger a new run to retry.",
  },
};

const AnalysisPendingScreen = ({
  memberId,

  status,

  onRefresh,
}: {
  memberId: string;

  status: "not_analyzed" | "analyzing" | "failed";

  onRefresh: () => void;
}) => {
  const copy = PENDING_COPY[status];

  const isRunning = status === "analyzing";

  const [triggerState, setTriggerState] = useState<
    "idle" | "triggering" | "triggered" | "error"
  >("idle");

  const [triggerError, setTriggerError] = useState<string | null>(null);

  const handleTrigger = async () => {
    if (triggerState === "triggering") return;

    setTriggerState("triggering");

    setTriggerError(null);

    try {
      await triggerAnalysis(memberId);

      setTriggerState("triggered");

      // Immediately refresh bootstrap so shell picks up the new "analyzing" status

      onRefresh();
    } catch (err) {
      setTriggerState("error");

      setTriggerError(
        err instanceof Error ? err.message : "Failed to start analysis.",
      );
    }
  };

  return (
    <div className="flex h-full min-h-130 flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full border"
        style={{
          borderColor: isRunning
            ? "rgba(200,150,30,0.5)"
            : "rgba(200,150,30,0.25)",

          background: isRunning
            ? "radial-gradient(circle, rgba(200,150,30,0.22) 0%, rgba(200,150,30,0.08) 55%, transparent 70%)"
            : "radial-gradient(circle, rgba(200,150,30,0.10) 0%, transparent 70%)",

          animation: isRunning ? "pulse 2s ease-in-out infinite" : undefined,
        }}
      >
        <span
          className="font-display text-3xl"
          style={{
            color: isRunning ? "rgba(200,150,30,0.9)" : "rgba(200,150,30,0.35)",
          }}
        >
          {isRunning ? "⚙" : status === "failed" ? "✕" : "○"}
        </span>
      </div>

      <div>
        <p
          className="font-display text-sm uppercase tracking-[0.18em]"
          style={{
            color: isRunning
              ? "rgba(255,232,192,0.85)"
              : "rgba(255,232,192,0.5)",
          }}
        >
          {copy.headline}
        </p>
        <p
          className="mt-2 max-w-sm text-sm leading-6"
          style={{ color: "rgba(255,232,192,0.4)" }}
        >
          {copy.sub}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3">
        {!isRunning && (
          <button
            className="rounded-full border px-5 py-2.5 font-display text-[11px] uppercase tracking-[0.14em] transition hover:brightness-125 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={
              triggerState === "triggering" || triggerState === "triggered"
            }
            onClick={() => void handleTrigger()}
            style={{
              borderColor: "rgba(200,150,30,0.55)",

              color: "rgba(200,150,30,0.9)",

              background: "rgba(200,150,30,0.08)",
            }}
            type="button"
          >
            {triggerState === "triggering"
              ? "Starting…"
              : triggerState === "triggered"
                ? "Analysis started ✓"
                : status === "failed"
                  ? "↺ Re-run analysis"
                  : "▶ Start analysis"}
          </button>
        )}

        {triggerError && (
          <p
            className="max-w-xs text-xs"
            style={{ color: "rgba(220,80,80,0.85)" }}
          >
            {triggerError}
          </p>
        )}

        <button
          className="font-display text-[10px] uppercase tracking-[0.12em] transition hover:brightness-125"
          onClick={onRefresh}
          style={{ color: "rgba(255,232,192,0.25)" }}
          type="button"
        >
          ↺ Refresh status
        </button>
      </div>
    </div>
  );
};

const getShellConfidence = (bootstrap: ChamberBootstrap | null | undefined) => {
  if (!bootstrap?.latestRun) {
    return bootstrap?.analysisStatus === "completed" ? 0.7 : 0.36;
  }

  if (bootstrap.latestRun.status === "analyzing") {
    return bootstrap.latestRun.progressPct / 100;
  }

  return bootstrap.analysisStatus === "completed" ? 0.78 : 0.44;
};

const chamberBodyClassName =
  "grid min-h-[calc(100vh-68px)] grid-cols-[72px_1fr] md:min-h-[calc(100vh-88px)]";

const chamberStageClassName = (showSideHeroIdentity: boolean) =>
  `grid min-h-full ${
    showSideHeroIdentity
      ? "xl:grid-cols-[minmax(0,1fr)_248px] 2xl:grid-cols-[minmax(0,1fr)_260px]"
      : ""
  }`;

export const AnalysisChamberShell = ({
  children,

  memberId,
}: {
  children: ReactNode;

  memberId: string;
}) => {
  const pathname = usePathname();

  const bootstrap = useAnalysisChamberShellData(memberId);

  const refreshChamber = useRefreshChamber(memberId);

  const route = getActiveRoute(pathname);

  const loadingBootstrap = useMemo(
    () => createShellPlaceholderBootstrap(memberId, "not_analyzed"),

    [memberId],
  );

  const errorBootstrap = useMemo(
    () => createShellPlaceholderBootstrap(memberId, "failed"),

    [memberId],
  );

  const showSideHeroIdentity = route !== "overview";

  if (bootstrap.isPending) {
    return (
      <AnalysisChamberFrame>
        <AnalysisChamberTopBar
          bootstrap={loadingBootstrap}
          route={route}
          onRefresh={refreshChamber}
        />
        <div className={chamberBodyClassName}>
          <AnalysisChamberRouteRail activeRoute={route} memberId={memberId} />
          <div className={chamberStageClassName(showSideHeroIdentity)}>
            <AnalysisChamberTransitionController>
              <div className="flex h-full min-h-130 items-center justify-center px-6 text-center">
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.18em]">
                    Loading profile
                  </p>
                  <div
                    className="mx-auto mt-8 h-24 w-24 rounded-full border"
                    style={{
                      borderColor: "rgba(200, 150, 30, 0.35)",

                      background:
                        "radial-gradient(circle, rgba(200,150,30,0.18) 0%, rgba(200,150,30,0.06) 55%, transparent 70%)",
                    }}
                  />
                </div>
              </div>
            </AnalysisChamberTransitionController>
            {showSideHeroIdentity ? (
              <AnalysisChamberHeroIdentityLayer
                confidence={getShellConfidence(loadingBootstrap)}
                memberName={loadingBootstrap.member.displayName}
                roleName={loadingBootstrap.roleName ?? "Loading"}
                status={loadingBootstrap.analysisStatus}
              />
            ) : null}
          </div>
        </div>
      </AnalysisChamberFrame>
    );
  }

  if (!bootstrap.data) {
    return (
      <AnalysisChamberFrame>
        <AnalysisChamberTopBar
          bootstrap={errorBootstrap}
          route={route}
          onRefresh={refreshChamber}
        />
        <div className={chamberBodyClassName}>
          <AnalysisChamberRouteRail activeRoute={route} memberId={memberId} />
          <div className={chamberStageClassName(showSideHeroIdentity)}>
            <AnalysisChamberTransitionController>
              <div
                className="flex h-full min-h-130 items-center justify-center px-6 text-center"
                style={{ color: palette.crimson }}
              >
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.18em]">
                    Profile unavailable
                  </p>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: palette.inkSoft }}
                  >
                    Member profile could not be loaded.
                  </p>
                </div>
              </div>
            </AnalysisChamberTransitionController>
            {showSideHeroIdentity ? (
              <AnalysisChamberHeroIdentityLayer
                confidence={getShellConfidence(errorBootstrap)}
                memberName={errorBootstrap.member.displayName}
                roleName={errorBootstrap.roleName ?? "Unavailable"}
                status={errorBootstrap.analysisStatus}
              />
            ) : null}
          </div>
        </div>
      </AnalysisChamberFrame>
    );
  }

  const analysisStatus = bootstrap.data.analysisStatus;

  // Block stage children from mounting (and firing 404 API calls) until analysis

  // is complete. Show a contextual waiting screen for pending/running states.

  const stageContent =
    analysisStatus === "completed" ? (
      children
    ) : (
      <AnalysisPendingScreen
        memberId={memberId}
        status={analysisStatus}
        onRefresh={refreshChamber}
      />
    );

  return (
    <AnalysisChamberFrame>
      <AnalysisChamberTopBar
        bootstrap={bootstrap.data}
        route={route}
        onRefresh={refreshChamber}
      />
      <div className={chamberBodyClassName}>
        <AnalysisChamberRouteRail activeRoute={route} memberId={memberId} />
        <div className={chamberStageClassName(showSideHeroIdentity)}>
          <AnalysisChamberTransitionController>
            {stageContent}
          </AnalysisChamberTransitionController>
          {showSideHeroIdentity ? (
            <AnalysisChamberLiveStatusTotem
              bootstrap={bootstrap.data}
              confidence={getShellConfidence(bootstrap.data)}
              memberId={memberId}
              route={route}
            />
          ) : null}
        </div>
      </div>
    </AnalysisChamberFrame>
  );
};
