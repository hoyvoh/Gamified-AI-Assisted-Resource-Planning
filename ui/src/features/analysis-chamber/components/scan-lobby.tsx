"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { getAnalysisChamberBootstrap } from "@/features/analysis-chamber/api/analysis-chamber-api";

import type { ChamberAnalysisRun } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

import {
  useAnalysisRunPolling,
  useMemberRunHistory,
  useTriggerNewScan,
} from "@/features/analysis-chamber/hooks/use-scan-lobby";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const isActiveRun = (status: string) =>
  status !== "completed" && status !== "failed";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  collecting: "Collecting",
  analyzing: "Analyzing",
  completed: "Completed",
  failed: "Failed",
};

const STAGES = ["pending", "collecting", "analyzing", "completed"] as const;

// ─── Progress stepper ─────────────────────────────────────────────────────────

function ProgressStepper({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STAGES.findIndex((s) => s === currentStatus);

  return (
    <div className="flex items-center gap-2">
      {STAGES.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={stage} className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                done
                  ? "bg-green-400"
                  : active
                    ? "bg-blue-400 animate-pulse"
                    : "bg-white/20"
              }`}
            />
            <span
              className={`font-mono text-[10px] uppercase tracking-widest ${
                active ? "text-blue-400" : done ? "text-white/50" : "text-white/20"
              }`}
            >
              {stage}
            </span>
            {i < STAGES.length - 1 && (
              <span className="text-white/15">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Active run progress box ──────────────────────────────────────────────────

function ActiveRunProgress({ runId }: { runId: string }) {
  const { data: run } = useAnalysisRunPolling(runId);

  if (!run) {
    return (
      <div className="rounded-md border border-blue-400/20 bg-blue-400/5 p-4">
        <p className="font-mono text-xs text-blue-400/60">
          Starting scan...
        </p>
      </div>
    );
  }

  const isFailed = run.status === "failed";
  const isCompleted = run.status === "completed";

  return (
    <div
      className={`rounded-md border p-4 ${
        isFailed
          ? "border-red-400/20 bg-red-400/5"
          : isCompleted
            ? "border-green-400/20 bg-green-400/5"
            : "border-blue-400/20 bg-blue-400/5"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
          Current scan
        </span>
        <span
          className={`font-mono text-xs ${
            isFailed
              ? "text-red-400"
              : isCompleted
                ? "text-green-400"
                : "text-blue-400"
          }`}
        >
          {STATUS_LABEL[run.status] ?? run.status}
          {!isFailed && !isCompleted && ` — ${run.progressPct}%`}
        </span>
      </div>

      {!isFailed && !isCompleted && (
        <>
          {/* Progress bar */}
          <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-500"
              style={{ width: `${run.progressPct}%` }}
            />
          </div>

          {/* Stage label */}
          {run.progressStage && (
            <p className="mb-3 font-mono text-xs text-white/40">
              {run.progressStage}
            </p>
          )}

          {/* Stepper */}
          <ProgressStepper currentStatus={run.status} />
        </>
      )}

      {isCompleted && (
        <p className="mt-1 font-mono text-xs text-green-400/70">
          Scan complete. View profile to see results.
        </p>
      )}

      {isFailed && run.errorMessage && (
        <p className="mt-1 font-mono text-xs text-red-400/70">
          {run.errorMessage}
        </p>
      )}

      {/* Period */}
      <p className="mt-3 font-mono text-[10px] text-white/25">
        {run.periodStart} → {run.periodEnd}
      </p>
    </div>
  );
}

// ─── History row ──────────────────────────────────────────────────────────────

function RunHistoryRow({
  run,
  memberId,
}: {
  run: ChamberAnalysisRun;
  memberId: string;
}) {
  const isActive = isActiveRun(run.status);

  if (isActive) {
    // Active runs are shown in ActiveRunProgress box above
    return null;
  }

  const isCompleted = run.status === "completed";
  const isFailed = run.status === "failed";

  return (
    <div className="flex items-center justify-between gap-4 rounded border border-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            isCompleted
              ? "bg-green-400"
              : isFailed
                ? "bg-red-400"
                : "bg-white/20"
          }`}
        />
        <div>
          <p className="font-mono text-xs text-white/70">
            {run.periodStart} → {run.periodEnd}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-white/30">
            {STATUS_LABEL[run.status] ?? run.status}
            {run.completedAt && ` · ${run.completedAt.slice(0, 10)}`}
          </p>
          {isFailed && run.errorMessage && (
            <p className="mt-0.5 font-mono text-[10px] text-red-400/70">
              {run.errorMessage}
            </p>
          )}
        </div>
      </div>

      {isCompleted && (
        <Link
          href={`/profile/${memberId}`}
          className="shrink-0 rounded border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/60 transition hover:border-white/30 hover:text-white/90"
        >
          View Profile
        </Link>
      )}
    </div>
  );
}

// ─── New scan form ────────────────────────────────────────────────────────────

function NewScanForm({
  memberId,
  disabled,
  onTriggered,
}: {
  memberId: string;
  disabled: boolean;
  onTriggered: (runId: string) => void;
}) {
  const [periodStart, setPeriodStart] = useState(daysAgo(90));
  const [periodEnd, setPeriodEnd] = useState(today());

  const { mutation, activeRunId } = useTriggerNewScan(memberId);

  useEffect(() => {
    if (activeRunId) onTriggered(activeRunId);
  }, [activeRunId, onTriggered]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || mutation.isPending) return;
    mutation.mutate({ periodStart, periodEnd });
  };

  const inputCls =
    "w-full rounded border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white/80 outline-none transition placeholder:text-white/20 focus:border-white/25 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-white/40"
            htmlFor="scan-period-start"
          >
            Period start
          </label>
          <input
            id="scan-period-start"
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            disabled={disabled || mutation.isPending}
            className={inputCls}
          />
        </div>
        <div>
          <label
            className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-white/40"
            htmlFor="scan-period-end"
          >
            Period end
          </label>
          <input
            id="scan-period-end"
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            disabled={disabled || mutation.isPending}
            className={inputCls}
          />
        </div>
      </div>

      {mutation.isError && (
        <p className="font-mono text-xs text-red-400">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Failed to trigger scan."}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || mutation.isPending}
        title={disabled ? "A scan is already running" : undefined}
        className="flex w-full items-center justify-center gap-2 rounded border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-white/70 transition hover:border-white/25 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {mutation.isPending ? "Starting..." : "▶ Start New Scan"}
      </button>
    </form>
  );
}

// ─── Main lobby component ─────────────────────────────────────────────────────

export function ScanLobby({ memberId }: { memberId: string }) {
  const { data: bootstrap } = useQuery({
    queryKey: ["analysis-chamber", memberId, "bootstrap"],
    queryFn: () => getAnalysisChamberBootstrap(memberId),
    staleTime: 60_000,
  });

  const { data: history, isLoading: historyLoading } =
    useMemberRunHistory(memberId);

  // Find any active run from history to resume polling on page load
  const activeFromHistory = history?.find((r) => isActiveRun(r.status));
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Set activeRunId from history once loaded (only if not already set by trigger)
  useEffect(() => {
    if (activeFromHistory && !activeRunId) {
      setActiveRunId(activeFromHistory.id);
    }
  }, [activeFromHistory, activeRunId]);

  const hasCompletedRun = history?.some((r) => r.status === "completed");
  const isRunActive = !!activeRunId;

  const member = bootstrap?.member;
  const displayName = member?.displayName ?? memberId;
  const roleName = bootstrap?.roleName;
  const teamName = bootstrap?.teamName;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-white/90">{displayName}</h2>
          <p className="mt-1 font-mono text-xs text-white/40">
            {[roleName, teamName].filter(Boolean).join(" · ")}
            {member?.externalId && (
              <span className="ml-2 text-white/25">@{member.externalId}</span>
            )}
          </p>
        </div>

        {hasCompletedRun && (
          <Link
            href={`/profile/${memberId}`}
            className="shrink-0 rounded border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-white/60 transition hover:border-white/30 hover:text-white/90"
          >
            View Profile →
          </Link>
        )}
      </div>

      {/* Active run progress (shown when there's a running scan) */}
      {activeRunId && <ActiveRunProgress runId={activeRunId} />}

      {/* Scan history */}
      <section>
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
          Scan History
        </h3>

        {historyLoading && (
          <p className="font-mono text-xs text-white/30">
            Loading history...
          </p>
        )}

        {!historyLoading && history && history.length === 0 && (
          <p className="rounded border border-white/5 px-4 py-6 text-center font-mono text-xs text-white/30">
            No scans yet. Start a new scan below.
          </p>
        )}

        {history && history.length > 0 && (
          <div className="space-y-2">
            {history.map((run) => (
              <RunHistoryRow key={run.id} run={run} memberId={memberId} />
            ))}
          </div>
        )}
      </section>

      {/* New scan form */}
      <section>
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
          New Scan
        </h3>
        <NewScanForm
          memberId={memberId}
          disabled={isRunActive}
          onTriggered={(id) => setActiveRunId(id)}
        />
      </section>
    </div>
  );
}
