import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

import type { WarRoomCounter } from "@/features/analysis-chamber/lib/members-war-room";

const COUNTER_TONE_STYLE: Record<
  WarRoomCounter["tone"],
  { border: string; text: string }
> = {
  active: { border: `${MEDIEVAL_THEME.status.active.border}73`, text: MEDIEVAL_THEME.status.active.text },
  danger: { border: `${MEDIEVAL_THEME.status.danger.border}7a`, text: MEDIEVAL_THEME.status.danger.text },
  idle: { border: `${MEDIEVAL_THEME.status.idle.border}4d`, text: MEDIEVAL_THEME.status.idle.text },
  ready: { border: `${MEDIEVAL_THEME.status.ready.border}7a`, text: MEDIEVAL_THEME.status.ready.text },
  unknown: { border: `${MEDIEVAL_THEME.status.unknown.border}66`, text: MEDIEVAL_THEME.status.unknown.text },
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
          className="border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,240,219,0.04)]"
          style={{
            borderColor: COUNTER_TONE_STYLE[counter.tone].border,
            color: COUNTER_TONE_STYLE[counter.tone].text,
            backgroundImage: MEDIEVAL_THEME.gradients.shell,
          }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
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
                "linear-gradient(90deg,rgba(216,175,99,0.0),rgba(216,175,99,0.22),rgba(216,175,99,0.0))",
            }}
          />
        </div>
      ))}
    </section>
  );
}
