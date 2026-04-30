import type { ReactNode } from "react";

import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

export const AnalysisChamberFrame = ({ children }: { children: ReactNode }) => (
  <div
    className="relative min-h-screen overflow-hidden px-2 py-2 md:px-4 md:py-4"
    style={{
      backgroundColor: MEDIEVAL_THEME.backgrounds.pageBase,
      backgroundImage: MEDIEVAL_THEME.gradients.shellFrame,
    }}
  >
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-44"
      style={{ background: MEDIEVAL_THEME.gradients.shellOverlay }}
    />
    <div
      className="relative mx-auto min-h-[calc(100vh-16px)] max-w-[1720px] overflow-hidden rounded-[18px] border md:min-h-[calc(100vh-32px)]"
      style={{
        background: MEDIEVAL_THEME.gradients.shell,
        borderColor: MEDIEVAL_THEME.accents.brassBorder,
        boxShadow: palette.shellShadow,
      }}
    >
      <div
        className="pointer-events-none absolute inset-[7px] rounded-xl border"
        style={{ borderColor: MEDIEVAL_THEME.premiumNoir.divider }}
      />
      {children}
    </div>
  </div>
);
