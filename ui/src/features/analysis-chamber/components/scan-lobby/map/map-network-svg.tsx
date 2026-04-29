import type { ScanLobbyMode, SourceStatus } from "../scan-lobby.types";
import { MAP_ANCHORS, MAP_ARCS, MAP_RINGS, MAP_VIEWBOX } from "./map-constants";
import { describeArc, getRingRadius } from "./map-utils";

export function MapNetworkSvg({
  mode,
  sourceStatuses,
}: {
  mode: ScanLobbyMode;
  sourceStatuses: Record<string, SourceStatus>;
}) {
  const accent =
    mode === "failed"
      ? "#D15A3A"
      : mode === "success"
        ? "#A8C987"
        : mode === "scouting" || mode === "dispatching"
          ? "#E6C06B"
          : "#8E6A43";

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <filter id="scan-route-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {MAP_RINGS.filter((ring) => ring.id === "outer-march" || ring.id === "far-watch").map((ring) => (
        <circle
          key={ring.id}
          cx={MAP_VIEWBOX.centerX}
          cy={MAP_VIEWBOX.centerY}
          r={ring.radius}
          fill="none"
          stroke={accent}
          strokeDasharray={ring.variant === "faint" ? "3 16" : undefined}
          strokeOpacity={ring.variant === "faint" ? "0.12" : "0.22"}
          strokeWidth="1.4"
        />
      ))}

      {MAP_ARCS.map((arc) => {
        const arcSourceStatus = MAP_ANCHORS.some(
          (anchor) => anchor.arcId === arc.id && sourceStatuses[anchor.id] === "watching",
        );
        return (
          <path
            key={arc.id}
            d={describeArc(getRingRadius(arc.ringId), arc.startAngle, arc.endAngle)}
            fill="none"
            stroke={accent}
            strokeLinecap="round"
            strokeOpacity={arcSourceStatus ? "0.55" : "0.28"}
            strokeWidth="2.2"
            filter={mode === "scouting" || mode === "dispatching" ? "url(#scan-route-glow)" : undefined}
          />
        );
      })}

    </svg>
  );
}
