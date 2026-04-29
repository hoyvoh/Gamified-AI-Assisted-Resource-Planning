"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { animate } from "animejs";

import {
  Archive,
  Castle,
  Code2,
  Hammer,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

import type { SourceStatus } from "../scan-lobby.types";
import { MAP_ANCHORS, SOURCE_STATUS_STYLES } from "./map-constants";
import { anchorToPoint, pointToPercent } from "./map-utils";

const iconMap = {
  code: Code2,
  signal: MessageSquare,
  archive: Archive,
  forge: Hammer,
  vault: Castle,
} as const;

export function MapAnchorNodes({
  sourceStatuses,
  reducedMotion,
}: {
  sourceStatuses: Record<string, SourceStatus>;
  reducedMotion: boolean;
}) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !layerRef.current) return;

    const animations: Array<ReturnType<typeof animate>> = [];
    const activeNodes = layerRef.current.querySelectorAll('[data-node-status="watching"]');
    const sealedNodes = layerRef.current.querySelectorAll('[data-node-status="sealed"]');
    const brokenNodes = layerRef.current.querySelectorAll('[data-node-status="broken"]');

    if (activeNodes.length) {
      animations.push(
        animate(activeNodes, {
          scale: [1, 1.07, 1],
          duration: 1450,
          ease: "inOutSine",
          loop: true,
        }),
      );
    }

    if (sealedNodes.length) {
      animations.push(
        animate(sealedNodes, {
          scale: [0.96, 1],
          opacity: [0.82, 1],
          duration: 420,
          ease: "outQuad",
        }),
      );
    }

    if (brokenNodes.length) {
      animations.push(
        animate(brokenNodes, {
          translateX: [0, -1.5, 1.5, -1, 0],
          duration: 320,
          ease: "inOutSine",
        }),
      );
    }

    return () => {
      animations.forEach((animation) => animation.pause());
    };
  }, [reducedMotion, sourceStatuses]);

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 z-20"
      aria-label="Scan source anchors"
    >
      {MAP_ANCHORS.map((anchor) => {
        const status = sourceStatuses[anchor.id] ?? "dormant";
        const styles = SOURCE_STATUS_STYLES[status];
        const Icon = iconMap[anchor.icon];
        const position = pointToPercent(anchorToPoint(anchor));
        const labelPlacement = getLabelPlacement(anchor.angle);

        return (
          <button
            key={anchor.id}
            type="button"
            className="group absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-100"
            style={position}
            title={`${anchor.label} / ${anchor.technicalLabel}: ${styles.label}`}
            data-animate="source-node"
            data-node-status={status}
          >
            <span
              className={`absolute -inset-2 rounded-full border transition duration-500 ${styles.anchorRing} ${
                status === "watching" ? "animate-pulse" : ""
              }`}
            />
            <span
              className={`relative grid h-11 w-11 place-items-center rounded-full border backdrop-blur transition duration-500 ${styles.anchor}`}
            >
              {status === "sealed" ? (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Icon className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <span
              className="pointer-events-none absolute hidden w-22 font-mono text-[7px] uppercase leading-snug tracking-[0.08em] text-amber-50/56 transition group-hover:text-amber-50 sm:block"
              style={labelPlacement}
            >
              <span className="block truncate">{anchor.label}</span>
              <span className="block text-amber-200/36">{anchor.technicalLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function getLabelPlacement(angle: number): CSSProperties {
  if (angle < 80) {
    return {
      left: "50%",
      top: "3.05rem",
      transform: "translateX(-50%)",
      textAlign: "center",
    };
  }

  if (angle > 280) {
    return {
      left: "50%",
      top: "3.05rem",
      transform: "translateX(-50%)",
      textAlign: "center",
    };
  }

  if (angle > 90 && angle < 180) {
    return {
      left: "3.1rem",
      top: "50%",
      transform: "translateY(-50%)",
      textAlign: "left",
    };
  }

  if (angle >= 180 && angle <= 280) {
    return {
      right: "3.1rem",
      top: "50%",
      transform: "translateY(-50%)",
      textAlign: "right",
    };
  }

  return {
    left: "50%",
    top: "3.05rem",
    transform: "translateX(-50%)",
    textAlign: "center",
  };
}
