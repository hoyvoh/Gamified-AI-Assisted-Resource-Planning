"use client";

import { CharacterStage } from "@/systems/character/character-stage";
import { getStatusColor } from "@/systems/character/character-shared";
import type { AnalysisStatus } from "@/types/organization";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { useEffect, useState } from "react";

const formatConfidenceLabel = (confidence: number) =>
  `${Math.round(Math.max(0, Math.min(confidence, 1)) * 100)}% confidence`;

export const AnalysisChamberHeroIdentityLayer = ({
  confidence,
  memberName,
  roleName,
  status,
}: {
  confidence: number;
  memberName: string;
  roleName: string;
  status: AnalysisStatus;
}) => {
  const accentColor = getStatusColor(status);
  const [canRenderCharacter, setCanRenderCharacter] = useState(false);

  useEffect(() => {
    setCanRenderCharacter(true);
  }, []);

  return (
    <aside
      className="relative hidden min-w-0 border-l xl:flex xl:flex-col"
      style={{
        background:
          "linear-gradient(180deg, rgba(35,26,18,0.92) 0%, rgba(20,10,9,0.98) 100%)",
        borderColor: "rgba(200, 150, 30, 0.35)",
      }}
    >
      {/* Mini avatar strip */}
      <div className="relative px-2.5 pt-4">
        <div
          className="pointer-events-none absolute inset-x-3 top-5 h-16 blur-2xl"
          style={{ background: `${accentColor}18` }}
        />
        <div
          className="relative overflow-hidden rounded-lg border"
          style={{
            borderColor: "rgba(200, 150, 30, 0.3)",
            background:
              "radial-gradient(circle at 50% 30%, rgba(200,140,30,0.10) 0%, transparent 70%)",
          }}
        >
          <div className="relative h-36 overflow-hidden">
            {canRenderCharacter ? (
              <CharacterStage
                accentColor={accentColor}
                confidence={confidence}
                isFocusMode={false}
                stageMode="portrait"
                status={status}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 82%, ${accentColor}24 0%, transparent 42%)`,
                }}
              />
            )}
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(30,21,14,0) 0%, rgba(28,19,12,0.96) 100%)",
            }}
          />
        </div>
      </div>

      {/* Compact identity */}
      <div className="flex flex-1 flex-col px-2.5 pb-5 pt-3">
        <div className="text-center">
          <p
            className="font-display text-[10px] uppercase leading-snug tracking-[0.14em]"
            style={{ color: palette.ink }}
          >
            {memberName}
          </p>
          <p
            className="mt-0.5 text-[11px] italic"
            style={{ color: palette.inkMuted }}
          >
            {roleName}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {/* Status — dot + text, not a chip (chip budget already spent on top bar) */}
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: accentColor }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.12em]"
              style={{ color: palette.inkSoft }}
            >
              {status}
            </span>
          </div>
          {/* Confidence chip */}
          <span
            className="self-start rounded-md border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]"
            style={{
              borderColor: "rgba(200, 150, 30, 0.4)",
              color: palette.inkSoft,
            }}
          >
            {formatConfidenceLabel(confidence)}
          </span>
        </div>
      </div>
    </aside>
  );
};
