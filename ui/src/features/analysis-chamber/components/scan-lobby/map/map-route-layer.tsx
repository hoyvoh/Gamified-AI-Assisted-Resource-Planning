"use client";

import { useEffect, useRef } from "react";

import { animate, stagger } from "animejs";

import type { ScanLobbyMode, SourceStatus } from "../scan-lobby.types";
import { MAP_ANCHORS, MAP_VIEWBOX } from "./map-constants";
import { describeRoute } from "./map-utils";

export function MapRouteLayer({
  mode,
  sourceStatuses,
  reducedMotion,
}: {
  mode: ScanLobbyMode;
  sourceStatuses: Record<string, SourceStatus>;
  reducedMotion: boolean;
}) {
  const layerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (reducedMotion || !layerRef.current) return;

    const activeRoutes = layerRef.current.querySelectorAll('[data-route-state="watching"]');
    if (!activeRoutes.length) return;

    const animation = animate(activeRoutes, {
      strokeDashoffset: [180, 0],
      opacity: [0.28, 0.9, 0.28],
      duration: 1800,
      delay: stagger(160),
      ease: "inOutSine",
      loop: true,
    });

    return () => {
      animation.pause();
    };
  }, [mode, sourceStatuses, reducedMotion]);

  return (
    <svg
      ref={layerRef}
      className="pointer-events-none absolute inset-0 z-[3] h-full w-full"
      viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="route-brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ECD29A" stopOpacity="0.1" />
          <stop offset="52%" stopColor="#ECD29A" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#ECD29A" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="route-sealed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8C987" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#A8C987" stopOpacity="0.44" />
        </linearGradient>
        <linearGradient id="route-broken" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F2A08A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#D15A3A" stopOpacity="0.62" />
        </linearGradient>
      </defs>

      {MAP_ANCHORS.map((anchor) => {
        const status = sourceStatuses[anchor.id] ?? "dormant";
        const stroke =
          status === "broken"
            ? "url(#route-broken)"
            : status === "sealed"
              ? "url(#route-sealed)"
              : "url(#route-brass)";
        const opacity =
          status === "watching" ? 0.9 : status === "sealed" ? 0.42 : status === "broken" ? 0.7 : 0.16;

        return (
          <path
            key={anchor.id}
            d={describeRoute(anchor)}
            fill="none"
            stroke={stroke}
            strokeDasharray={status === "watching" ? "18 14" : status === "broken" ? "8 9" : "4 12"}
            strokeDashoffset={status === "watching" ? 180 : 0}
            strokeLinecap="round"
            strokeOpacity={opacity}
            strokeWidth={status === "watching" ? 2.2 : 1.4}
            data-route-state={status}
          />
        );
      })}
    </svg>
  );
}
