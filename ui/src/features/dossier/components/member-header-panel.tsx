"use client";

import {
  CONTRAST,
  DOSSIER_COPY,
  getStatusMeta,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import type { DossierHeaderViewModel } from "@/features/dossier/types/dossier.types";

interface MemberHeaderPanelProps {
  header: DossierHeaderViewModel;
}

export const MemberHeaderPanel = ({ header }: MemberHeaderPanelProps) => {
  const statusMeta = getStatusMeta(header.status);

  return (
    <header
      className="relative z-20 border-b px-4 py-2 md:px-6 md:py-2.5"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        backgroundColor: "rgba(6, 13, 21, 0.85)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span
            style={{
              fontSize: TYPO.headerEyebrow.fontSize,
              lineHeight: TYPO.headerEyebrow.lineHeight,
              letterSpacing: TYPO.headerEyebrow.letterSpacing,
              color: CONTRAST.textTertiary,
            }}
          >
            {DOSSIER_COPY.title}
          </span>
          <div className="min-w-0">
            <h1
              className="truncate font-display uppercase md:text-lg"
              style={{
                fontSize: TYPO.headerName.fontSize,
                lineHeight: TYPO.headerName.lineHeight,
                letterSpacing: TYPO.headerName.letterSpacing,
                color: CONTRAST.signalBright,
              }}
            >
              {header.memberName}
            </h1>
            <p
              className="mt-0.5 truncate uppercase"
              style={{
                fontSize: TYPO.headerSub.fontSize,
                lineHeight: TYPO.headerSub.lineHeight,
                letterSpacing: TYPO.headerSub.letterSpacing,
                color: CONTRAST.textSecondary,
              }}
            >
              {header.roleName} · {header.teamName}
            </p>
          </div>
        </div>

        <div
          className="rounded-full border px-3 py-1.5"
          style={{
            borderColor: statusMeta.borderColor,
            color: statusMeta.color,
            backgroundColor: statusMeta.backgroundColor,
            boxShadow: `0 0 20px ${statusMeta.glowColor}`,
          }}
        >
          <span
            style={{
              fontSize: TYPO.status.fontSize,
              lineHeight: TYPO.status.lineHeight,
              letterSpacing: TYPO.status.letterSpacing,
            }}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>
    </header>
  );
};
