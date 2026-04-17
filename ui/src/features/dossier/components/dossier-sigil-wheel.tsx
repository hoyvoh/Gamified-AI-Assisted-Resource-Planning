"use client";

import { TYPO } from "@/features/dossier/constants/dossier.constants";
import {
  DOSSIER_SCREEN_CHAPTERS,
  DOSSIER_SCREEN_COPY,
  DOSSIER_SCREEN_PALETTE,
} from "@/features/dossier/constants/dossier-screen.constants";

interface DossierSigilWheelProps {
  activeIndex: number;
  onSelectChapter: (index: number) => void;
}

const ORBIT_FRAME = {
  centerX: -124,
  centerY: 188,
  focusAngle: 0,
  height: 388,
  radius: 176,
  width: 280,
} as const;

const SIGIL_SIZE_PX = 56;
const SIGIL_STEP_RAD = 0.34;
const ACTIVE_ORB_SCALE = 1.08;

const polarToCartesian = (angle: number) => ({
  x: ORBIT_FRAME.centerX + Math.cos(angle) * ORBIT_FRAME.radius,
  y: ORBIT_FRAME.centerY + Math.sin(angle) * ORBIT_FRAME.radius,
});

const getMarkerPosition = (relativeIndex: number) => {
  const angle = ORBIT_FRAME.focusAngle + relativeIndex * SIGIL_STEP_RAD;
  const point = polarToCartesian(angle);

  return {
    angle,
    left: point.x - SIGIL_SIZE_PX / 2,
    opacity: Math.max(0.28, 1 - Math.abs(relativeIndex) * 0.16),
    top: point.y - SIGIL_SIZE_PX / 2,
  };
};

const getArcPath = () => {
  const topPoint = polarToCartesian(-SIGIL_STEP_RAD * 2.35);
  const bottomPoint = polarToCartesian(SIGIL_STEP_RAD * 2.35);

  return `M ${topPoint.x} ${topPoint.y} A ${ORBIT_FRAME.radius} ${ORBIT_FRAME.radius} 0 0 1 ${bottomPoint.x} ${bottomPoint.y}`;
};

export const DossierSigilWheel = ({
  activeIndex,
  onSelectChapter,
}: DossierSigilWheelProps) => {
  const activeChapter = DOSSIER_SCREEN_CHAPTERS[activeIndex];
  const activePosition = getMarkerPosition(0);

  return (
    <div className="relative flex w-full max-w-[17rem] flex-col gap-5 pt-3">
      <div className="pl-1">
        <p
          style={{
            color: DOSSIER_SCREEN_PALETTE.icyBlue,
            fontSize: TYPO.eyebrow.fontSize,
            letterSpacing: TYPO.eyebrow.letterSpacing,
            lineHeight: TYPO.eyebrow.lineHeight,
          }}
        >
          {DOSSIER_SCREEN_COPY.leftRailLabel}
        </p>
        <p
          className="mt-1.5 max-w-[12rem]"
          style={{
            color: DOSSIER_SCREEN_PALETTE.textMuted,
            fontSize: TYPO.bodySm.fontSize,
            lineHeight: TYPO.bodySm.lineHeight,
          }}
        >
          Scroll locks the chamber and rotates the chapter sigils around the
          operative.
        </p>
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          height: `${ORBIT_FRAME.height}px`,
          width: `${ORBIT_FRAME.width}px`,
        }}
      >
        <svg
          className="absolute inset-0"
          fill="none"
          viewBox={`0 0 ${ORBIT_FRAME.width} ${ORBIT_FRAME.height}`}
        >
          <defs>
            <linearGradient
              id="dossierSigilOrbitGradient"
              x1="0"
              x2="0"
              y1="0"
              y2={ORBIT_FRAME.height}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(167,239,255,0.02)" />
              <stop offset="18%" stopColor="rgba(167,239,255,0.16)" />
              <stop offset="52%" stopColor="rgba(167,239,255,0.32)" />
              <stop offset="84%" stopColor="rgba(167,239,255,0.14)" />
              <stop offset="100%" stopColor="rgba(167,239,255,0.02)" />
            </linearGradient>
          </defs>
          <path d={getArcPath()} stroke="url(#dossierSigilOrbitGradient)" strokeWidth="1.5" />
        </svg>

        {DOSSIER_SCREEN_CHAPTERS.map((chapter, index) => {
          if (index === activeIndex) {
            return null;
          }

          const relativeIndex = index - activeIndex;
          const marker = getMarkerPosition(relativeIndex);

          return (
            <button
              key={chapter.id}
              className="absolute flex items-center justify-center rounded-full transition-[left,top,opacity,transform] duration-500 ease-out hover:scale-105"
              onClick={() => onSelectChapter(index)}
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(8,17,27,0.92) 66%)",
                border: "1px solid rgba(167,239,255,0.1)",
                boxShadow: "inset 0 0 10px rgba(255,255,255,0.02)",
                color: DOSSIER_SCREEN_PALETTE.textDim,
                height: `${SIGIL_SIZE_PX}px`,
                left: `${marker.left}px`,
                opacity: marker.opacity,
                top: `${marker.top}px`,
                width: `${SIGIL_SIZE_PX}px`,
                zIndex: DOSSIER_SCREEN_CHAPTERS.length - Math.abs(relativeIndex),
              }}
              type="button"
              aria-label={`Switch to ${chapter.title}`}
              aria-pressed="false"
            >
              <span
                style={{
                  color: DOSSIER_SCREEN_PALETTE.textDim,
                  fontSize: TYPO.badge.fontSize,
                  letterSpacing: TYPO.badge.letterSpacing,
                  lineHeight: TYPO.badge.lineHeight,
                }}
              >
                {chapter.icon}
              </span>
            </button>
          );
        })}

        <button
          className="absolute flex items-center gap-4 text-left transition-[left,top] duration-500 ease-out"
          onClick={() => onSelectChapter(activeIndex)}
          style={{
            left: `${activePosition.left}px`,
            top: `${activePosition.top}px`,
            zIndex: DOSSIER_SCREEN_CHAPTERS.length + 2,
          }}
          type="button"
          aria-label={`Switch to ${activeChapter.title}`}
          aria-pressed="true"
        >
          <span
            className="relative flex items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(8,17,27,0.58) 0%, rgba(8,17,27,0.94) 68%)",
              border: `1.5px solid ${activeChapter.accentColor}`,
              boxShadow: `0 0 32px ${activeChapter.accentColor}42, inset 0 0 18px ${activeChapter.accentColor}20`,
              height: `${SIGIL_SIZE_PX}px`,
              transform: `scale(${ACTIVE_ORB_SCALE})`,
              width: `${SIGIL_SIZE_PX}px`,
            }}
          >
            <span
              className="absolute inset-[-7px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${activeChapter.accentColor}28 0%, transparent 72%)`,
                filter: "blur(5px)",
                zIndex: -1,
              }}
            />
            <span
              style={{
                color: activeChapter.accentColor,
                fontSize: TYPO.badge.fontSize,
                letterSpacing: TYPO.badge.letterSpacing,
                lineHeight: TYPO.badge.lineHeight,
                textShadow: `0 0 12px ${activeChapter.accentColor}70`,
              }}
            >
              {activeChapter.icon}
            </span>
          </span>

          <span
            className="relative overflow-hidden rounded-full border px-5 py-3"
            style={{
              background:
                "linear-gradient(90deg, rgba(105, 181, 214, 0.26) 0%, rgba(53, 115, 146, 0.16) 38%, rgba(9,18,29,0.06) 100%)",
              borderColor: `${activeChapter.accentColor}48`,
              boxShadow: `0 0 28px ${activeChapter.accentColor}1f, inset 0 0 16px rgba(255,255,255,0.06)`,
              minWidth: "9.5rem",
            }}
          >
            <span
              className="absolute inset-y-[20%] left-0 w-9"
              style={{
                background: `linear-gradient(90deg, ${activeChapter.accentColor}40 0%, transparent 100%)`,
                filter: "blur(10px)",
              }}
            />
            <span
              className="relative block font-display uppercase"
              style={{
                color: DOSSIER_SCREEN_PALETTE.text,
                fontSize: "16px",
                letterSpacing: "0.08em",
                lineHeight: "1.1",
                textShadow: `0 0 20px ${activeChapter.accentColor}22`,
              }}
            >
              {activeChapter.title}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};
