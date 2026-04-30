"use client";

import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";

export type AnalysisChamberDrawer = "evidence" | "case-detail" | "validation";

export interface AnalysisChamberUrlState {
  category: string | null;
  dimension: string | null;
  caseId: string | null;
  milestone: string | null;
  drawer: AnalysisChamberDrawer | null;
  highlight: string | null;
}

export const useAnalysisChamberUrlState = () => {
  const { state, updateQuery } = useAnalysisChamberRouteState();

  const normalizedState: AnalysisChamberUrlState = {
    category: state.category,
    dimension: state.dimension,
    caseId: state.caseId,
    milestone: state.milestone,
    drawer:
      state.drawer === "evidence" ||
      state.drawer === "case-detail" ||
      state.drawer === "validation"
        ? state.drawer
        : null,
    highlight: state.highlight,
  };

  return {
    state: normalizedState,
    updateState: updateQuery,
  };
};
