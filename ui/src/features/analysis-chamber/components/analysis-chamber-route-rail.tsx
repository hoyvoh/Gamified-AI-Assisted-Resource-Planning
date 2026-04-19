"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ANALYSIS_CHAMBER_ROUTES,
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";
import type { AnalysisChamberRouteKey } from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";

export const AnalysisChamberRouteRail = ({
  memberId,
  activeRoute,
}: {
  memberId: string;
  activeRoute: AnalysisChamberRouteKey;
}) => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Analysis chamber routes"
      className="relative z-20 flex h-full flex-col items-center gap-2.5 overflow-visible border-r px-1.5 py-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(21,9,10,0.98), rgba(12,5,8,0.98))",
        borderColor: "rgba(200, 150, 30, 0.35)",
      }}
    >
      <div
        className="pointer-events-none absolute bottom-4 top-4 w-px"
        style={{ background: "rgba(255,149,0,0.14)" }}
      />
      {ANALYSIS_CHAMBER_ROUTES.map((route, index) => {
        const isActive = route.key === activeRoute;

        return (
          <div key={route.key} className="flex flex-col items-center gap-3">
            <Link
              aria-current={isActive ? "page" : undefined}
              className="group relative flex h-10 w-10 items-center justify-center rounded-md border text-base transition-transform duration-200 hover:-translate-y-0.5"
              href={buildAnalysisChamberRouteHref(memberId, route.key)}
              style={{
                background: isActive ? palette.goldPale : "transparent",
                borderColor: isActive
                  ? palette.gold
                  : "rgba(200, 150, 30, 0.1)",
                color: isActive ? palette.ink : palette.inkMuted,
                boxShadow: isActive
                  ? "0 10px 24px rgba(255,149,0,0.18), inset 0 0 14px rgba(255,149,0,0.10)"
                  : "none",
              }}
              title={`${route.label} | ${route.artifact}`}
              data-pathname={pathname}
            >
              <span aria-hidden="true">{route.artifactSymbol}</span>
              <span
                className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-sm px-2 py-1 text-[10px] font-display uppercase tracking-[0.12em] group-hover:block md:group-hover:block"
                style={{
                  background: palette.ink,
                  color: palette.parchment,
                }}
              >
                {route.label} | {route.artifact}
              </span>
            </Link>

            {index < ANALYSIS_CHAMBER_ROUTES.length - 1 ? (
              <div
                className="h-4 w-px"
                style={{ background: "rgba(255,149,0,0.22)" }}
              />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
};
