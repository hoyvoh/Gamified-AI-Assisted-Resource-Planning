"use client";

import React, { useCallback, useRef, useState } from "react";

import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  BRANCH_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

import { BranchNode } from "./branch-node";
import { BranchDetailModal } from "./branch-detail-modal";
import type { BranchNodeData } from "./branch-node";

export type { BranchNodeData };

export interface BranchLatticeProps {
  branches: BranchNodeData[];
  activeBranchId?: string | null;
  header?: React.ReactNode;
  /** Called when user selects a node — useful to sync outer state if needed */
  onSelectBranch?: (id: string | null) => void;
  hasMeasuredDimensions?: boolean;
}

const LATTICE_KEYFRAMES = `
  @keyframes lineDrawForward {
    from { stroke-dashoffset: var(--seg-len, 300); }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes lineGlowFloat {
    0%, 100% { opacity: 0.20; }
    50%       { opacity: 0.52; }
  }
  @keyframes nodeDotAppear {
    from { opacity: 0; transform: scale(0); }
    to   { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-lattice-line]  { animation: none !important; stroke-dashoffset: 0 !important; }
    [data-lattice-dot]   { animation: none !important; opacity: 1 !important; }
  }
`;

export function BranchLattice({
  branches,
  activeBranchId: _activeBranchId,
  header,
  onSelectBranch,
  hasMeasuredDimensions = true,
}: BranchLatticeProps) {
  const [popupOpenId, setPopupOpenId] = useState<string | null>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const latticeRef = useRef<HTMLDivElement>(null);

  const activeBranch = branches.find((b) => b.id === popupOpenId) ?? null;
  const activeIndex = popupOpenId
    ? branches.findIndex((b) => b.id === popupOpenId)
    : -1;

  function hexToRgba(hex: string, alpha: number) {
    const cleaned = hex.replace("#", "");
    const expanded =
      cleaned.length === 3
        ? cleaned
            .split("")
            .map((c) => c + c)
            .join("")
        : cleaned.length === 8
          ? cleaned.slice(0, 6)
          : cleaned;
    const r = Number.parseInt(expanded.slice(0, 2), 16);
    const g = Number.parseInt(expanded.slice(2, 4), 16);
    const b = Number.parseInt(expanded.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function withAlpha(color: string, alpha: number) {
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
      return hexToRgba(color, alpha);
    }
    if (color.startsWith("rgba(")) {
      return color.replace(
        /rgba\(([^)]+),\s*([^)]+)\)/,
        "rgba($1," + alpha + ")",
      );
    }
    if (color.startsWith("rgb(")) {
      return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
    }
    return color;
  }

  const handleNodeClick = useCallback(
    (id: string) => {
      if (popupOpenId === id) {
        // Toggle off
        setPopupOpenId(null);
        onSelectBranch?.(null);
      } else {
        setPopupOpenId(id);
        onSelectBranch?.(id);
      }
    },
    [popupOpenId, onSelectBranch],
  );

  const handleClose = useCallback(() => {
    setPopupOpenId(null);
    onSelectBranch?.(null);
  }, [onSelectBranch]);

  // Spine geometry — 144px step matches node w-28(112) + gap-8(32)
  const STEP = 144;
  const pts = branches.map((_, i) => ({
    x: 72 + i * STEP,
    y: i % 2 === 0 ? 40 : 56,
  }));
  const svgW = 72 + (branches.length - 1) * STEP + 56;

  return (
    <>
      <style>{LATTICE_KEYFRAMES}</style>
      <div ref={latticeRef}>
        {header}
        <div className="relative mt-5 overflow-x-auto pb-2">
          {hasMeasuredDimensions && branches.length > 0 ? (
            <div
              key="scored-lattice"
              className="relative flex min-w-max items-start gap-8 px-4 py-4"
            >
              {/* Spine SVG */}
              {branches.length > 1 && (
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0"
                  height={96}
                  style={{ overflow: "visible" }}
                  width={svgW}
                >
                  <defs>
                    {pts.slice(0, -1).map((p1, i) => {
                      const p2 = pts[i + 1];
                      const b1 = branches[i];
                      const b2 = branches[i + 1];
                      const hot = activeIndex === i || activeIndex === i + 1;
                      const a = hot ? 0.88 : 0.64;
                      const stop1 = b1?.scored
                        ? withAlpha(b1.toneBorder, a)
                        : withAlpha(palette.silver, 0.32);
                      const stop2 = b2?.scored
                        ? withAlpha(b2.toneBorder, a)
                        : withAlpha(palette.silver, 0.32);
                      return (
                        <linearGradient
                          key={i}
                          id={`lattice-seg-${i}`}
                          gradientUnits="userSpaceOnUse"
                          x1={p1.x}
                          x2={p2.x}
                          y1={p1.y}
                          y2={p2.y}
                        >
                          <stop offset="0%" stopColor={stop1} />
                          <stop offset="100%" stopColor={stop2} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  {pts.slice(0, -1).map((p1, i) => {
                    const p2 = pts[i + 1];
                    const len = Math.round(
                      Math.hypot(p2.x - p1.x, p2.y - p1.y),
                    );
                    const delay = (i + 1) * 80 + 300;
                    const hot = activeIndex === i || activeIndex === i + 1;
                    return (
                      <g key={i}>
                        {/* ghost trail */}
                        <line
                          stroke={BRANCH_TOKENS.spineGhost}
                          strokeWidth="1"
                          x1={p1.x} y1={p1.y}
                          x2={p2.x} y2={p2.y}
                        />
                        {/* animated draw line */}
                        <line
                          data-lattice-line=""
                          stroke={`url(#lattice-seg-${i})`}
                          strokeDasharray={len}
                          strokeWidth={hot ? "1.35" : "1.05"}
                          x1={p1.x} y1={p1.y}
                          x2={p2.x} y2={p2.y}
                          style={
                            {
                              "--seg-len": len,
                              animation: `lineDrawForward 340ms ease-out ${delay}ms both`,
                            } as React.CSSProperties
                          }
                        />
                        {/* glow halo */}
                        <line
                          data-lattice-line=""
                          stroke={`url(#lattice-seg-${i})`}
                          strokeDasharray={len}
                          strokeLinecap="round"
                          strokeWidth={hot ? "8" : "6"}
                          x1={p1.x} y1={p1.y}
                          x2={p2.x} y2={p2.y}
                          style={
                            {
                              "--seg-len": len,
                              animation: `lineDrawForward 340ms ease-out ${delay}ms both, lineGlowFloat 2.6s ease-in-out ${delay + 340}ms infinite`,
                            } as React.CSSProperties
                          }
                        />
                      </g>
                    );
                  })}
                  {pts.map((p, i) => (
                    <circle
                      key={i}
                      data-lattice-dot=""
                      cx={p.x} cy={p.y}
                      fill={
                        branches[i]?.scored
                          ? withAlpha(branches[i].toneBorder, 0.70)
                          : withAlpha(palette.silver, 0.45)
                      }
                      r="3.5"
                      style={
                        {
                          transformBox: "fill-box",
                          transformOrigin: "center",
                          animation: `nodeDotAppear 360ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 90 + 200}ms both`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </svg>
              )}

              {/* Branch nodes */}
              {branches.map((branch, index) => (
                <BranchNode
                  key={branch.id}
                  ref={(el) => {
                    if (el) nodeRefs.current.set(branch.id, el);
                    else nodeRefs.current.delete(branch.id);
                  }}
                  data={branch}
                  isActive={popupOpenId === branch.id}
                  animationDelay={index * 90}
                  nodeOffset={index % 2 === 0 ? 0 : 16}
                  onClick={handleNodeClick}
                />
              ))}
            </div>
          ) : branches.length > 0 ? (
            /* Pending proof — chip list */
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
              <div
                className="rounded-xl border px-4 py-4"
                style={{
                  borderColor: BRANCH_TOKENS.pendingShellBorder,
                  background: BRANCH_TOKENS.pendingShellBg,
                }}
              >
                <p
                  className="font-display text-xs uppercase tracking-[0.14em]"
                  style={{ color: palette.ink }}
                >
                  Branch proof pending
                </p>
                <p
                  className="mt-3 text-sm leading-6"
                  style={{ color: palette.inkSoft }}
                >
                  This category has a readable score, but its individual
                  dimensions have not gathered enough evidence for scored branch
                  readings yet.
                </p>
              </div>
              <div
                className="rounded-xl border px-4 py-4"
                style={{
                  borderColor: BRANCH_TOKENS.knownLanesBorder,
                  background: BRANCH_TOKENS.knownLanesBg,
                }}
              >
                <p
                  className="font-display text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: palette.gold }}
                >
                  Known lanes
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      ref={(el) => {
                        if (el) nodeRefs.current.set(branch.id, el);
                        else nodeRefs.current.delete(branch.id);
                      }}
                      className="rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.10em] transition-colors"
                      onClick={() => handleNodeClick(branch.id)}
                      style={{
                        borderColor:
                          popupOpenId === branch.id
                            ? palette.gold
                            : BRANCH_TOKENS.knownLaneIdleBorder,
                        color:
                          popupOpenId === branch.id
                            ? palette.gold
                            : palette.silver,
                        background:
                          popupOpenId === branch.id
                            ? BRANCH_TOKENS.knownLaneActiveBg
                            : BRANCH_TOKENS.knownLaneIdleBg,
                      }}
                      type="button"
                    >
                      {branch.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-md border px-4 py-5 text-sm leading-7"
              style={{
                borderColor: BRANCH_TOKENS.emptyBorder,
                background: BRANCH_TOKENS.emptyBg,
                color: palette.inkSoft,
              }}
            >
              No branches have landed in the chamber yet.
            </div>
          )}
        </div>
      </div>

      {/* Centered detail modal — rendered into document.body via portal */}
      <BranchDetailModal
        open={!!popupOpenId}
        branch={activeBranch}
        onClose={handleClose}
      />
    </>
  );
}
