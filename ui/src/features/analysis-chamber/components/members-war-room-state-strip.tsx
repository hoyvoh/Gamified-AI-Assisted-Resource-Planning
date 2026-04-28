import { cn } from "@/lib/utils";

import type { WarRoomCounter } from "@/features/analysis-chamber/lib/members-war-room";

const COUNTER_TONE_CLASS: Record<WarRoomCounter["tone"], string> = {
  active: "border-[#5f6f91]/45 text-[#adc0db]",
  danger: "border-[#8e4538]/48 text-[#e2aa9d]",
  idle: "border-[#8f8572]/30 text-[#d1c1a6]",
  ready: "border-[#4a654d]/48 text-[#b5d0b9]",
  unknown: "border-[#b88b3f]/40 text-[#f1dfbc]",
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
            "border bg-[linear-gradient(180deg,rgba(31,21,14,0.94),rgba(20,14,10,0.96))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,240,219,0.04)]",
            COUNTER_TONE_CLASS[counter.tone],
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#d6bf94]/62">
            {counter.label}
          </p>
          <p className="mt-2 font-body-serif text-3xl leading-none text-current">
            {counter.value}
          </p>
          <div className="mt-2 h-px w-full bg-[linear-gradient(90deg,rgba(214,191,148,0.0),rgba(214,191,148,0.22),rgba(214,191,148,0.0))]" />
        </div>
      ))}
    </section>
  );
}
