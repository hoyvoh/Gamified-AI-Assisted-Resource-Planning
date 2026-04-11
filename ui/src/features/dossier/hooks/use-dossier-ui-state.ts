"use client";

import { useState } from "react";

import type { DossierTab } from "@/features/dossier/types/dossier.types";

interface UseDossierUiStateReturn {
  activeTab: DossierTab;
  isEvidenceOpen: boolean;
  isReviewOpen: boolean;
  selectedDimensionId: string | null;
  setActiveTab: (tab: DossierTab) => void;
  openEvidence: () => void;
  closeEvidence: () => void;
  openReview: () => void;
  closeReview: () => void;
  setSelectedDimensionId: (dimensionId: string | null) => void;
}

export const useDossierUiState = (): UseDossierUiStateReturn => {
  const [activeTab, setActiveTab] = useState<DossierTab>("overview");
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);

  return {
    activeTab,
    isEvidenceOpen,
    isReviewOpen,
    selectedDimensionId,
    setActiveTab,
    openEvidence: () => setIsEvidenceOpen(true),
    closeEvidence: () => setIsEvidenceOpen(false),
    openReview: () => setIsReviewOpen(true),
    closeReview: () => setIsReviewOpen(false),
    setSelectedDimensionId,
  };
};
