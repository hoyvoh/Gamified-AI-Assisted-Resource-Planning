import type { SourceStatus } from "../scan-lobby.types";
import { MAP_ANCHORS, SOURCE_STATUS_STYLES } from "./map-constants";

/**
 * Source Status panel — the readable source-of-truth for anchor identities.
 * Active rows receive a subtle highlight that mirrors the active anchor on the map.
 */
export function MapSourceStates({
  sourceStatuses,
}: {
  sourceStatuses: Record<string, SourceStatus>;
}) {
  return (
    <div className="rounded-md border border-white/6 bg-black/12 p-2 backdrop-blur-sm">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">
        Source Status
      </p>
      <div className="mt-2 space-y-1">
        {MAP_ANCHORS.map((anchor) => {
          const status = sourceStatuses[anchor.id] ?? "dormant";
          const styles = SOURCE_STATUS_STYLES[status];

          return (
            <div
              key={anchor.id}
              className={`flex items-center justify-between gap-2 py-0.5 font-mono text-[8px] transition-colors duration-300 ${styles.rowHighlight}`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`block h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot} ${
                    status === "watching"
                      ? "shadow-[0_0_5px_2px_rgba(125,211,252,0.45)]"
                      : ""
                  }`}
                />
                <span className="truncate text-white/48">
                  {anchor.label} / {anchor.technicalLabel}
                </span>
              </div>
              <span className={`shrink-0 ${styles.text}`}>{styles.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
