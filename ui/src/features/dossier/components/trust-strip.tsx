"use client";

import { CONTRAST, TYPO } from "@/features/dossier/constants/dossier.constants";
import type { DossierTrustStripViewModel } from "@/features/dossier/types/dossier.types";

interface TrustStripProps {
  trust: DossierTrustStripViewModel;
  onOpenReview?: () => void;
}

export const TrustStrip = ({ trust, onOpenReview }: TrustStripProps) => {
  const reviewTone =
    trust.reviewLabel === "Required"
      ? CONTRAST.warningGlow
      : CONTRAST.successGlow;
  const flaggedCount = Number.parseInt(trust.flaggedLabel, 10);
  const flaggedTone =
    Number.isNaN(flaggedCount) || flaggedCount === 0
      ? CONTRAST.successGlow
      : CONTRAST.warningGlow;

  return (
    <div
      className="grid gap-2.5 rounded-[14px] border px-4 py-3"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3">
        {/* Confidence — emerald glow for trust */}
        <div>
          <p
            style={{
              fontSize: TYPO.eyebrow.fontSize,
              lineHeight: TYPO.eyebrow.lineHeight,
              letterSpacing: TYPO.eyebrow.letterSpacing,
              color: CONTRAST.textTertiary,
            }}
          >
            Confidence
          </p>
          <p
            className="mt-1 font-semibold leading-none"
            style={{
              fontSize: TYPO.valueMd.fontSize,
              lineHeight: TYPO.valueMd.lineHeight,
              color: CONTRAST.confidence,
              textShadow: `0 0 12px ${CONTRAST.confidence}, 0 0 24px ${CONTRAST.confidence}40`,
            }}
          >
            {trust.confidenceLabel}
          </p>
        </div>
        {/* Flagged — amber beacon for attention */}
        <div>
          <p
            style={{
              fontSize: TYPO.eyebrow.fontSize,
              lineHeight: TYPO.eyebrow.lineHeight,
              letterSpacing: TYPO.eyebrow.letterSpacing,
              color: CONTRAST.textTertiary,
            }}
          >
            Flagged
          </p>
          <p
            className="mt-1 font-semibold leading-none"
            style={{
              fontSize: TYPO.valueMd.fontSize,
              lineHeight: TYPO.valueMd.lineHeight,
              color: flaggedTone,
              textShadow:
                flaggedCount > 0
                  ? `0 0 12px ${flaggedTone}, 0 0 24px ${flaggedTone}40`
                  : "none",
            }}
          >
            {trust.flaggedLabel}
          </p>
        </div>
        {/* Review — dynamic color */}
        <div>
          <p
            style={{
              fontSize: TYPO.eyebrow.fontSize,
              lineHeight: TYPO.eyebrow.lineHeight,
              letterSpacing: TYPO.eyebrow.letterSpacing,
              color: CONTRAST.textTertiary,
            }}
          >
            Review
          </p>
          <p
            className="mt-1 font-semibold uppercase leading-none"
            style={{
              fontSize: TYPO.valueSm.fontSize,
              lineHeight: TYPO.valueSm.lineHeight,
              letterSpacing: TYPO.valueSm.letterSpacing,
              color: reviewTone,
            }}
          >
            {trust.reviewLabel}
          </p>
        </div>
        <button
          className="rounded-full border px-3.5 py-2 text-left transition duration-300 hover:-translate-y-0.5"
          style={{
            borderColor: `${reviewTone}40`,
            backgroundColor: `${reviewTone}12`,
          }}
          onClick={onOpenReview}
          type="button"
        >
          <span
            style={{
              fontSize: TYPO.badge.fontSize,
              lineHeight: TYPO.badge.lineHeight,
              letterSpacing: TYPO.badge.letterSpacing,
              color: reviewTone,
            }}
          >
            Validate
          </span>
        </button>
      </div>
    </div>
  );
};
