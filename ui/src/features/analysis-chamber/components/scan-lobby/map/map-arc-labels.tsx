import { MAP_RINGS } from "./map-constants";
import { polarToPoint, pointToPercent } from "./map-utils";

const labelAngles: Record<string, number> = {
  "inner-ward": 330,
  "signal-belt": 82,
  "outer-march": 188,
  "far-watch": 260,
};

export function MapArcLabels() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      {MAP_RINGS.map((ring) => {
        const position = pointToPercent(polarToPoint(labelAngles[ring.id] ?? 0, ring.radius));
        return (
          <span
            key={ring.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-[0.16em] text-amber-100/32"
            style={position}
          >
            {ring.label}
          </span>
        );
      })}
    </div>
  );
}
