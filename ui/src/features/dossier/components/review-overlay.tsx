"use client";

import {
  DOSSIER_COLORS,
  DOSSIER_MOTION,
} from "@/features/dossier/constants/dossier.constants";
import { useDossierLayerMotion } from "@/features/dossier/hooks/use-dossier-layer-motion";

interface ReviewOverlayProps {
  isOpen: boolean;
  selectedDimensionId: string | null;
  onClose: () => void;
}

const REVIEW_PLACEHOLDER_ITEMS = [
  "Amber pulses and chamber fractures should connect this review state back to the chamber visuals.",
  "Validation form and reviewer intent should live here rather than scattering flags across the screen.",
  "The active dossier surface should stay visible beneath this layer.",
] as const;

export const ReviewOverlay = ({
  isOpen,
  selectedDimensionId,
  onClose,
}: ReviewOverlayProps) => {
  const {
    backdropRef,
    containerRef,
    isMounted,
    panelRef,
    registerItem,
  } = useDossierLayerMotion({
    isOpen,
    axis: "y",
    panelOffset: DOSSIER_MOTION.reviewOffset,
    panelBlur: DOSSIER_MOTION.reviewBlur,
    panelScaleFrom: DOSSIER_MOTION.reviewScaleFrom,
    backdropDuration: DOSSIER_MOTION.reviewBackdropDuration,
    panelEnterDuration: DOSSIER_MOTION.reviewDeployDuration,
    panelExitDuration: DOSSIER_MOTION.reviewRetractDuration,
    itemOffset: DOSSIER_MOTION.reviewCardOffset,
    itemDuration: DOSSIER_MOTION.reviewBackdropDuration,
    itemStagger: DOSSIER_MOTION.reviewCardStagger,
  });

  if (!isMounted) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-4" ref={containerRef}>
      <div className="absolute inset-0 bg-[#02060b]/72 backdrop-blur-[3px]" ref={backdropRef} />
      <section
        className="pointer-events-auto relative w-full max-w-2xl rounded-[30px] border px-6 py-6 shadow-[0_30px_90px_rgba(0,0,0,0.44)]"
        ref={panelRef}
        style={{
          borderColor: `${DOSSIER_COLORS.warning}34`,
          background:
            "linear-gradient(180deg, rgba(18, 13, 8, 0.96), rgba(10, 12, 18, 0.92))",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.26em]"
              style={{ color: DOSSIER_COLORS.warning }}
            >
              Review Layer
            </p>
            <h3
              className="mt-2 font-display text-xl uppercase tracking-[0.12em]"
              style={{ color: DOSSIER_COLORS.text }}
            >
              Validation flow placeholder
            </h3>
          </div>
          <button
            className="rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              color: DOSSIER_COLORS.textDim,
            }}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[`Selected dimension: ${selectedDimensionId ?? "none"}`, ...REVIEW_PLACEHOLDER_ITEMS].map((item, index) => (
            <div
              key={item}
              className="rounded-[18px] border px-4 py-4"
              ref={registerItem(index)}
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <p className="text-sm leading-6" style={{ color: DOSSIER_COLORS.text }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
