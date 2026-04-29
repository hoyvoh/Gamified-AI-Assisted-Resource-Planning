"use client";

import { useEffect, useRef } from "react";

import { animate } from "animejs";

import type { ScanLobbyMode, ScanProgressPhase } from "../scan-lobby.types";

export function MapSignalCore({
  mode,
  phase,
  reducedMotion,
}: {
  mode: ScanLobbyMode;
  phase: ScanProgressPhase;
  reducedMotion: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const glowColor =
    mode === "failed"
      ? "shadow-[0_0_64px_rgba(220,80,60,0.28),0_0_28px_rgba(220,80,60,0.14)]"
      : mode === "success"
        ? "shadow-[0_0_64px_rgba(100,210,130,0.28),0_0_28px_rgba(100,210,130,0.14)]"
        : "shadow-[0_0_64px_rgba(214,168,79,0.34),0_0_28px_rgba(214,168,79,0.18)]";

  useEffect(() => {
    if (reducedMotion || !outerRef.current || !innerRef.current) return;

    const animations: Array<ReturnType<typeof animate>> = [];

    if (mode === "dispatching" || mode === "scouting") {
      const phaseScale = phase === "sealing-order" ? 1.08 : 1.12;

      animations.push(
        animate(outerRef.current, {
          scale: [1, phaseScale, 1],
          opacity: [0.9, 1, 0.9],
          duration: 1700,
          ease: "inOutSine",
          loop: true,
        }),
      );
      animations.push(
        animate(innerRef.current, {
          scale: [1, 1.06, 1],
          rotate: [0, 2, 0],
          duration: 1200,
          ease: "inOutSine",
          loop: true,
        }),
      );
    } else if (mode === "success") {
      animations.push(
        animate(outerRef.current, {
          scale: [1, 1.12, 1.02],
          opacity: [0.92, 1, 0.96],
          duration: 900,
          ease: "outQuad",
        }),
      );
      animations.push(
        animate(innerRef.current, {
          scale: [1, 1.08, 1],
          duration: 760,
          ease: "outQuad",
        }),
      );
    } else if (mode === "failed") {
      animations.push(
        animate(outerRef.current, {
          scale: [1, 1.03, 0.98, 1],
          opacity: [0.95, 0.72, 0.88, 0.95],
          duration: 540,
          ease: "inOutSine",
        }),
      );
      animations.push(
        animate(innerRef.current, {
          translateY: [0, -1.5, 0.5, 0],
          duration: 300,
          ease: "inOutSine",
        }),
      );
    }

    return () => {
      animations.forEach((animation) => animation.pause());
    };
  }, [mode, phase, reducedMotion]);

  return (
    <div
      ref={outerRef}
      className={`grid h-[98px] w-[98px] place-items-center rounded-full border border-amber-100/50 bg-[radial-gradient(circle,rgba(255,232,192,0.58),rgba(214,168,79,0.24)_42%,rgba(0,0,0,0.22)_76%)] ${glowColor}`}
    >
      <div
        ref={innerRef}
        className="h-10 w-10 rounded-[4px] border border-amber-100/45 bg-black/18 shadow-[inset_0_0_18px_rgba(255,232,192,0.16)]"
      />
    </div>
  );
}
