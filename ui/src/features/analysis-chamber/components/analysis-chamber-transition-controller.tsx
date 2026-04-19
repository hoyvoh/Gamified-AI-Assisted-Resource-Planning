"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { useAnalysisChamberTransition } from "@/features/analysis-chamber/hooks/use-analysis-chamber-transition";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

export const AnalysisChamberTransitionController = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pathname = usePathname();
  const transition = useAnalysisChamberTransition();

  const overlayBackground =
    transition.direction === "forward"
      ? `linear-gradient(90deg, ${palette.gold}10 0%, transparent 35%)`
      : transition.direction === "backward"
        ? `linear-gradient(270deg, ${palette.azure}10 0%, transparent 35%)`
        : `linear-gradient(180deg, ${palette.gold}12 0%, transparent 100%)`;

  return (
    <div
      className="relative h-full"
      data-route-path={pathname}
      data-transition-direction={transition.direction}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-24"
        style={{
          background: overlayBackground,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
