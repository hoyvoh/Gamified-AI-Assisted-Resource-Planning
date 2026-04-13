"use client";

import {
  CONTRAST,
  DOSSIER_COLORS,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import type { AnalysisStatus } from "@/types/organization";

interface AnalysisLauncherProps {
  analysisStatus: AnalysisStatus;
  onOpenEvidence: () => void;
  onReturnToWarRoom?: () => void;
  onStartScan?: () => void;
  scanReady?: boolean;
  scanStageLabel?: string | null;
}

export const AnalysisLauncher = ({
  analysisStatus,
  onOpenEvidence,
  onReturnToWarRoom,
  onStartScan,
  scanReady = false,
  scanStageLabel,
}: AnalysisLauncherProps) => {
  const scanLabel =
    analysisStatus === "analyzing"
      ? scanStageLabel ?? "Scan Running"
      : "Start Scan";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/6 pt-3">
      {[
        {
          label: "Evidence",
          action: "Open Evidence",
          onClick: onOpenEvidence,
        },
        {
          label: "Scan",
          action: scanLabel,
          disabled: !scanReady,
          onClick: onStartScan,
        },
      ].map((item) => (
        <button
          key={item.label}
          className="rounded-full border px-3.5 py-2.5 text-left transition duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 hover:-translate-y-0.5"
          disabled={"disabled" in item ? item.disabled : false}
          style={{
            borderColor: DOSSIER_COLORS.panelBorder,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
          onClick={item.onClick}
          type="button"
        >
          <p
            style={{
              fontSize: TYPO.launcherLabel.fontSize,
              lineHeight: TYPO.launcherLabel.lineHeight,
              letterSpacing: TYPO.launcherLabel.letterSpacing,
              color: CONTRAST.textTertiary,
            }}
          >
            {item.label}
          </p>
          <p
            className="mt-1 font-display uppercase"
            style={{
              fontSize: TYPO.launcherAction.fontSize,
              lineHeight: TYPO.launcherAction.lineHeight,
              letterSpacing: TYPO.launcherAction.letterSpacing,
              color: CONTRAST.textPrimary,
            }}
          >
            {item.action}
          </p>
        </button>
      ))}

      <button
        className="rounded-full border px-3.5 py-2.5 text-left transition duration-300 hover:-translate-y-0.5"
        onClick={onReturnToWarRoom}
        style={{
          borderColor: `${CONTRAST.primaryBright}45`,
          background:
            "linear-gradient(180deg, rgba(63,211,255,0.14), rgba(255,255,255,0.03))",
          boxShadow: `0 0 20px ${DOSSIER_COLORS.panelGlow}`,
        }}
        type="button"
      >
        <p
          style={{
            fontSize: TYPO.launcherLabel.fontSize,
            lineHeight: TYPO.launcherLabel.lineHeight,
            letterSpacing: TYPO.launcherLabel.letterSpacing,
            color: CONTRAST.textTertiary,
          }}
        >
          Navigation
        </p>
        <p
          className="mt-1 font-display uppercase"
          style={{
            fontSize: TYPO.launcherAction.fontSize,
            lineHeight: TYPO.launcherAction.lineHeight,
            letterSpacing: TYPO.launcherAction.letterSpacing,
            color: CONTRAST.signalBright,
          }}
        >
          Return to War Room
        </p>
      </button>
    </div>
  );
};
