"use client";

import { useState } from "react";

import {
  CONTRAST,
  DOSSIER_COLORS,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import {
  getCaseSummary,
  getCaseTitle,
} from "@/features/dossier/lib/dossier-contract.helpers";
import type { ProfileCasesResponse } from "@/features/dossier/types/dossier.types";

interface CasesDeckProps {
  data: ProfileCasesResponse;
}

export const CasesDeck = ({ data }: CasesDeckProps) => {
  const [selectedId, setSelectedId] = useState<string>(
    data.cases[0]?.caseId ?? "",
  );
  const selected =
    data.cases.find((item) => item.caseId === selectedId) ?? data.cases[0];

  return (
    <div className="space-y-3.5">
      <section
        className="rounded-[28px] border px-5 py-4 backdrop-blur-xl"
        style={{
          borderColor: DOSSIER_COLORS.panelBorder,
          background:
            "linear-gradient(160deg, rgba(9, 18, 28, 0.94), rgba(7, 13, 22, 0.88))",
        }}
      >
        <p
          style={{
            fontSize: TYPO.eyebrow.fontSize,
            lineHeight: TYPO.eyebrow.lineHeight,
            letterSpacing: TYPO.eyebrow.letterSpacing,
            color: CONTRAST.textTertiary,
          }}
        >
          Field Cases
        </p>
        <h2
          className="mt-2 font-display uppercase md:text-lg"
          style={{
            fontSize: TYPO.sectionTitle.fontSize,
            lineHeight: TYPO.sectionTitle.lineHeight,
            letterSpacing: TYPO.sectionTitle.letterSpacing,
            color: CONTRAST.signalBright,
          }}
        >
          Inspect live evidence chains instead of reading isolated report cards
        </h2>
      </section>

      <section className="grid gap-3 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-2.5">
          {data.cases.map((caseItem) => {
            const isActive = caseItem.caseId === selected?.caseId;

            return (
              <button
                key={caseItem.caseId}
                className="w-full rounded-[22px] border px-4 py-4 text-left transition duration-300"
                style={{
                  borderColor: isActive
                    ? `${CONTRAST.successGlow}50`
                    : DOSSIER_COLORS.panelBorder,
                  background: isActive
                    ? "linear-gradient(180deg, rgba(8, 24, 18, 0.78), rgba(7, 14, 22, 0.84))"
                    : "linear-gradient(180deg, rgba(10, 20, 35, 0.82), rgba(7, 14, 22, 0.8))",
                  boxShadow: isActive
                    ? "0 20px 45px rgba(0, 0, 0, 0.28)"
                    : "none",
                }}
                onClick={() => setSelectedId(caseItem.caseId)}
                type="button"
              >
                <p
                  className="font-display uppercase"
                  style={{
                    fontSize: TYPO.cardTitle.fontSize,
                    lineHeight: TYPO.cardTitle.lineHeight,
                    letterSpacing: TYPO.cardTitle.letterSpacing,
                    color: CONTRAST.textPrimary,
                  }}
                >
                  {getCaseTitle(caseItem)}
                </p>
                <p
                  className="mt-2.5"
                  style={{
                    fontSize: TYPO.cardBody.fontSize,
                    lineHeight: TYPO.cardBody.lineHeight,
                    color: CONTRAST.textSecondary,
                  }}
                >
                  {getCaseSummary(caseItem)}
                </p>
              </button>
            );
          })}
        </div>

        <div
          className="rounded-[26px] border px-5 py-4 backdrop-blur-xl"
          style={{
            borderColor: `${CONTRAST.primaryGlow}35`,
            background:
              "linear-gradient(180deg, rgba(9, 18, 28, 0.92), rgba(7, 14, 22, 0.86))",
          }}
        >
          {selected ? (
            <div className="space-y-4">
              <div>
                <p
                  style={{
                    fontSize: TYPO.eyebrow.fontSize,
                    lineHeight: TYPO.eyebrow.lineHeight,
                    letterSpacing: TYPO.eyebrow.letterSpacing,
                    color: CONTRAST.textTertiary,
                  }}
                >
                  Active Case Surface
                </p>
                <h3
                  className="mt-2 font-display uppercase md:text-lg"
                  style={{
                    fontSize: TYPO.sectionTitle.fontSize,
                    lineHeight: TYPO.sectionTitle.lineHeight,
                    letterSpacing: TYPO.sectionTitle.letterSpacing,
                    color: CONTRAST.signalBright,
                  }}
                >
                  {getCaseTitle(selected)}
                </h3>
              </div>

              {[
                { label: "Why It Matters", value: selected.whyItMatters },
                { label: "Observed Pattern", value: selected.observedPattern },
                {
                  label: "Better Alternative",
                  value: selected.betterAlternative,
                },
                {
                  label: "Next Time Guidance",
                  value: selected.nextTimeGuidance,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border px-4 py-3.5"
                  style={{
                    borderColor: "rgba(255,255,255,0.07)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <p
                    style={{
                      fontSize: TYPO.badge.fontSize,
                      lineHeight: TYPO.badge.lineHeight,
                      letterSpacing: TYPO.badge.letterSpacing,
                      color: CONTRAST.primaryGlow,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="mt-2"
                    style={{
                      fontSize: TYPO.cardBody.fontSize,
                      lineHeight: TYPO.cardBody.lineHeight,
                      color: CONTRAST.textPrimary,
                    }}
                  >
                    {item.value ?? "No detail available"}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};
