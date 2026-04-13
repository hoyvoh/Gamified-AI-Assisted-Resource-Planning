"use client";

import {
  DOSSIER_COLORS,
  DOSSIER_MOTION,
} from "@/features/dossier/constants/dossier.constants";
import { useDossierLayerMotion } from "@/features/dossier/hooks/use-dossier-layer-motion";
import type { DimensionDetailResponse } from "@/features/dossier/types/dossier.types";

interface EvidenceDrawerProps {
  data: DimensionDetailResponse | null;
  errorMessage?: string | null;
  isLoading: boolean;
  isOpen: boolean;
  selectedDimensionId: string | null;
  onClose: () => void;
}

export const EvidenceDrawer = ({
  data,
  errorMessage,
  isLoading,
  isOpen,
  selectedDimensionId,
  onClose,
}: EvidenceDrawerProps) => {
  const {
    backdropRef,
    containerRef,
    isMounted,
    panelRef,
    registerItem,
  } = useDossierLayerMotion({
    isOpen,
    axis: "x",
    panelOffset: DOSSIER_MOTION.drawerOffset,
    panelBlur: DOSSIER_MOTION.drawerBlur,
    panelScaleFrom: DOSSIER_MOTION.drawerScaleFrom,
    backdropDuration: DOSSIER_MOTION.drawerBackdropDuration,
    panelEnterDuration: DOSSIER_MOTION.drawerDeployDuration,
    panelExitDuration: DOSSIER_MOTION.drawerRetractDuration,
    itemOffset: DOSSIER_MOTION.drawerCardOffset,
    itemDuration: DOSSIER_MOTION.drawerBackdropDuration,
    itemStagger: DOSSIER_MOTION.drawerCardStagger,
  });

  if (!isMounted) {
    return null;
  }

  const sections = data
    ? [
        {
          title: "Supporting Evidence",
          items: data.supportingEvidence.map((item) => item.contentSummary),
        },
        {
          title: "Counter Evidence",
          items: data.counterEvidence.map((item) => item.contentSummary),
        },
        {
          title: "Behavioral Events",
          items: data.behavioralEvents.map(
            (item) => item.eventSummary ?? item.whyItMatters ?? item.eventType,
          ),
        },
      ]
    : [];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      ref={containerRef}
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0 bg-[#02060b]/68 backdrop-blur-[2px]"
        ref={backdropRef}
      />
      <aside
        className="pointer-events-auto absolute bottom-4 right-4 top-4 w-[min(440px,calc(100vw-2rem))] rounded-[28px] border px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
        ref={panelRef}
        style={{
          borderColor: `${DOSSIER_COLORS.primary}30`,
          background:
            "linear-gradient(180deg, rgba(8, 16, 28, 0.96), rgba(6, 12, 20, 0.92))",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.26em]"
              style={{ color: DOSSIER_COLORS.textMuted }}
            >
              Evidence Layer
            </p>
            <h3
              className="mt-2 font-display text-xl uppercase tracking-[0.12em]"
              style={{ color: DOSSIER_COLORS.text }}
            >
              Trace console
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: DOSSIER_COLORS.textDim }}
            >
              Active dimension: {selectedDimensionId ?? "none selected"}
            </p>
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

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div
              className="rounded-[18px] border px-4 py-4"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <p className="text-sm leading-6" style={{ color: DOSSIER_COLORS.text }}>
                Loading evidence surface...
              </p>
            </div>
          ) : errorMessage ? (
            <div
              className="rounded-[18px] border px-4 py-4"
              style={{
                borderColor: "rgba(252, 165, 165, 0.3)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <p className="text-sm leading-6" style={{ color: "#fca5a5" }}>
                {errorMessage}
              </p>
            </div>
          ) : (
            sections.map((section, index) => (
              <div
                key={section.title}
                className="rounded-[18px] border px-4 py-4"
                ref={registerItem(index)}
                style={{
                  borderColor: "rgba(255,255,255,0.06)",
                  backgroundColor: "rgba(255,255,255,0.03)",
                }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: DOSSIER_COLORS.primarySoft }}
                >
                  {section.title}
                </p>
                <div className="mt-3 space-y-3">
                  {section.items.length > 0 ? (
                    section.items.map((item) => (
                      <p
                        key={item}
                        className="text-sm leading-6"
                        style={{ color: DOSSIER_COLORS.text }}
                      >
                        {item}
                      </p>
                    ))
                  ) : (
                    <p
                      className="text-sm leading-6"
                      style={{ color: DOSSIER_COLORS.textDim }}
                    >
                      No evidence available.
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};
