"use client";

import type { ReactNode } from "react";

import { useMemo } from "react";

import { usePathname } from "next/navigation";

import type { ChamberBootstrap } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

import { AnalysisChamberFrame } from "@/features/analysis-chamber/components/analysis-chamber-frame";

import { AnalysisChamberHeroIdentityLayer } from "@/features/analysis-chamber/components/analysis-chamber-hero-identity-layer";

import { AnalysisChamberRouteRail } from "@/features/analysis-chamber/components/analysis-chamber-route-rail";

import { AnalysisChamberTopBar } from "@/features/analysis-chamber/components/analysis-chamber-top-bar";

import { AnalysisChamberTransitionController } from "@/features/analysis-chamber/components/analysis-chamber-transition-controller";

import { useAnalysisChamberShellData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";

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

const getShellConfidence = (
  bootstrap: ChamberBootstrap | null | undefined,
) => {
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
      ? "xl:grid-cols-[minmax(0,1fr)_176px] 2xl:grid-cols-[minmax(0,1fr)_188px]"
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

  const route = getActiveRoute(pathname);

  const roleName = useMemo(
    () => bootstrap.data?.roleName ?? "Role pending",

    [bootstrap.data?.roleName],
  );

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
        <AnalysisChamberTopBar bootstrap={loadingBootstrap} route={route} />
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
        <AnalysisChamberTopBar bootstrap={errorBootstrap} route={route} />
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

  return (
    <AnalysisChamberFrame>
      <AnalysisChamberTopBar bootstrap={bootstrap.data} route={route} />
      <div className={chamberBodyClassName}>
        <AnalysisChamberRouteRail activeRoute={route} memberId={memberId} />
        <div className={chamberStageClassName(showSideHeroIdentity)}>
          <AnalysisChamberTransitionController>
            {children}
          </AnalysisChamberTransitionController>
          {showSideHeroIdentity ? (
            <AnalysisChamberHeroIdentityLayer
              confidence={getShellConfidence(bootstrap.data)}
              memberName={bootstrap.data.member.displayName}
              roleName={roleName}
              status={bootstrap.data.analysisStatus}
            />
          ) : null}
        </div>
      </div>
    </AnalysisChamberFrame>
  );
};
