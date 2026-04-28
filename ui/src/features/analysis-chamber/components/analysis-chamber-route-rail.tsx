"use client";

import Link from "next/link";

import {
  ANALYSIS_CHAMBER_ROUTES,
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";
import type { AnalysisChamberRouteKey } from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

// Keyframes injected once — idle glow pulse (composited via filter) + stripe reveal
const RAIL_KEYFRAMES = `
  @keyframes railGlowPulse {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(209,172,103,0.40)); }
    50%       { filter: drop-shadow(0 0 9px rgba(209,172,103,0.80)); }
  }
  @keyframes stripeReveal {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-rail-glow] { animation: none !important; }
    [data-rail-stripe] { animation: none !important; }
  }
`;

export const AnalysisChamberRouteRail = ({
  memberId,
  activeRoute,
}: {
  memberId: string;
  activeRoute: AnalysisChamberRouteKey;
}) => {
  return (
    <>
      <style>{RAIL_KEYFRAMES}</style>
      <nav
        aria-label="Analysis chamber routes"
        className="relative z-20 flex h-full w-full flex-col items-center gap-1 overflow-visible border-r py-4"
        style={{
          background: MEDIEVAL_THEME.gradients.rail,
          borderColor: "rgba(161, 119, 55, 0.35)",
        }}
      >
        {/* Ambient vertical track */}
        <div
          className="pointer-events-none absolute bottom-4 top-4 w-px"
          style={{ background: "rgba(209,172,103,0.10)" }}
        />

        {ANALYSIS_CHAMBER_ROUTES.map((route, index) => {
          const isActive = route.key === activeRoute;

          return (
            <div key={route.key} className="flex w-full flex-col items-center">
              <Link
                aria-current={isActive ? "page" : undefined}
                href={buildAnalysisChamberRouteHref(memberId, route.key)}
                className="group relative flex w-full flex-col items-center gap-1 px-1 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={
                  {
                    "--tw-ring-color": palette.gold,
                    "--tw-ring-offset-color": "rgba(21,9,10,0.98)",
                  } as React.CSSProperties
                }
              >
                {/* Active left-border accent stripe */}
                {isActive ? (
                  <span
                    data-rail-stripe
                    className="pointer-events-none absolute inset-y-0 left-0 w-0.75 rounded-r-full"
                    style={{
                      background: `linear-gradient(180deg, ${palette.gold}00 0%, ${palette.gold} 40%, ${palette.gold} 60%, ${palette.gold}00 100%)`,
                      transformOrigin: "center",
                      animation:
                        "stripeReveal 320ms cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                  />
                ) : null}

                {/* Active background plate */}
                {isActive ? (
                  <span
                    className="pointer-events-none absolute inset-x-1.5 inset-y-0.5 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(209,172,103,0.14), rgba(209,172,103,0.07))",
                      border: "1px solid rgba(209,172,103,0.22)",
                    }}
                  />
                ) : null}

                {/* Sigil icon */}
                <span
                  data-rail-glow={isActive ? "true" : undefined}
                  aria-hidden="true"
                  className="relative z-10 select-none text-xl leading-none transition-transform duration-200 group-hover:scale-110"
                  style={{
                    color: isActive ? palette.ink : palette.inkMuted,
                    filter: isActive
                      ? "drop-shadow(0 0 6px rgba(209,172,103,0.65))"
                      : "none",
                    animation: isActive
                      ? "railGlowPulse 3.8s ease-in-out 2"
                      : "none",
                    transition: "color 200ms ease, filter 200ms ease",
                  }}
                >
                  {route.artifactSymbol}
                </span>

                {/* Persistent short label */}
                <span
                  className="relative z-10 select-none font-display text-[8px] uppercase tracking-[0.14em] leading-none transition-colors duration-200"
                  style={{
                    color: isActive ? palette.ink : "rgba(159,144,118,0.55)",
                  }}
                >
                  {route.shortLabel}
                </span>

                {/* Hover tooltip — fades in, positioned right of rail */}
                <span
                  className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-sm px-2.5 py-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{
                    background: "rgba(18,10,6,0.96)",
                    border: "1px solid rgba(161,119,55,0.35)",
                    color: palette.inkSoft,
                    fontSize: 10,
                    fontFamily: "inherit",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  }}
                >
                  {route.label}
                  <span style={{ color: palette.inkMuted, marginLeft: 6 }}>
                    · {route.artifact}
                  </span>
                </span>
              </Link>

              {/* Divider between items */}
              {index < ANALYSIS_CHAMBER_ROUTES.length - 1 ? (
                <div
                  className="my-0.5 h-px w-8"
                  style={{ background: "rgba(209,172,103,0.12)" }}
                />
              ) : null}
            </div>
          );
        })}
      </nav>
    </>
  );
};
