"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import type { ChamberCase } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

import { useAnalysisChamberCasesData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";

import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";

import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  CASES_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";

const EMPTY_CASES: ChamberCase[] = [];

/** CASE-01, CASE-02… short archive reference */

const formatCaseRef = (index: number) =>
  `CASE-${String(index + 1).padStart(2, "0")}`;

const getImpactTone = (impactLevel: string | null) => {
  if (!impactLevel)
    return { color: palette.inkMuted, border: CASES_TOKENS.impactNeutralBorder };

  const l = impactLevel.toLowerCase();

  if (l.includes("high") || l.includes("critical"))
    return { color: palette.emberLight, border: `${palette.crimson}44` };

  if (l.includes("medium") || l.includes("moderate"))
    return { color: palette.gold, border: `${palette.gold}44` };

  return { color: palette.inkSoft, border: CASES_TOKENS.impactNeutralBorder };
};

export const CasesStageShell = ({ memberId }: { memberId: string }) => {
  const cases = useAnalysisChamberCasesData(memberId);

  const { state, updateQuery } = useAnalysisChamberRouteState();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const caseList = cases.data?.cases ?? EMPTY_CASES;
  const visibleCaseLimit = 8;
  const hasMoreCases = caseList.length > visibleCaseLimit;
  const visibleCases = showAll ? caseList : caseList.slice(0, visibleCaseLimit);

  const selectedCase = useMemo(
    () =>
      caseList.find((entry) => entry.id === state.caseId) ??
      caseList[0] ??
      null,

    [caseList, state.caseId],
  );

  const selectedIndex = selectedCase ? caseList.indexOf(selectedCase) : -1;

  return (
    <section className="grid h-full gap-0 lg:grid-cols-[1fr_384px]">
      {/* Ledger list */}
      <div className="dossier-scroll px-5 py-6 md:px-7">
        <p
          className="font-display text-[10px] uppercase tracking-[0.18em]"
          style={{ color: palette.gold }}
        >
          Archive ledger
        </p>

        {/* Ledger table */}
        <div
          className="mt-6 overflow-hidden rounded-[18px] border"
          style={{
            borderColor: CASES_TOKENS.cardBorderStrong,
            background: CASES_TOKENS.ledgerShell,
            boxShadow: CASES_TOKENS.shellShadow,
          }}
        >
          <div
            className="grid grid-cols-[80px_1fr_120px] border-b px-4 py-3 text-[10px] uppercase tracking-[0.16em]"
            style={{
              borderColor: CASES_TOKENS.ledgerDivider,
              color: palette.gold,
              background: CASES_TOKENS.ledgerHeader,
            }}
          >
            <span>Ref</span>
            <span>Case</span>
            <span>Impact</span>
          </div>

          <div className="divide-y" style={{ borderColor: CASES_TOKENS.ledgerDivider }}>
            {caseList.length > 0 ? (
              visibleCases.map((entry, index) => {
                const isSelected = selectedCase?.id === entry.id;

                const impactTone = getImpactTone(entry.impactLevel);

                const isHovered = hoveredId === entry.id;

                return (
                  <button
                    key={entry.id}
                    className="grid w-full cursor-pointer grid-cols-[80px_1fr_120px] gap-3 px-4 py-4 text-left"
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() =>
                      updateQuery({
                        caseId: entry.id,

                        highlight: entry.id,
                      })
                    }
                    style={{
                      background: isSelected
                        ? CASES_TOKENS.rowSelected
                        : isHovered
                          ? CASES_TOKENS.rowHover
                          : CASES_TOKENS.rowIdle,

                      borderLeftWidth: "3px",

                      borderLeftColor:
                        isSelected || isHovered ? palette.gold : "transparent",

                      opacity: isSelected || isHovered ? 1 : 0.78,

                      transition: "all 160ms ease",

                      boxShadow: isSelected
                        ? CASES_TOKENS.selectedRowShadow
                        : isHovered
                          ? CASES_TOKENS.hoveredRowShadow
                          : "none",
                    }}
                    type="button"
                  >
                    {/* Archive ref */}
                    <span
                      className="font-display text-[11px] uppercase tracking-widest"
                      style={{
                        color: isSelected ? palette.gold : palette.inkMuted,
                      }}
                    >
                      {formatCaseRef(index)}
                    </span>

                    {/* Title + truncated summary */}
                    <div>
                      <p
                        className="font-display text-sm uppercase tracking-[0.08em]"
                        style={{
                          color: isSelected ? palette.ink : palette.inkSoft,
                        }}
                      >
                        {entry.title}
                      </p>
                      {entry.summary ? (
                        <p
                          className="mt-1.5 text-xs leading-5"
                          style={{ color: CASES_TOKENS.mutedText }}
                        >
                          {entry.summary.length > 90
                            ? `${entry.summary.slice(0, 90)}…`
                            : entry.summary}
                        </p>
                      ) : null}
                    </div>

                    {/* Impact badge */}
                    <span
                      className="mt-0.5 self-start rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest"
                      style={{
                        borderColor: impactTone.border,

                        color: impactTone.color,
                      }}
                    >
                      {entry.impactLevel ?? "—"}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="flex min-h-55 flex-col items-center justify-center gap-2 px-6 text-center">
                <p
                  className="font-display text-2xl"
                  style={{ color: CASES_TOKENS.emptyIcon }}
                >
                  📖
                </p>
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: palette.inkMuted }}
                >
                  Archive is empty
                </p>
                <p
                  className="mt-1 text-xs leading-5"
                  style={{ color: CASES_TOKENS.pendingText }}
                >
                  No cases have been recorded for this analysis period.
                </p>
              </div>
            )}
          </div>

          {hasMoreCases ? (
            <div
              className="flex items-center justify-between border-t px-4 py-3 text-[10px] uppercase tracking-widest"
              style={{
                borderColor: CASES_TOKENS.ledgerDivider,
                color: palette.inkMuted,
              }}
            >
              <span>
                {showAll
                  ? `Showing ${caseList.length} cases`
                  : `Showing ${visibleCaseLimit} of ${caseList.length}`}
              </span>
              <button
                type="button"
                className="cursor-pointer font-display tracking-[0.14em] hover:brightness-110"
                onClick={() => setShowAll((current) => !current)}
                style={{ color: palette.gold }}
              >
                {showAll
                  ? "Show less"
                  : `Show all (+${caseList.length - visibleCaseLimit})`}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Open record panel */}
      <aside
        className="border-t px-6 py-6 lg:border-l lg:border-t-0"
        style={{
          background: CASES_TOKENS.panelSurface,
          borderColor: CASES_TOKENS.panelBorder,
          boxShadow: CASES_TOKENS.sidePanelShadow,
        }}
      >
        {selectedCase ? (
          <OpenRecord
            memberId={memberId}
            caseRef={
              selectedIndex >= 0 ? formatCaseRef(selectedIndex) : "CASE-??"
            }
            entry={selectedCase}
          />
        ) : (
          <div className="flex min-h-75 flex-col items-center justify-center gap-3 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2"
              style={{
                borderColor: CASES_TOKENS.cardBorderStrong,
                background: CASES_TOKENS.emptyHalo,
              }}
            >
              <span
                className="text-2xl"
                style={{ color: CASES_TOKENS.emptyIcon }}
              >
                📖
              </span>
            </div>
            <div>
              <p
                className="font-display text-[10px] uppercase tracking-widest"
                style={{ color: palette.inkMuted }}
              >
                No record open
              </p>
              <p
                className="mt-1 text-xs leading-5"
                style={{ color: CASES_TOKENS.pendingText }}
              >
                Select a case from the ledger.
              </p>
            </div>
          </div>
        )}
      </aside>
    </section>
  );
};

// ─── Open record sub-component ───────────────────────────────────────────────

const OpenRecord = ({
  memberId,

  caseRef,

  entry,
}: {
  memberId: string;

  caseRef: string;

  entry: ChamberCase;
}) => {
  const impactTone = getImpactTone(entry.impactLevel);

  const sections = [
    { label: "Observed pattern", value: entry.observedPattern },

    { label: "Better alternative", value: entry.betterAlternative },

    { label: "Next-time guidance", value: entry.nextTimeGuidance },
  ].filter((s) => s.value !== null && s.value !== undefined);

  return (
    <>
      {/* Record identity header */}
      <div>
        <div className="flex items-center gap-2">
          <p
            className="font-display text-[10px] uppercase tracking-[0.18em]"
            style={{ color: palette.gold }}
          >
            {caseRef}
          </p>
          <span
            className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest"
            style={{
              borderColor: CASES_TOKENS.cardBorderStrong,

              color: palette.gold,
              background: CASES_TOKENS.ledgerHeader,
            }}
          >
            Open record
          </span>
        </div>
        <p
          className="mt-3 font-display text-base uppercase tracking-[0.08em] leading-6"
          style={{ color: palette.ink }}
        >
          {entry.title}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {entry.category ? (
            <span
              className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest"
              style={{
                borderColor: CASES_TOKENS.cardBorder,

                color: CASES_TOKENS.softText,
                background: CASES_TOKENS.ledgerHeader,
              }}
            >
              {entry.category}
            </span>
          ) : null}
          {entry.impactLevel ? (
            <span
              className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest"
              style={{
                borderColor: impactTone.border,

                color: impactTone.color,
              }}
            >
              {entry.impactLevel}
            </span>
          ) : null}
        </div>
      </div>

      {/* Why it matters — primary reading */}
      {(entry.whyItMatters ?? entry.summary) ? (
        <div
          className="mt-5 rounded-xl border px-4 py-4"
          style={{
            borderColor: CASES_TOKENS.cardBorderStrong,
            background: CASES_TOKENS.cardSurfaceStrong,
            boxShadow: CASES_TOKENS.spotlightShadow,
          }}
        >
          {entry.whyItMatters ? (
            <p
              className="text-[10px] uppercase tracking-[0.16em]"
              style={{ color: palette.gold }}
            >
              Why it matters
            </p>
          ) : null}
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: CASES_TOKENS.softText }}
          >
            {entry.whyItMatters ?? entry.summary}
          </p>
        </div>
      ) : null}

      {/* Pattern / alternative / guidance */}
      {sections.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {sections.map((section) => (
            <div
              key={section.label}
              className="rounded-lg border px-4 py-3"
              style={{
                borderColor: CASES_TOKENS.cardBorder,
                background: CASES_TOKENS.cardSurface,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.16em]"
                style={{ color: palette.gold }}
              >
                {section.label}
              </p>
              <p
                className="mt-2 text-sm leading-6"
                style={{ color: CASES_TOKENS.softText }}
              >
                {section.value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {["Observed pattern", "Better alternative", "Next-time guidance"].map(
            (label) => (
              <div
                key={label}
                className="rounded-lg border px-4 py-3"
                style={{
                  borderColor: CASES_TOKENS.cardBorder,
                  background: CASES_TOKENS.cardSurface,
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: palette.inkMuted }}
                >
                  {label}
                </p>
                <p
                  className="mt-2 text-xs italic leading-5"
                  style={{ color: CASES_TOKENS.pendingText }}
                >
                  Pending analysis.
                </p>
              </div>
            ),
          )}
        </div>
      )}

      {/* Journey context link */}
      <Link
        className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-2 font-display text-[10px] uppercase tracking-[0.12em] transition-opacity hover:opacity-80"
        href={buildAnalysisChamberRouteHref(memberId, "journey")}
        style={{
          borderColor: CASES_TOKENS.journeyBorder,
          background: CASES_TOKENS.journeyBg,
          color: CASES_TOKENS.journeyText,
        }}
      >
        <span>🗺</span>
        <span>Follow to journey context</span>
      </Link>
    </>
  );
};
