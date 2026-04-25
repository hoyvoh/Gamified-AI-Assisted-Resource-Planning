"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAnalysisRunById,
  getMemberAnalysisRuns,
  triggerAnalysis,
} from "@/features/analysis-chamber/api/analysis-chamber-api";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const SCAN_LOBBY_KEYS = {
  history: (memberId: string) =>
    ["scan-lobby", memberId, "history"] as const,
  run: (runId: string) => ["scan-lobby", "run", runId] as const,
};

// ─── Run history ──────────────────────────────────────────────────────────────

export const useMemberRunHistory = (memberId: string) =>
  useQuery({
    queryKey: SCAN_LOBBY_KEYS.history(memberId),
    queryFn: () => getMemberAnalysisRuns(memberId, 10),
    staleTime: 15_000,
  });

// ─── Polling a specific run by ID ─────────────────────────────────────────────

export const useAnalysisRunPolling = (runId: string | null) =>
  useQuery({
    queryKey: SCAN_LOBBY_KEYS.run(runId ?? "__none__"),
    queryFn: () => getAnalysisRunById(runId!),
    enabled: !!runId,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return 3_000;
      return status === "completed" || status === "failed" ? false : 3_000;
    },
  });

// ─── Trigger new scan ─────────────────────────────────────────────────────────

export const useTriggerNewScan = (memberId: string) => {
  const qc = useQueryClient();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      periodStart,
      periodEnd,
    }: {
      periodStart: string;
      periodEnd: string;
    }) => triggerAnalysis(memberId, periodStart, periodEnd),
    onSuccess: (run) => {
      setActiveRunId(run.analysis_run_id);
      void qc.invalidateQueries({
        queryKey: SCAN_LOBBY_KEYS.history(memberId),
      });
    },
  });

  return { mutation, activeRunId, setActiveRunId };
};
