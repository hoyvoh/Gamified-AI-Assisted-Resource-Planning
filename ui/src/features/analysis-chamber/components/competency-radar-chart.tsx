"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type BaseTickContentProps,
  type DotItemDotProps,
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

const BASE_AURA_GRADIENT_ID = "competency-radar-base-aura";

const NODE_GLOW_FILTER_ID = "competency-radar-node-glow";

const ACTIVE_NODE_GLOW_FILTER_ID = "competency-radar-active-node-glow";

const CORE_SIGIL_GRADIENT_ID = "competency-radar-core-sigil";

const HOVER_PREVIEW_DELAY_MS = 500;

const toNumber = (value: number | string | undefined): number =>
  Number(value ?? 0) || 0;

type PolarTickContentProps = BaseTickContentProps & {
  cx?: number | string;
  cy?: number | string;
};

export function CompetencyRadarChart({
  entries,

  focusCategoryId,

  accentMap,

  onSelectCategory,

  inkColor,

  inkMuted,

  goldColor,
}: CompetencyRadarChartProps) {
  const [previewCategoryId, setPreviewCategoryId] = useState<string | null>(
    null,
  );
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPreviewTimer = useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  }, []);

  const schedulePreviewCategory = useCallback(
    (categoryId: string) => {
      clearPreviewTimer();
      previewTimerRef.current = setTimeout(() => {
        setPreviewCategoryId(categoryId);
        previewTimerRef.current = null;
      }, HOVER_PREVIEW_DELAY_MS);
    },
    [clearPreviewTimer],
  );

  const clearPreviewCategory = useCallback(() => {
    clearPreviewTimer();
    setPreviewCategoryId(null);
  }, [clearPreviewTimer]);

  useEffect(() => clearPreviewTimer, [clearPreviewTimer]);

  const activeCategoryId = previewCategoryId ?? focusCategoryId;

  const focusAccent = activeCategoryId
    ? (accentMap[activeCategoryId] ?? null)
    : null;

  const fillColor = focusAccent?.color ?? goldColor;

  const strokeColor = focusAccent?.border ?? goldColor;

  const hasActiveCategory = useMemo(
    () => entries.some((entry) => entry.categoryId === activeCategoryId),
    [activeCategoryId, entries],
  );

  // Custom polar-angle axis tick — clickable category label

  const renderTick = useCallback(
    (props: BaseTickContentProps) => {
      const polarProps = props as PolarTickContentProps;
      const x = toNumber(props.x);
      const y = toNumber(props.y);
      const cx = toNumber(polarProps.cx);
      const cy = toNumber(polarProps.cy);
      const categoryId = String(props.payload?.value ?? "");
      const isActive = categoryId === activeCategoryId;
      const accent = accentMap[categoryId];
      const textColor = isActive ? (accent?.color ?? goldColor) : inkColor;
      const label = CATEGORY_SHORT[categoryId] ?? categoryId;

      // Determine text-anchor by horizontal position relative to center

      const relX = x - cx;

      const textAnchor =
        Math.abs(relX) < 12 ? "middle" : relX > 0 ? "start" : "end";

      // Offset so label doesn't overlap the grid boundary

      const offsetX = relX > 12 ? 6 : relX < -12 ? -6 : 0;

      // Compute line endpoint at the score dot position (not at the text label).
      // Recharts places the tick label at outerRadius + ~5px from center.
      // We stop the line at score/fullMark fraction of the outer radius boundary.
      const dx = x - cx;
      const dy = y - cy;
      const distToLabel = Math.sqrt(dx * dx + dy * dy);
      const TICK_PADDING = 5;
      const outerRadiusPx = Math.max(distToLabel - TICK_PADDING, 0);
      const entry = entries.find((e) => e.categoryId === categoryId);
      const scoreFraction = entry ? Math.min(Math.max(entry.score / entry.fullMark, 0), 1) : 1;
      const dotX = cx + (dx / distToLabel) * outerRadiusPx * scoreFraction;
      const dotY = cy + (dy / distToLabel) * outerRadiusPx * scoreFraction;

      return (
        <g
          key={categoryId}
          onClick={() => onSelectCategory(categoryId)}
          onMouseEnter={() => schedulePreviewCategory(categoryId)}
          onMouseLeave={clearPreviewCategory}
          style={{ cursor: "pointer", transition: "opacity 0.4s ease-in-out" }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={dotX}
            y2={dotY}
            stroke={accent?.border ?? goldColor}
            strokeDasharray={isActive ? "0" : "3 9"}
            strokeLinecap="round"
            strokeOpacity={isActive ? 0.42 : 0.1}
            strokeWidth={isActive ? 1.2 : 0.8}
            style={{ transition: "stroke-opacity 0.4s ease-in-out, stroke-width 0.4s ease-in-out" }}
          />
          {isActive && (
            <line
              x1={cx}
              y1={cy}
              x2={dotX}
              y2={dotY}
              stroke={accent?.color ?? goldColor}
              strokeLinecap="round"
              strokeOpacity={0.26}
              strokeWidth={4}
              style={{ transition: "stroke-opacity 0.4s ease-in-out" }}
            />
          )}
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
          {categoryId === entries[0]?.categoryId ? (
            <g aria-hidden="true">
              <circle
                cx={cx}
                cy={cy}
                r={18}
                fill={`url(#${CORE_SIGIL_GRADIENT_ID})`}
                stroke={strokeColor}
                strokeOpacity={0.5}
                strokeWidth={0.8}
              />
              <path
                d={`M ${cx} ${cy - 9} L ${cx + 9} ${cy} L ${cx} ${
                  cy + 9
                } L ${cx - 9} ${cy} Z`}
                fill="none"
                stroke={strokeColor}
                strokeOpacity={0.72}
                strokeWidth={1.1}
              />
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={strokeColor}
                fillOpacity={0.78}
              />
            </g>
          ) : null}
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

    [
      activeCategoryId,
      accentMap,
      clearPreviewCategory,
      onSelectCategory,
      goldColor,
      inkColor,
      entries,
      schedulePreviewCategory,
      strokeColor,
    ],
  );

  // Custom dot renderer — per-category accent color

  const renderDot = useCallback(
    (props: DotItemDotProps) => {
      const cx = toNumber(props.cx);
      const cy = toNumber(props.cy);
      const payload = props.payload as Partial<RadarEntry> | undefined;

      const categoryId = payload?.categoryId ?? "";

      const score = payload?.score ?? 0;

      const isActive = categoryId === activeCategoryId;

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
            onMouseEnter={() => schedulePreviewCategory(categoryId)}
            onMouseLeave={clearPreviewCategory}
            style={{ cursor: "pointer" }}
            onClick={() => onSelectCategory(categoryId)}
          />
        );
      }

      return (
        <g
          key={`dot-${categoryId}`}
          onClick={() => onSelectCategory(categoryId)}
          onMouseEnter={() => schedulePreviewCategory(categoryId)}
          onMouseLeave={clearPreviewCategory}
          style={{ cursor: "pointer" }}
        >
          {isActive ? (
            <>
              <circle
                cx={cx}
                cy={cy}
                r={14}
                fill="none"
                stroke={dotColor}
                strokeOpacity={0.22}
                strokeWidth={1.4}
              >
                <animate
                  attributeName="r"
                  dur="4.8s"
                  repeatCount="indefinite"
                  values="9;17;9"
                />
                <animate
                  attributeName="stroke-opacity"
                  dur="4.8s"
                  repeatCount="indefinite"
                  values="0.08;0.34;0.08"
                />
              </circle>
              <circle
                cx={cx}
                cy={cy}
                r={7}
                fill={dotColor}
                fillOpacity={0.18}
                filter={`url(#${ACTIVE_NODE_GLOW_FILTER_ID})`}
              />
            </>
          ) : null}
          <circle
            cx={cx}
            cy={cy}
            r={isActive ? 5.5 : 4}
            fill={dotColor}
            fillOpacity={isActive ? 1 : 0.82}
            filter={`url(#${
              isActive ? ACTIVE_NODE_GLOW_FILTER_ID : NODE_GLOW_FILTER_ID
            })`}
            stroke={isActive ? "rgba(255,255,255,0.55)" : "transparent"}
            strokeWidth={1.5}
          />
        </g>
      );
    },

    [
      activeCategoryId,
      accentMap,
      clearPreviewCategory,
      onSelectCategory,
      goldColor,
      schedulePreviewCategory,
    ],
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
      className="mt-5 w-full focus:outline-none focus-visible:outline-none [&_*]:outline-none"
      onMouseDown={(event) => event.preventDefault()}
      style={{ height: 470, outline: "none" }}
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
            <style>
              {`
                @media (prefers-reduced-motion: reduce) {
                  .competency-radar-breathing {
                    animation: none;
                  }
                }

                .competency-radar-breathing {
                  animation: competencyRadarBreath 5.6s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: center;
                }

                @keyframes competencyRadarBreath {
                  0%, 100% { opacity: 0.78; }
                  50% { opacity: 1; }
                }
              `}
            </style>
            <radialGradient id={FILL_GRADIENT_ID} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.6} />
              <stop offset="72%" stopColor={fillColor} stopOpacity={0.22} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0.05} />
            </radialGradient>
            <radialGradient
              id={BASE_AURA_GRADIENT_ID}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={goldColor} stopOpacity={0.28} />
              <stop offset="72%" stopColor={goldColor} stopOpacity={0.1} />
              <stop offset="100%" stopColor={goldColor} stopOpacity={0.02} />
            </radialGradient>
            <radialGradient
              id={CORE_SIGIL_GRADIENT_ID}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.34} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.04} />
            </radialGradient>
            <filter
              id={NODE_GLOW_FILTER_ID}
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id={ACTIVE_NODE_GLOW_FILTER_ID}
              x="-120%"
              y="-120%"
              width="340%"
              height="340%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
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
            tick={renderTick}
            tickLine={false}
            axisLine={false}
          />

          {/* Radar area shape */}
          <Radar
            className="competency-radar-breathing"
            dataKey="fullMark"
            fill={`url(#${BASE_AURA_GRADIENT_ID})`}
            fillOpacity={0.32}
            stroke={goldColor}
            strokeDasharray="2 10"
            strokeOpacity={0.24}
            strokeWidth={0.8}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          <Radar
            className={hasActiveCategory ? "competency-radar-breathing" : ""}
            dataKey="score"
            fill={`url(#${FILL_GRADIENT_ID})`}
            fillOpacity={1}
            stroke={strokeColor}
            strokeWidth={1.8}
            strokeOpacity={0.9}
            dot={renderDot}
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
