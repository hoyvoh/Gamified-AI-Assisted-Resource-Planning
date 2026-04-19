"use client";

import { useCallback } from "react";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

// Short display labels per category axis

const CATEGORY_SHORT: Record<string, string> = {
  core_technical_execution: "Core Tech",

  technical_depth_breadth: "Tech Depth",

  engineering_mindset: "Eng. Mindset",

  collaboration_growth: "Collab & Growth",
};

export interface RadarEntry {
  categoryId: string;

  score: number;

  fullMark: number;
}

export interface RadarAccentEntry {
  color: string;

  border: string;

  glow: string;
}

export interface CompetencyRadarChartProps {
  entries: RadarEntry[];

  focusCategoryId: string | null;

  accentMap: Record<string, RadarAccentEntry>;

  onSelectCategory: (categoryId: string) => void;

  inkColor: string;

  inkMuted: string;

  goldColor: string;
}

// Unique gradient ID to avoid collision if multiple charts render

const FILL_GRADIENT_ID = "competency-radar-area-fill";

export function CompetencyRadarChart({
  entries,

  focusCategoryId,

  accentMap,

  onSelectCategory,

  inkColor,

  inkMuted,

  goldColor,
}: CompetencyRadarChartProps) {
  const focusAccent = focusCategoryId
    ? (accentMap[focusCategoryId] ?? null)
    : null;

  const fillColor = focusAccent?.color ?? goldColor;

  const strokeColor = focusAccent?.border ?? goldColor;

  // Custom polar-angle axis tick — clickable category label

  const renderTick = useCallback(
    (props: {
      x?: number;

      y?: number;

      cx?: number;

      payload?: { value: string };
    }) => {
      const { x = 0, y = 0, cx = 0, payload } = props;
      const categoryId = payload?.value ?? "";
      const isActive = categoryId === focusCategoryId;
      const accent = accentMap[categoryId];
      const textColor = isActive ? (accent?.color ?? goldColor) : inkColor;
      const label = CATEGORY_SHORT[categoryId] ?? categoryId;

      // Determine text-anchor by horizontal position relative to center

      const relX = x - cx;

      const textAnchor =
        Math.abs(relX) < 12 ? "middle" : relX > 0 ? "start" : "end";

      // Offset so label doesn't overlap the grid boundary

      const offsetX = relX > 12 ? 6 : relX < -12 ? -6 : 0;

      return (
        <g
          key={categoryId}
          onClick={() => onSelectCategory(categoryId)}
          style={{ cursor: "pointer" }}
        >
          {/* Active indicator dot */}
          {isActive && (
            <circle
              cx={x + offsetX + (relX > 12 ? -10 : relX < -12 ? 10 : 0)}
              cy={y}
              r={3}
              fill={textColor}
              fillOpacity={0.9}
            />
          )}
          <text
            x={x + offsetX}
            y={y}
            dy="0.35em"
            textAnchor={textAnchor}
            fill={textColor}
            fontSize={11}
            letterSpacing={1.2}
            style={{ textTransform: "uppercase", fontFamily: "inherit" }}
            fontWeight={isActive ? 600 : 400}
          >
            {label}
          </text>
        </g>
      );
    },

    [focusCategoryId, accentMap, onSelectCategory, goldColor, inkMuted],
  );

  // Custom dot renderer — per-category accent color

  const renderDot = useCallback(
    (props: {
      cx?: number;

      cy?: number;

      index?: number;

      payload?: { categoryId: string; score: number };
    }) => {
      const { cx = 0, cy = 0, payload } = props;

      const categoryId = payload?.categoryId ?? "";

      const score = payload?.score ?? 0;

      const isActive = categoryId === focusCategoryId;

      const accent = accentMap[categoryId];

      const dotColor = accent?.color ?? goldColor;

      if (score === 0) {
        // Ghost dot for zero values

        return (
          <circle
            key={`dot-zero-${categoryId}`}
            cx={cx}
            cy={cy}
            r={3}
            fill={dotColor}
            fillOpacity={0.25}
            stroke="none"
          />
        );
      }

      return (
        <circle
          key={`dot-${categoryId}`}
          cx={cx}
          cy={cy}
          r={isActive ? 6 : 4}
          fill={dotColor}
          fillOpacity={0.92}
          stroke={isActive ? "rgba(255,255,255,0.45)" : "transparent"}
          strokeWidth={1.5}
          style={{ cursor: "pointer" }}
          onClick={() => onSelectCategory(categoryId)}
        />
      );
    },

    [focusCategoryId, accentMap, onSelectCategory, goldColor],
  );

  if (entries.length === 0) {
    return (
      <div
        className="flex h-48 items-center justify-center text-sm"
        style={{ color: inkMuted }}
      >
        No category data available yet.
      </div>
    );
  }

  return (
    <div
      className="mt-5 w-full"
      style={{ height: 470 }}
      role="img"
      aria-label="Competency radar chart showing category scores"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={entries}
          outerRadius="88%"
          startAngle={90}
          endAngle={-270}
          margin={{ top: 24, right: 96, bottom: 24, left: 96 }}
        >
          <defs>
            <radialGradient id={FILL_GRADIENT_ID} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.52} />
              <stop offset="70%" stopColor={fillColor} stopOpacity={0.18} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0.04} />
            </radialGradient>
          </defs>

          {/* Concentric polygon grid */}
          <PolarGrid
            stroke="rgba(255,184,77,0.18)"
            strokeWidth={0.8}
            gridType="polygon"
          />

          <PolarRadiusAxis
            angle={0}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickCount={5}
            tick={{
              fill: "rgba(255,232,192,0.36)",
              fontSize: 10,
              letterSpacing: 0,
            }}
          />

          {/* Axis labels — clickable category names */}
          <PolarAngleAxis
            dataKey="categoryId"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any

            tick={renderTick as any}
            tickLine={false}
            axisLine={false}
          />

          {/* Radar area shape */}
          <Radar
            dataKey="score"
            fill={`url(#${FILL_GRADIENT_ID})`}
            fillOpacity={1}
            stroke={strokeColor}
            strokeWidth={1.8}
            strokeOpacity={0.9}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={renderDot as any}
            activeDot={false}
            isAnimationActive
            animationBegin={120}
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
