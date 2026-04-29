import type { ScanLobbyMode } from "../scan-lobby.types";

export function MapSignalCore({ mode }: { mode: ScanLobbyMode; reducedMotion: boolean }) {
  const glowColor =
    mode === "failed"
      ? "shadow-[0_0_64px_rgba(220,80,60,0.28),0_0_28px_rgba(220,80,60,0.14)]"
      : mode === "success"
        ? "shadow-[0_0_64px_rgba(100,210,130,0.28),0_0_28px_rgba(100,210,130,0.14)]"
        : "shadow-[0_0_64px_rgba(214,168,79,0.34),0_0_28px_rgba(214,168,79,0.18)]";

  return (
    <div
      className={`grid h-[98px] w-[98px] place-items-center rounded-full border border-amber-100/50 bg-[radial-gradient(circle,rgba(255,232,192,0.58),rgba(214,168,79,0.24)_42%,rgba(0,0,0,0.22)_76%)] ${glowColor}`}
    >
      <div className="h-10 w-10 rounded-[4px] border border-amber-100/45 bg-black/18 shadow-[inset_0_0_18px_rgba(255,232,192,0.16)]" />
    </div>
  );
}
