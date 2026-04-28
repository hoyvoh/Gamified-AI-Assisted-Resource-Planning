import { cn } from "@/lib/utils";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

import type { WarRoomCounter } from "@/features/analysis-chamber/lib/members-war-room";

const COUNTER_TONE_CLASS: Record<WarRoomCounter["tone"], string> = {
  active: "border-[#617495]/45 text-[#b7c6dc]",
  danger: "border-[#8f4538]/48 text-[#e4aea2]",
  idle: "border-[#8f826d]/30 text-[#d6c6a7]",
  ready: "border-[#4d684f]/48 text-[#bad1bd]",
  unknown: "border-[#b68a44]/40 text-[#ead9b7]",
};

type MembersWarRoomStateStripProps = {
  counters: WarRoomCounter[];
};

export function MembersWarRoomStateStrip({
  counters,
}: MembersWarRoomStateStripProps) {
  return (
    <section
      aria-label="Council state"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {counters.map((counter) => (
        <div
          key={counter.key}
          className={cn(
            "border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,240,219,0.04)]",
            COUNTER_TONE_CLASS[counter.tone],
          )}
          style={{ backgroundImage: MEDIEVAL_THEME.gradients.shell }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(214, 191, 148, 0.62)" }}
          >
            {counter.label}
          </p>
          <p className="mt-2 font-body-serif text-3xl leading-none text-current">
            {counter.value}
          </p>
          <div
            className="mt-2 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg,rgba(214,191,148,0.0),rgba(214,191,148,0.22),rgba(214,191,148,0.0))",
            }}
          />
        </div>
      ))}
    </section>
  );
}
