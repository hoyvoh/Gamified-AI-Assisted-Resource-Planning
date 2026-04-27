"use client";

import { useState } from "react";
import { ChevronDown, Flag } from "lucide-react";

import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

interface OverviewFairnessBannerProps {
  notes: string[];
}

export const OverviewFairnessBanner = ({
  notes,
}: OverviewFairnessBannerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const noteCount = notes.length;

  return (
    <section
      className="mt-8 border-t pt-5"
      style={{
        borderColor: "rgba(255,232,192,0.08)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="flex min-w-0 items-center gap-2 font-display text-[10px] uppercase tracking-[0.16em] md:text-[11px]"
          style={{ color: palette.inkMuted }}
        >
          <Flag aria-hidden="true" className="shrink-0" size={14} />
          <span>
            Coverage notes:{" "}
            <span
              style={{ color: noteCount > 0 ? palette.gold : palette.inkSoft }}
            >
              {noteCount === 0
                ? "No caveats affecting confidence"
                : `${noteCount} caveats affecting confidence`}
            </span>
          </span>
        </p>

        {noteCount > 0 ? (
          <button
            aria-expanded={isExpanded}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-2 font-display text-[10px] uppercase tracking-[0.16em] transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => setIsExpanded((current) => !current)}
            style={{
              borderColor: "rgba(200,150,30,0.18)",
              color: palette.gold,
              background: "rgba(255,255,255,0.025)",
            }}
            type="button"
          >
            {isExpanded ? "Hide" : "View"}
            <ChevronDown
              aria-hidden="true"
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              size={14}
            />
          </button>
        ) : null}
      </div>

      {isExpanded && noteCount > 0 ? (
        <div className="mt-4 space-y-2">
          {notes.map((note) => (
            <p
              key={note}
              className="font-body-serif text-xs leading-5"
              style={{ color: palette.inkSoft }}
            >
              {note}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
};
