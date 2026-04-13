"use client";

import {
  CONTRAST,
  DOSSIER_COLORS,
  TYPO,
  DOSSIER_TABS,
} from "@/features/dossier/constants/dossier.constants";
import type { DossierTab } from "@/features/dossier/types/dossier.types";

interface DossierTabsProps {
  activeTab: DossierTab;
  onTabChange: (tab: DossierTab) => void;
}

export const DossierTabs = ({ activeTab, onTabChange }: DossierTabsProps) => {
  return (
    <div
      aria-label="Dossier sections"
      className="flex flex-wrap gap-1.5 rounded-full border p-1.5 backdrop-blur-[15px]"
      role="tablist"
      style={{
        borderColor: DOSSIER_COLORS.panelBorder,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
        boxShadow: `0 18px 44px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {DOSSIER_TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            aria-selected={isActive}
            key={tab.id}
            className="rounded-full border px-3 py-1.5 font-medium uppercase transition duration-300"
            role="tab"
            style={{
              fontSize: TYPO.tab.fontSize,
              lineHeight: TYPO.tab.lineHeight,
              letterSpacing: TYPO.tab.letterSpacing,
              borderColor: isActive
                ? `${CONTRAST.primaryBright}66`
                : "rgba(255,255,255,0.08)",
              color: isActive ? CONTRAST.primaryBright : CONTRAST.textSecondary,
              background: isActive
                ? "linear-gradient(180deg, rgba(9, 27, 38, 0.92), rgba(7, 16, 26, 0.88))"
                : "rgba(255,255,255,0.03)",
              boxShadow: isActive
                ? `0 0 24px ${DOSSIER_COLORS.panelGlow}, inset 0 0 0 1px rgba(122,230,255,0.08)`
                : "none",
            }}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
