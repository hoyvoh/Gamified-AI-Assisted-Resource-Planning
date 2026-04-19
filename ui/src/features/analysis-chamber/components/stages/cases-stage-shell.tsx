"use client";

import { useMemo } from "react";
import Link from "next/link";

import type { ChamberCaseResponse } from "@/features/analysis-chamber/api/analysis-chamber-api.types";
import { useAnalysisChamberCasesData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";

/** CASE-01, CASE-02… short archive reference */
const formatCaseRef = (index: number) =>
  `CASE-${String(index + 1).padStart(2, "0")}`;

const getImpactTone = (impactLevel: string | null) => {
  if (!impactLevel)
    return { color: palette.inkMuted, border: "rgba(138,112,88,0.35)" };
  const l = impactLevel.toLowerCase();
  if (l.includes("high") || l.includes("critical"))
    return { color: palette.crimsonLight, border: `${palette.crimson}55` };
  if (l.includes("medium") || l.includes("moderate"))
    return { color: palette.ember, border: `${palette.ember}55` };
  return { color: palette.inkSoft, border: "rgba(154,171,184,0.35)" };
};

export const CasesStageShell = ({ memberId }: { memberId: string }) => {
  const cases = useAnalysisChamberCasesData(memberId);
  const { state, updateQuery } = useAnalysisChamberRouteState();
  const caseList = cases.data?.cases ?? [];
  const selectedCase = useMemo(
    () =>
      caseList.find((entry) => entry.case_id === state.caseId) ??
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
            borderColor: "rgba(200,150,30,0.25)",
            background:
              "linear-gradient(180deg, rgba(200,150,30,0.08), rgba(200,150,30,0.03))",
          }}
        >
          <div
            className="grid grid-cols-[80px_1fr_120px] border-b px-4 py-3 text-[10px] uppercase tracking-[0.16em]"
            style={{ borderColor: "rgba(200,150,30,0.2)", color: palette.gold }}
          >
            <span>Ref</span>
            <span>Case</span>
            <span>Impact</span>
          </div>

          <div className="divide-y divide-[rgba(200,150,30,0.10)]">
            {caseList.length > 0 ? (
              caseList.slice(0, 8).map((entry, index) => {
                const isSelected = selectedCase?.case_id === entry.case_id;
                const impactTone = getImpactTone(entry.impact_level);

                return (
                  <button
                    key={entry.case_id}
                    className="grid w-full grid-cols-[80px_1fr_120px] gap-3 px-4 py-4 text-left"
                    onClick={() =>
                      updateQuery({
                        caseId: entry.case_id,
                        highlight: entry.case_id,
                      })
                    }
                    style={{
                      background: isSelected
                        ? "linear-gradient(90deg, rgba(200,150,30,0.22) 0%, rgba(200,150,30,0.08) 100%)"
                        : "rgba(255,255,255,0.02)",
                      borderLeftWidth: "3px",
                      borderLeftColor: isSelected
                        ? palette.gold
                        : "transparent",
                      opacity: isSelected ? 1 : 0.65,
                      transition: "all 160ms ease",
                      boxShadow: isSelected
                        ? "0 4px 20px rgba(200,150,30,0.14)"
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
                          style={{ color: palette.inkMuted }}
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
                      {entry.impact_level ?? "—"}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="flex min-h-55 flex-col items-center justify-center gap-2 px-6 text-center">
                <p
                  className="font-display text-2xl"
                  style={{ color: "rgba(200,150,30,0.2)" }}
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
                  style={{ color: "rgba(138,112,88,0.5)" }}
                >
                  No cases have been recorded for this analysis period.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open record panel */}
      <aside
        className="border-t px-6 py-6 lg:border-l lg:border-t-0"
        style={{
          background: palette.parchmentMid,
          borderColor: "rgba(200,150,30,0.35)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.28)",
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
                borderColor: "rgba(200,150,30,0.22)",
                background:
                  "radial-gradient(circle, rgba(200,150,30,0.10), transparent 70%)",
              }}
            >
              <span
                className="text-2xl"
                style={{ color: "rgba(200,150,30,0.35)" }}
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
                style={{ color: "rgba(138,112,88,0.45)" }}
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
  entry: ChamberCaseResponse;
}) => {
  const impactTone = getImpactTone(entry.impact_level);
  const sections = [
    { label: "Observed pattern", value: entry.observed_pattern },
    { label: "Better alternative", value: entry.better_alternative },
    { label: "Next-time guidance", value: entry.next_time_guidance },
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
              borderColor: "rgba(200,150,30,0.4)",
              color: palette.gold,
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
                borderColor: "rgba(200,150,30,0.35)",
                color: palette.inkSoft,
              }}
            >
              {entry.category}
            </span>
          ) : null}
          {entry.impact_level ? (
            <span
              className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest"
              style={{
                borderColor: impactTone.border,
                color: impactTone.color,
              }}
            >
              {entry.impact_level}
            </span>
          ) : null}
        </div>
      </div>

      {/* Why it matters — primary reading */}
      {(entry.why_it_matters ?? entry.summary) ? (
        <div
          className="mt-5 rounded-xl border px-4 py-4"
          style={{
            borderColor: "rgba(200,150,30,0.28)",
            background:
              "linear-gradient(180deg, rgba(200,150,30,0.12), rgba(200,150,30,0.05))",
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          }}
        >
          {entry.why_it_matters ? (
            <p
              className="text-[10px] uppercase tracking-[0.16em]"
              style={{ color: palette.gold }}
            >
              Why it matters
            </p>
          ) : null}
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: palette.inkSoft }}
          >
            {entry.why_it_matters ?? entry.summary}
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
                borderColor: "rgba(200,150,30,0.2)",
                background: "rgba(255,255,255,0.05)",
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
                style={{ color: palette.inkSoft }}
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
                  borderColor: "rgba(200,150,30,0.12)",
                  background: "rgba(255,255,255,0.03)",
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
                  style={{ color: "rgba(138,112,88,0.5)" }}
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
        href={buildAnalysisChamberRouteHref(memberId, "journey", {
          milestone: entry.case_id.toLowerCase(),
        })}
        style={{ borderColor: palette.azure, color: palette.azure }}
      >
        <span>🗺</span>
        <span>Follow to journey context</span>
      </Link>
    </>
  );
};
