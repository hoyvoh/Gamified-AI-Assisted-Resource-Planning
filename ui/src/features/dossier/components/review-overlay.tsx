"use client";

import { useEffect, useState } from "react";

import {
  DOSSIER_COLORS,
  DOSSIER_MOTION,
} from "@/features/dossier/constants/dossier.constants";
import { useDossierLayerMotion } from "@/features/dossier/hooks/use-dossier-layer-motion";
import type { ValidationFlag } from "@/features/dossier/types/dossier.types";

interface ReviewOverlayProps {
  errorMessage?: string | null;
  existingFlag: ValidationFlag | null;
  isOpen: boolean;
  isSubmitting: boolean;
  selectedDimensionId: string | null;
  onClose: () => void;
  onSubmit: (input: {
    dimensionId: string;
    note: string | null;
    verdict: "accurate" | "questionable" | "incorrect";
  }) => void;
}

const VERDICTS = [
  { label: "Accurate", value: "accurate" },
  { label: "Questionable", value: "questionable" },
  { label: "Incorrect", value: "incorrect" },
] as const;

export const ReviewOverlay = ({
  errorMessage,
  existingFlag,
  isOpen,
  isSubmitting,
  selectedDimensionId,
  onClose,
  onSubmit,
}: ReviewOverlayProps) => {
  const [note, setNote] = useState("");
  const [verdict, setVerdict] = useState<
    "accurate" | "questionable" | "incorrect"
  >("questionable");
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

  useEffect(() => {
    if (isOpen) {
      setVerdict(existingFlag?.verdict ?? "questionable");
      setNote(existingFlag?.note ?? "");
    }
  }, [existingFlag, isOpen]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-4"
      ref={containerRef}
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0 bg-[#02060b]/72 backdrop-blur-[3px]"
        ref={backdropRef}
      />
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
              Validation flow
            </h3>
            <p className="mt-2 text-sm" style={{ color: DOSSIER_COLORS.textDim }}>
              Selected dimension: {selectedDimensionId ?? "none"}
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div
            className="rounded-[18px] border px-4 py-4"
            ref={registerItem(0)}
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: DOSSIER_COLORS.warning }}
            >
              Verdict
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {VERDICTS.map((option) => (
                <button
                  key={option.value}
                  className="rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.18em]"
                  onClick={() => setVerdict(option.value)}
                  style={{
                    borderColor:
                      verdict === option.value
                        ? `${DOSSIER_COLORS.warningGlow}60`
                        : "rgba(255,255,255,0.08)",
                    color:
                      verdict === option.value
                        ? DOSSIER_COLORS.warningGlow
                        : DOSSIER_COLORS.textDim,
                    backgroundColor:
                      verdict === option.value
                        ? "rgba(255, 181, 71, 0.12)"
                        : "rgba(255,255,255,0.03)",
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-[18px] border px-4 py-4"
            ref={registerItem(1)}
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: DOSSIER_COLORS.textDim }}
            >
              Existing flag
            </p>
            <p className="mt-3 text-sm leading-6" style={{ color: DOSSIER_COLORS.text }}>
              {existingFlag
                ? `${existingFlag.verdict.toUpperCase()}${existingFlag.note ? ` - ${existingFlag.note}` : ""}`
                : "No validation flag recorded yet."}
            </p>
          </div>
        </div>

        <div
          className="mt-4 rounded-[18px] border px-4 py-4"
          ref={registerItem(2)}
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: DOSSIER_COLORS.textDim }}
          >
            Note
          </p>
          <textarea
            className="mt-3 min-h-28 w-full rounded-[16px] border border-white/8 bg-black/10 px-3 py-3 text-sm outline-none"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add review context for this dimension"
            style={{ color: DOSSIER_COLORS.text }}
            value={note}
          />
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm" style={{ color: "#fca5a5" }}>
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            className="rounded-full border px-4 py-2.5 text-sm uppercase tracking-[0.18em] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || selectedDimensionId === null}
            onClick={() => {
              if (selectedDimensionId) {
                onSubmit({
                  dimensionId: selectedDimensionId,
                  note: note.trim() ? note.trim() : null,
                  verdict,
                });
              }
            }}
            style={{
              borderColor: `${DOSSIER_COLORS.warningGlow}55`,
              backgroundColor: "rgba(255, 181, 71, 0.12)",
              color: DOSSIER_COLORS.text,
            }}
            type="button"
          >
            {isSubmitting ? "Saving..." : "Save Review"}
          </button>
        </div>
      </section>
    </div>
  );
};
