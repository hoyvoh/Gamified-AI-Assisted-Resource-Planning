import type {
  MapAnchor,
  ScanLobbyMode,
  ScanProgressPhase,
  SourceStatus,
} from "../scan-lobby.types";
import { MAP_ANCHORS, MAP_RINGS, MAP_VIEWBOX } from "./map-constants";

export function getSourceStatuses(
  mode: ScanLobbyMode,
  phase: ScanProgressPhase,
): Record<string, SourceStatus> {
  if (mode === "failed") {
    const activeAnchor = getAnchorForPhase(phase);
    return Object.fromEntries(
      MAP_ANCHORS.map((anchor) => [
        anchor.id,
        anchor.id === activeAnchor.id ? "broken" : "dormant",
      ]),
    ) as Record<string, SourceStatus>;
  }

  if (mode === "success") {
    return Object.fromEntries(MAP_ANCHORS.map((anchor) => [anchor.id, "sealed"])) as Record<
      string,
      SourceStatus
    >;
  }

  if (mode === "scouting" || mode === "dispatching") {
    const activePhaseIndex = getPhaseIndex(phase);

    return Object.fromEntries(
      MAP_ANCHORS.map((anchor) => {
        const anchorPhaseIndex = getPhaseIndex(anchor.phase);
        const status: SourceStatus =
          anchor.phase === phase
            ? "watching"
            : anchorPhaseIndex < activePhaseIndex
              ? "sealed"
              : "dormant";
        return [anchor.id, status];
      }),
    ) as Record<string, SourceStatus>;
  }

  return Object.fromEntries(MAP_ANCHORS.map((anchor) => [anchor.id, "dormant"])) as Record<
    string,
    SourceStatus
  >;
}

export function getAnchorForPhase(phase: ScanProgressPhase): MapAnchor {
  return MAP_ANCHORS.find((anchor) => anchor.phase === phase) ?? MAP_ANCHORS[0];
}

function getPhaseIndex(phase: ScanProgressPhase): number {
  const order: ScanProgressPhase[] = [
    "sealing-order",
    "crossing-signal-realm",
    "gathering-fragments",
    "forging-dossier",
    "verdict",
  ];
  return order.indexOf(phase);
}

export function getRingRadius(ringId: string): number {
  return MAP_RINGS.find((ring) => ring.id === ringId)?.radius ?? MAP_RINGS[0].radius;
}

export function polarToPoint(angleDeg: number, radius: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: MAP_VIEWBOX.centerX + radius * Math.cos(angleRad),
    y: MAP_VIEWBOX.centerY + radius * Math.sin(angleRad),
  };
}

export function anchorToPoint(anchor: MapAnchor) {
  return polarToPoint(anchor.angle, getRingRadius(anchor.ringId));
}

export function pointToPercent(point: { x: number; y: number }) {
  return {
    left: `${(point.x / MAP_VIEWBOX.width) * 100}%`,
    top: `${(point.y / MAP_VIEWBOX.height) * 100}%`,
  };
}

export function describeArc(radius: number, startAngle: number, endAngle: number): string {
  const start = polarToPoint(startAngle, radius);
  const end = polarToPoint(endAngle, radius);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    formatPoint(start.x),
    formatPoint(start.y),
    "A",
    formatPoint(radius),
    formatPoint(radius),
    0,
    largeArcFlag,
    1,
    formatPoint(end.x),
    formatPoint(end.y),
  ].join(" ");
}

export function describeRoute(anchor: MapAnchor): string {
  const start = anchorToPoint(anchor);
  const controlOuter = polarToPoint(anchor.angle, getRingRadius(anchor.ringId) * 0.68);
  const controlInner = polarToPoint(anchor.angle, 44);
  return `M ${formatPoint(start.x)} ${formatPoint(start.y)} C ${formatPoint(controlOuter.x)} ${formatPoint(controlOuter.y)}, ${formatPoint(controlInner.x)} ${formatPoint(controlInner.y)}, ${MAP_VIEWBOX.centerX} ${MAP_VIEWBOX.centerY}`;
}

function formatPoint(value: number): string {
  return Number(value.toFixed(3)).toString();
}
