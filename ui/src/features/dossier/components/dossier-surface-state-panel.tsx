"use client";

import {
  CONTRAST,
  DOSSIER_COLORS,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import type {
  DossierSurfaceState,
} from "@/features/dossier/lib/dossier-surface-state";

interface DossierSurfaceStatePanelProps {
  onRetry?: () => void;
  onStartScan?: () => void;
  scanReady?: boolean;
  state: Exclude<DossierSurfaceState, "ready">;
}

const SURFACE_STATE_COPY: Record<
  Exclude<DossierSurfaceState, "ready">,
  {
    description: string;
    eyebrow: string;
    retryLabel?: string;
    scanLabel?: string;
    title: string;
    tone: string;
  }
> = {
  not_analyzed: {
    eyebrow: "Analysis Awaiting Signal",
    title: "No dossier analysis yet",
    description:
      "This operative exists in the system, but no completed analysis has been generated for the current chamber.",
    scanLabel: "Start first scan",
    tone: CONTRAST.primaryGlow,
  },
  not_found: {
    eyebrow: "Analysis Record Missing",
    title: "Dossier output was not found",
    description:
      "The member record loaded successfully, but the requested analysis surface does not exist yet or is no longer available.",
    scanLabel: "Start new scan",
    retryLabel: "Retry surface",
    tone: CONTRAST.warningGlow,
  },
  empty: {
    eyebrow: "Low-Signal Surface",
    title: "Analysis returned too little evidence",
    description:
      "The chamber responded, but there is not enough structured signal yet to populate this deck with meaningful readouts.",
    scanLabel: "Refresh scan",
    retryLabel: "Retry surface",
    tone: CONTRAST.primaryGlow,
  },
  server_error: {
    eyebrow: "System Fault",
    title: "Analysis surface unavailable",
    description:
      "The dossier could not retrieve this analysis surface from the backend. The member is still loaded, but the panel needs another attempt.",
    scanLabel: "Start new scan",
    retryLabel: "Retry fetch",
    tone: CONTRAST.warningGlow,
  },
  failed_run: {
    eyebrow: "Scan Failed",
    title: "Latest analysis run did not complete",
    description:
      "The most recent scan ended in a failed state, so the dossier cannot render a trustworthy readout for this deck yet.",
    scanLabel: "Run scan again",
    tone: CONTRAST.warningGlow,
  },
};

export const DossierSurfaceStatePanel = ({
  onRetry,
  onStartScan,
  scanReady = false,
  state,
}: DossierSurfaceStatePanelProps) => {
  const copy = SURFACE_STATE_COPY[state];

  return (
    <div
      className="rounded-[20px] border px-4 py-4 backdrop-blur-xl"
      style={{
        borderColor: `${copy.tone}35`,
        background:
          "linear-gradient(180deg, rgba(10, 20, 35, 0.86), rgba(7, 14, 22, 0.82))",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 40px rgba(0,0,0,0.18)`,
      }}
    >
      <p
        style={{
          fontSize: TYPO.eyebrow.fontSize,
          lineHeight: TYPO.eyebrow.lineHeight,
          letterSpacing: TYPO.eyebrow.letterSpacing,
          color: copy.tone,
        }}
      >
        {copy.eyebrow}
      </p>
      <h3
        className="mt-2 font-display uppercase"
        style={{
          fontSize: TYPO.sectionTitle.fontSize,
          lineHeight: TYPO.sectionTitle.lineHeight,
          letterSpacing: TYPO.sectionTitle.letterSpacing,
          color: CONTRAST.textPrimary,
        }}
      >
        {copy.title}
      </h3>
      <p
        className="mt-2.5 max-w-2xl"
        style={{
          fontSize: TYPO.bodySm.fontSize,
          lineHeight: TYPO.bodySm.lineHeight,
          color: CONTRAST.textSecondary,
        }}
      >
        {copy.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {copy.retryLabel && onRetry ? (
          <button
            className="rounded-full border px-3.5 py-2 font-display uppercase transition duration-300 hover:-translate-y-0.5"
            onClick={onRetry}
            style={{
              borderColor: DOSSIER_COLORS.panelBorder,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
              color: CONTRAST.textPrimary,
              fontSize: TYPO.launcherAction.fontSize,
              letterSpacing: TYPO.launcherAction.letterSpacing,
              lineHeight: TYPO.launcherAction.lineHeight,
            }}
            type="button"
          >
            {copy.retryLabel}
          </button>
        ) : null}

        {copy.scanLabel && onStartScan ? (
          <button
            className="rounded-full border px-3.5 py-2 font-display uppercase transition duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 hover:-translate-y-0.5"
            disabled={!scanReady}
            onClick={onStartScan}
            style={{
              borderColor: `${copy.tone}45`,
              background: `linear-gradient(180deg, ${copy.tone}20, rgba(255,255,255,0.03))`,
              color: CONTRAST.textPrimary,
              fontSize: TYPO.launcherAction.fontSize,
              letterSpacing: TYPO.launcherAction.letterSpacing,
              lineHeight: TYPO.launcherAction.lineHeight,
            }}
            type="button"
          >
            {copy.scanLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};
