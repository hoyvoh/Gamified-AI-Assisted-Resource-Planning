import type { CSSProperties } from "react";

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
}: {
  sourceStatuses: Record<string, SourceStatus>;
}) {
  return (
    <div className="absolute inset-0 z-20" aria-label="Scan source anchors">
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
