import type { ReactNode } from "react";

import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

export const AnalysisChamberFrame = ({ children }: { children: ReactNode }) => (
  <div
    className="relative min-h-screen overflow-hidden px-2 py-2 md:px-4 md:py-4"
    style={{
      background:
        "radial-gradient(ellipse at 50% 18%, rgba(255,149,0,0.18), transparent 48%), radial-gradient(ellipse at 12% 58%, rgba(42,90,154,0.14), transparent 42%), radial-gradient(ellipse at 88% 70%, rgba(255,122,31,0.10), transparent 44%), linear-gradient(180deg, #1a1410 0%, #120e0a 35%, #0f0c08 100%)",
    }}
  >
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-44"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,149,0,0.12), rgba(255,149,0,0.02) 58%, transparent)",
      }}
    />
    <div
      className="relative mx-auto min-h-[calc(100vh-16px)] max-w-[1720px] overflow-hidden rounded-[18px] border md:min-h-[calc(100vh-32px)]"
      style={{
        background: palette.parchment,
        borderColor: `${palette.gold}80`,
        boxShadow: palette.shellShadow,
      }}
    >
      <div
        className="pointer-events-none absolute inset-[7px] rounded-xl border"
        style={{ borderColor: "rgba(120, 90, 30, 0.3)" }}
      />
      {children}
    </div>
  </div>
);
