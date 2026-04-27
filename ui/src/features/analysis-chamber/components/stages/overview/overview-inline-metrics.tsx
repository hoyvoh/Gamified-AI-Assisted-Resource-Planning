"use client";

import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

interface OverviewInlineMetricsProps {
  activeDimensionCount: number;
  confidenceLabel: string;
  outsideCoverageCount: number;
}

interface InlineMetric {
  label: string;
  tone: "primary" | "muted";
}

export const OverviewInlineMetrics = ({
  activeDimensionCount,
  confidenceLabel,
  outsideCoverageCount,
}: OverviewInlineMetricsProps) => {
  const metrics: InlineMetric[] = [
    { label: confidenceLabel, tone: "primary" },
    { label: `${activeDimensionCount} active dimensions`, tone: "muted" },
    { label: `${outsideCoverageCount} outside coverage`, tone: "muted" },
  ];

  return (
    <div
      aria-label="Overview metrics"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-[10px] uppercase tracking-[0.16em] md:text-[11px]"
      style={{ color: palette.inkMuted }}
    >
      {metrics.map((metric, index) => (
        <div key={metric.label} className="flex items-center gap-3">
          {index > 0 ? (
            <span
              aria-hidden="true"
              style={{ color: "rgba(255,232,192,0.34)" }}
            >
              /
            </span>
          ) : null}
          <span
            style={{
              color:
                metric.tone === "primary" ? palette.gold : palette.inkMuted,
            }}
          >
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
};
