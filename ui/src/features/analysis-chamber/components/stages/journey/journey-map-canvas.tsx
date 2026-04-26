"use client";

import { useMemo } from "react";
import Image from "next/image";

import type { JourneyMilestoneViewModel } from "@/features/analysis-chamber/components/stages/journey/journey-stage.types";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

const TERRAIN_LAYERS = [
  {
    src: "/journey-map/overlays/topography-1.png",
    alt: "",
    className: "left-[10%] top-[12%] w-[20%] opacity-[0.28]",
  },
  {
    src: "/journey-map/overlays/topography-2.png",
    alt: "",
    className: "right-[12%] top-[18%] w-[18%] opacity-[0.48]",
  },
  {
    src: "/journey-map/overlays/lines-bg.png",
    alt: "",
    className: "left-[28%] top-[42%] w-[26%] opacity-[0.04]",
  },
] as const;

const MOUNTAIN_LAYERS = [
  {
    src: "/journey-map/mountains/mount-1.png",
    className: "left-[18%] top-[24%] w-[16%] opacity-[0.42]",
  },
  {
    src: "/journey-map/mountains/mount-5.png",
    className: "left-[60%] top-[30%] w-[14%] opacity-[0.36]",
  },
  {
    src: "/journey-map/mountains/mount-8.png",
    className: "left-[34%] bottom-[18%] w-[18%] opacity-[0.32]",
  },
] as const;

const FOREST_LAYERS = [
  {
    src: "/journey-map/trees/pine-1.png",
    className: "left-[12%] bottom-[22%] w-[12%] opacity-[0.34]",
  },
  {
    src: "/journey-map/trees/tree-4.png",
    className: "left-[72%] bottom-[18%] w-[12%] opacity-[0.30]",
  },
] as const;

const DECOR_LANDMARKS = [
  // bottom-left cluster — home + village near start
  {
    id: "home-1",
    src: "/journey-map/landmarks/home.png",
    className: "left-[3%] bottom-[10%] w-[7%] opacity-[0.38]",
  },
  {
    id: "village-1",
    src: "/journey-map/landmarks/village.png",
    className: "left-[8%] bottom-[6%] w-[9%] opacity-[0.34]",
  },
  // mid-bottom — small settlement
  {
    id: "home-2",
    src: "/journey-map/landmarks/home.png",
    className: "left-[44%] bottom-[7%] w-[6%] opacity-[0.30]",
  },
  {
    id: "village-2",
    src: "/journey-map/landmarks/village.png",
    className: "left-[50%] bottom-[12%] w-[8%] opacity-[0.28]",
  },
  // top-right area — watchtower outpost
  {
    id: "watchtower-1",
    src: "/journey-map/landmarks/watchtower.png",
    className: "right-[6%] top-[14%] w-[6%] opacity-[0.32]",
  },
  {
    id: "watchtower-2",
    src: "/journey-map/landmarks/watchtower.png",
    className: "right-[22%] top-[8%] w-[5%] opacity-[0.26]",
  },
  // mid-left — cave in the hills
  {
    id: "cave-1",
    src: "/journey-map/landmarks/cave.png",
    className: "left-[5%] top-[28%] w-[7%] opacity-[0.30]",
  },
  // far right — open city ruins
  {
    id: "open-city-1",
    src: "/journey-map/landmarks/open-city.png",
    className: "right-[4%] bottom-[20%] w-[9%] opacity-[0.28]",
  },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getMarkerSize = (state: JourneyMilestoneViewModel["state"]) => {
  switch (state) {
    case "frontier":
      return 94;
    case "conquered":
      return 76;
    default:
      return 70;
  }
};

const getNodePalette = (state: JourneyMilestoneViewModel["state"]) => {
  switch (state) {
    case "conquered":
      return {
        border: "rgba(255,184,77,0.58)",
        surface:
          "radial-gradient(circle at 50% 24%, rgba(255,220,150,0.20), transparent 42%), linear-gradient(180deg, rgba(73,43,20,0.95) 0%, rgba(35,20,12,0.96) 100%)",
        glow: "0 0 0 10px rgba(255,184,77,0.08), 0 0 28px rgba(255,184,77,0.18)",
        icon: palette.goldLight,
        text: palette.ink,
        badge: "rgba(255,184,77,0.18)",
        badgeBorder: "rgba(255,184,77,0.28)",
      };
    case "frontier":
      return {
        border: "rgba(255,184,77,0.92)",
        surface:
          "radial-gradient(circle at 50% 16%, rgba(255,224,163,0.34), transparent 46%), linear-gradient(180deg, rgba(92,58,28,0.98) 0%, rgba(37,22,14,0.98) 100%)",
        glow: "0 0 0 12px rgba(255,184,77,0.12), 0 0 42px rgba(255,184,77,0.36)",
        icon: "#ffe6b6",
        text: "#fff1d2",
        badge: "rgba(255,184,77,0.24)",
        badgeBorder: "rgba(255,184,77,0.42)",
      };
    default:
      return {
        border: "rgba(104,89,77,0.46)",
        surface:
          "radial-gradient(circle at 50% 16%, rgba(96,99,110,0.10), transparent 36%), linear-gradient(180deg, rgba(31,29,31,0.96) 0%, rgba(18,17,20,0.96) 100%)",
        glow: "none",
        icon: "rgba(159,169,180,0.7)",
        text: "rgba(232,184,116,0.72)",
        badge: "rgba(255,255,255,0.04)",
        badgeBorder: "rgba(154,171,184,0.18)",
      };
  }
};

const StrongholdGlyph = ({
  item,
  size,
}: {
  item: JourneyMilestoneViewModel;
  size: number;
}) => {
  const { state } = item;
  const opacity = state === "unconquered" ? 0.82 : 1;

  return (
    <div
      className="relative drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
      style={{ width: size, height: size, opacity }}
    >
      <Image
        alt=""
        src={item.landmarkAsset}
        aria-hidden="true"
        fill
        sizes={`${size}px`}
        className="absolute inset-0 object-contain"
        style={{
          filter:
            state === "unconquered"
              ? "brightness(0.42) saturate(0.45)"
              : state === "conquered"
                ? "brightness(0.9) sepia(0.24) saturate(1.15)"
                : "brightness(1.08) sepia(0.28) saturate(1.22)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            state === "frontier"
              ? "radial-gradient(circle at 50% 24%, rgba(255,224,163,0.24), transparent 48%)"
              : state === "conquered"
                ? "radial-gradient(circle at 50% 28%, rgba(255,204,120,0.16), transparent 52%)"
                : "linear-gradient(180deg, rgba(16,16,18,0.08), rgba(16,16,18,0.26))",
          mixBlendMode: state === "unconquered" ? "multiply" : "screen",
        }}
      />
      {state === "frontier" ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2"
          style={{
            width: size * 0.16,
            height: size * 0.16,
            borderRadius: "999px",
            background: "rgba(255,230,182,0.95)",
            boxShadow:
              "0 0 0 8px rgba(255,184,77,0.12), 0 0 22px rgba(255,214,153,0.55)",
          }}
        />
      ) : null}
    </div>
  );
};

const buildRoutePath = (milestones: JourneyMilestoneViewModel[]) => {
  if (milestones.length === 0) {
    return "";
  }

  return milestones
    .map((item, index) => {
      const x = item.position.left;
      const y = item.position.top;

      if (index === 0) {
        return `M ${x} ${y}`;
      }

      const previous = milestones[index - 1];
      const previousX = previous?.position.left ?? x;
      const previousY = previous?.position.top ?? y;
      const controlX = (previousX + x) / 2;

      return `C ${controlX} ${previousY}, ${controlX} ${y}, ${x} ${y}`;
    })
    .join(" ");
};

const buildSegmentPaths = (milestones: JourneyMilestoneViewModel[]) =>
  milestones.slice(1).map((item, index) => {
    const previous = milestones[index];

    if (!previous) {
      return null;
    }

    const controlX = (previous.position.left + item.position.left) / 2;

    return {
      key: `${previous.milestone.id}-${item.milestone.id}`,
      state:
        item.state === "frontier"
          ? "frontier"
          : previous.state === "unconquered" && item.state === "unconquered"
            ? "unconquered"
            : previous.state === "conquered" && item.state === "conquered"
              ? "conquered"
              : item.state,
      d: `M ${previous.position.left} ${previous.position.top} C ${controlX} ${previous.position.top}, ${controlX} ${item.position.top}, ${item.position.left} ${item.position.top}`,
    };
  });

const getAnnotationPlacement = (index: number) => {
  const placements = [
    "translate-x-[4%] translate-y-[8px]",
    "translate-x-[-8%] translate-y-[12px]",
    "translate-x-[-8%] translate-y-[10px]",
    "translate-x-[-56%] translate-y-[8px]",
    "translate-x-[-26%] translate-y-[12px]",
    "translate-x-[-52%] translate-y-[8px]",
  ] as const;

  return placements[index % placements.length] ?? placements[0];
};

export const JourneyMapCanvas = ({
  milestones,
  focusedMilestoneId,
  onSelectMilestone,
}: {
  milestones: JourneyMilestoneViewModel[];
  focusedMilestoneId: string | null;
  onSelectMilestone: (milestoneId: string) => void;
}) => {
  const routePath = useMemo(() => buildRoutePath(milestones), [milestones]);
  const segmentPaths = useMemo(() => buildSegmentPaths(milestones), [milestones]);
  const frontierItem =
    milestones.find((item) => item.state === "frontier") ?? milestones[0] ?? null;
  const frontierLeft = frontierItem?.position.left ?? 50;

  return (
    <div
      className="relative min-h-[540px] overflow-hidden rounded-[28px] border"
      style={{
        borderColor: "rgba(255,184,77,0.18)",
        background:
          "radial-gradient(circle at 20% 58%, rgba(255,184,77,0.10) 0%, rgba(255,184,77,0.04) 24%, transparent 48%), radial-gradient(circle at 58% 42%, rgba(255,184,77,0.05) 0%, transparent 22%), linear-gradient(90deg, rgba(78,46,24,0.18) 0%, rgba(78,46,24,0.08) 44%, rgba(12,10,12,0.00) 54%), linear-gradient(180deg, rgba(52,31,20,0.84) 0%, rgba(24,15,12,0.94) 100%), url('/journey-map/backgrounds/base-paper-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow:
          "inset 0 1px 0 rgba(255,232,192,0.04), inset 0 -18px 40px rgba(0,0,0,0.28)",
      }}
    >
      <Image
        alt=""
        src="/journey-map/decor/border-3.png"
        aria-hidden="true"
        fill
        sizes="100vw"
        className="pointer-events-none absolute inset-0 object-cover opacity-[0.14] mix-blend-screen"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,204,120,0.10), rgba(255,204,120,0.00))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-[44%] w-px"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,184,77,0.00) 0%, rgba(255,184,77,0.08) 24%, rgba(255,184,77,0.10) 50%, rgba(255,184,77,0.00) 100%)",
          opacity: 0.55,
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0"
        style={{
          width: `${clamp(frontierLeft + 10, 24, 92)}%`,
          background:
            "linear-gradient(90deg, rgba(255,184,77,0.10) 0%, rgba(255,184,77,0.04) 72%, rgba(255,184,77,0.00) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0"
        style={{
          width: `${100 - clamp(frontierLeft - 2, 8, 82)}%`,
          background:
            "linear-gradient(90deg, rgba(14,14,18,0.00) 0%, rgba(12,11,14,0.48) 26%, rgba(8,8,10,0.82) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0"
        style={{
          width: `${100 - clamp(frontierLeft + 4, 18, 86)}%`,
          background:
            "radial-gradient(circle at 24% 42%, rgba(255,255,255,0.04) 0%, transparent 18%), radial-gradient(circle at 56% 72%, rgba(255,255,255,0.03) 0%, transparent 16%), linear-gradient(90deg, rgba(16,14,16,0.00) 0%, rgba(10,10,12,0.18) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 76% 52%, rgba(255,255,255,0.03) 0%, transparent 14%), radial-gradient(circle at 84% 28%, rgba(255,255,255,0.02) 0%, transparent 18%), radial-gradient(circle at 91% 68%, rgba(255,255,255,0.025) 0%, transparent 20%)",
          mixBlendMode: "screen",
        }}
      />
      {TERRAIN_LAYERS.map((layer) => (
        <Image
          key={layer.src}
          alt=""
          src={layer.src}
          aria-hidden="true"
          width={720}
          height={720}
          sizes="(min-width: 1024px) 20vw, 32vw"
          className={`pointer-events-none absolute h-auto object-contain mix-blend-screen ${layer.className}`}
        />
      ))}
      {MOUNTAIN_LAYERS.map((layer) => (
        <Image
          key={layer.src}
          alt=""
          src={layer.src}
          aria-hidden="true"
          width={420}
          height={320}
          sizes="(min-width: 1024px) 16vw, 26vw"
          className={`pointer-events-none absolute h-auto object-contain mix-blend-multiply ${layer.className}`}
        />
      ))}
      {FOREST_LAYERS.map((layer) => (
        <Image
          key={layer.src}
          alt=""
          src={layer.src}
          aria-hidden="true"
          width={300}
          height={300}
          sizes="(min-width: 1024px) 12vw, 18vw"
          className={`pointer-events-none absolute h-auto object-contain mix-blend-multiply ${layer.className}`}
        />
      ))}
      {DECOR_LANDMARKS.map((layer) => (
        <Image
          key={layer.id}
          alt=""
          src={layer.src}
          aria-hidden="true"
          width={200}
          height={200}
          sizes="(min-width: 1024px) 8vw, 12vw"
          className={`pointer-events-none absolute h-auto object-contain ${layer.className}`}
          style={{ filter: "brightness(0.55) sepia(0.7) saturate(0.9) hue-rotate(10deg)" }}
        />
      ))}
      <Image
        alt=""
        src="/journey-map/decor/compass.png"
        aria-hidden="true"
        width={160}
        height={160}
        sizes="96px"
        className="pointer-events-none absolute bottom-5 right-5 h-auto w-20 opacity-[0.10] mix-blend-screen"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="journey-route-glow" x1="0%" x2="100%">
            <stop offset="0%" stopColor="rgba(255,184,77,0.50)" />
            <stop offset="50%" stopColor="rgba(255,214,153,0.95)" />
            <stop offset="100%" stopColor="rgba(255,184,77,0.38)" />
          </linearGradient>
          <filter id="journey-route-shadow">
            <feGaussianBlur stdDeviation="1.5" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {routePath ? (
          <path
            d={routePath}
            fill="none"
            stroke="rgba(117,102,92,0.42)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ) : null}
        {segmentPaths.map((segment) => {
          if (!segment) {
            return null;
          }

          if (segment.state === "unconquered") {
            return (
              <path
                key={segment.key}
                d={segment.d}
                fill="none"
                stroke="rgba(141,151,161,0.30)"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeDasharray="1.8 2.4"
              />
            );
          }

          if (segment.state === "frontier") {
            return (
              <path
                key={segment.key}
                d={segment.d}
                fill="none"
                stroke="url(#journey-route-glow)"
                strokeWidth="1.4"
                strokeLinecap="round"
                filter="url(#journey-route-shadow)"
              />
            );
          }

          return (
            <path
              key={segment.key}
              d={segment.d}
              fill="none"
              stroke="rgba(255,184,77,0.62)"
              strokeWidth="1.05"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute left-6 top-6 z-10">
        <p
          className="font-display text-[10px] uppercase tracking-[0.18em]"
          style={{ color: palette.gold }}
        >
          Campaign terrain
        </p>
        <p className="mt-2 max-w-xs text-xs leading-5" style={{ color: palette.inkMuted }}>
          Secured territory glows warm behind the frontier. Future strongholds stay visible under layered fog.
        </p>
      </div>

      {milestones.length > 0 ? (
        milestones.map((item) => {
          const isFocused = item.milestone.id === focusedMilestoneId;
          const tone = getNodePalette(item.state);
          const markerSize = getMarkerSize(item.state);

          return (
            <button
              key={item.milestone.id}
              type="button"
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer text-left transition duration-200 hover:scale-[1.03] hover:brightness-110 focus-visible:outline-none"
              onClick={() => onSelectMilestone(item.milestone.id)}
              style={{
                left: `${item.position.left}%`,
                top: `${item.position.top}%`,
              }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full border p-1"
                  style={{
                    borderColor: tone.border,
                    background: tone.surface,
                    boxShadow: tone.glow,
                    animation:
                      item.state === "frontier"
                        ? "journeyFrontierPulse 3.4s ease-in-out infinite"
                        : item.state === "conquered"
                          ? "journeyBeaconDrift 5.6s ease-in-out infinite"
                          : undefined,
                  }}
                >
                  <StrongholdGlyph item={item} size={markerSize} />
                </div>
                <div
                  className={`mt-2 w-28 rounded-xl border px-2 py-1.5 backdrop-blur-[2px] ${getAnnotationPlacement(
                    item.index,
                  )}`}
                  style={{
                    borderColor: isFocused ? "rgba(255,184,77,0.42)" : tone.badgeBorder,
                    background: isFocused
                      ? "linear-gradient(180deg, rgba(255,184,77,0.18) 0%, rgba(255,184,77,0.10) 100%)"
                      : tone.badge,
                    boxShadow: isFocused
                      ? "0 10px 20px rgba(0,0,0,0.24)"
                      : "0 6px 14px rgba(0,0,0,0.14)",
                  }}
                >
                  <p
                    className="font-display text-[8px] uppercase tracking-[0.04em] leading-3"
                    style={{ color: tone.text }}
                  >
                    {item.milestone.title}
                  </p>
                </div>
              </div>
            </button>
          );
        })
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div
            className="relative h-28 w-28 rounded-full border"
            style={{ borderColor: "rgba(255,184,77,0.18)" }}
          >
            <div
              className="absolute inset-4 rounded-full border"
              style={{ borderColor: "rgba(255,184,77,0.12)" }}
            />
            <div
              className="absolute left-1/2 top-3 h-[calc(100%-24px)] w-px -translate-x-1/2"
              style={{ background: "rgba(255,184,77,0.14)" }}
            />
            <div
              className="absolute left-3 top-1/2 h-px w-[calc(100%-24px)] -translate-y-1/2"
              style={{ background: "rgba(255,184,77,0.14)" }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "rgba(255,184,77,0.4)" }}
            />
          </div>
          <div>
            <p
              className="font-display text-xs uppercase tracking-[0.18em]"
              style={{ color: palette.inkMuted }}
            >
              Expedition map pending
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6" style={{ color: "rgba(232,168,80,0.66)" }}>
              No landmarks have been charted for this period yet.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes journeyFrontierPulse {
          0%,
          100% {
            transform: translateY(0) scale(1);
            box-shadow:
              0 0 0 12px rgba(255, 184, 77, 0.12),
              0 0 42px rgba(255, 184, 77, 0.36);
          }
          50% {
            transform: translateY(-2px) scale(1.015);
            box-shadow:
              0 0 0 14px rgba(255, 184, 77, 0.16),
              0 0 54px rgba(255, 208, 128, 0.4);
          }
        }

        @keyframes journeyBeaconDrift {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-1px);
          }
        }
      `}</style>
    </div>
  );
};
