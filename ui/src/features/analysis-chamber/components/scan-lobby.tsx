"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { animate, stagger } from "animejs";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Compass,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { getAnalysisChamberBootstrap } from "@/features/analysis-chamber/api/analysis-chamber-api";
import type { ChamberAnalysisRun } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { LivingTacticalMap } from "@/features/analysis-chamber/components/scan-lobby/scan-lobby-map";
import type {
  ScanLobbyMode,
  ScanProgressPhase,
  ScanRun,
} from "@/features/analysis-chamber/components/scan-lobby/scan-lobby.types";
import {
  daysAgo,
  formatRunDate,
  getAdvisorCopy,
  getProgressPhase,
  getRecommendedNextAction,
  getRunStatusMeta,
  getScanMode,
  isActiveRun,
  today,
} from "@/features/analysis-chamber/components/scan-lobby/scan-lobby.utils";
import { MAP_ANCHORS } from "@/features/analysis-chamber/components/scan-lobby/map/map-constants";
import {
  useAnalysisRunPolling,
  useMemberRunHistory,
  useTriggerNewScan,
} from "@/features/analysis-chamber/hooks/use-scan-lobby";

const PHASES: ScanProgressPhase[] = [
  "sealing-order",
  "crossing-signal-realm",
  "gathering-fragments",
  "forging-dossier",
  "verdict",
];

const PHASE_LABELS: Record<ScanProgressPhase, string> = {
  "sealing-order": "Seal",
  "crossing-signal-realm": "Cross",
  "gathering-fragments": "Gather",
  "forging-dossier": "Forge",
  verdict: "Verdict",
};

const toneClasses = {
  pending: {
    dot: "bg-amber-200",
    text: "text-amber-100",
    border: "border-amber-200/20",
    bg: "bg-amber-200/5",
  },
  scouting: {
    dot: "bg-sky-300",
    text: "text-sky-200",
    border: "border-sky-300/25",
    bg: "bg-sky-300/5",
  },
  completed: {
    dot: "bg-emerald-300",
    text: "text-emerald-200",
    border: "border-emerald-300/25",
    bg: "bg-emerald-300/5",
  },
  failed: {
    dot: "bg-red-300",
    text: "text-red-200",
    border: "border-red-300/25",
    bg: "bg-red-300/5",
  },
} as const;

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

function useScanLobbyAnimations(reducedMotion: boolean, dependency: unknown) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !rootRef.current) return;

    const cards = rootRef.current.querySelectorAll('[data-animate="chronicle-card"]');
    const panels = rootRef.current.querySelectorAll('[data-animate="panel"]');
    const sourceNodes = rootRef.current.querySelectorAll('[data-animate="source-node"]');

    if (panels.length > 0) {
      animate(panels, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 360,
        delay: stagger(55),
        ease: "outQuad",
      });
    }

    if (cards.length > 0) {
      animate(cards, {
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 420,
        delay: stagger(70),
        ease: "outQuad",
      });
    }

    if (sourceNodes.length > 0) {
      animate(sourceNodes, {
        opacity: [0.42, 1],
        scale: [0.96, 1],
        duration: 520,
        delay: stagger(90),
        ease: "outExpo",
      });
    }
  }, [dependency, reducedMotion]);

  return rootRef;
}

export function ScanLobby({ memberId }: { memberId: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const { data: bootstrap } = useQuery({
    queryKey: ["analysis-chamber", memberId, "bootstrap"],
    queryFn: () => getAnalysisChamberBootstrap(memberId),
    staleTime: 60_000,
  });

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
  } = useMemberRunHistory(memberId);

  const triggerScan = useTriggerNewScan(memberId);
  const activeFromHistory = history?.find((run) => isActiveRun(run.status));
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    if (activeFromHistory?.id) setActiveRunId(activeFromHistory.id);
  }, [activeFromHistory?.id]);

  const { data: polledActiveRun } = useAnalysisRunPolling(activeRunId);
  const historyRuns = history ?? [];
  const selectedRun = historyRuns.find((run) => run.id === selectedRunId);
  const activeRun = polledActiveRun ?? activeFromHistory;
  const displayRun = activeRun ?? selectedRun ?? historyRuns[0];
  const mode = getScanMode({
    history,
    activeRun,
    isDispatching: triggerScan.isPending,
  });
  const phase = activeRun
    ? getProgressPhase(activeRun.status, activeRun.progressPct)
    : "sealing-order";
  const hasActiveRun = !!activeRun && isActiveRun(activeRun.status);
  const hasCompletedRun = historyRuns.some((run) => run.status === "completed");
  const hasHistory = historyRuns.length > 0;
  const member = bootstrap?.member;
  const displayName = member?.displayName ?? memberId;
  const identity = [bootstrap?.roleName, bootstrap?.teamName].filter(Boolean).join(" / ");
  const rootRef = useScanLobbyAnimations(reducedMotion, `${mode}-${historyRuns.length}`);

  const dispatchScan = (periodStart: string, periodEnd: string) => {
    if (hasActiveRun || triggerScan.isPending) return;
    triggerScan.mutate(
      { periodStart, periodEnd },
      {
        onSuccess: (run) => {
          setActiveRunId(run.analysis_run_id);
          setSelectedRunId(null);
        },
      },
    );
  };

  return (
    <div ref={rootRef} className="space-y-6">
      <ScanLobbyHeader
        displayName={displayName}
        identity={identity}
        externalId={member?.externalId}
        mode={mode}
        hasCompletedRun={hasCompletedRun}
        memberId={memberId}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.58fr)]">
        <LivingTacticalMap
          mode={mode}
          phase={phase}
          activeRun={activeRun}
          history={historyRuns}
          reducedMotion={reducedMotion}
        />

        <MissionControlPanel
          memberId={memberId}
          mode={mode}
          activeRun={activeRun}
          displayRun={displayRun}
          disabled={hasActiveRun}
          isDispatching={triggerScan.isPending}
          mutationError={triggerScan.error}
          onDispatch={dispatchScan}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <CampaignChronicle
          memberId={memberId}
          runs={historyRuns}
          isLoading={historyLoading}
          isError={historyError}
          selectedRunId={selectedRunId}
          activeRunId={activeRun?.id}
          isRetryDisabled={hasActiveRun || triggerScan.isPending}
          onSelect={setSelectedRunId}
          onRetry={(run) => dispatchScan(run.periodStart, run.periodEnd)}
        />
        <ScoutAdvisor
          mode={mode}
          activeRun={activeRun}
          selectedRun={selectedRun}
          hasHistory={hasHistory}
          hasCompletedRun={hasCompletedRun}
        />
      </div>
    </div>
  );
}

function ScanLobbyHeader({
  displayName,
  identity,
  externalId,
  mode,
  hasCompletedRun,
  memberId,
}: {
  displayName: string;
  identity: string;
  externalId: string | null | undefined;
  mode: ScanLobbyMode;
  hasCompletedRun: boolean;
  memberId: string;
}) {
  const statusText =
    mode === "failed"
      ? "Repair Required"
      : mode === "success"
        ? "Dossier Fortified"
        : mode === "scouting" || mode === "dispatching"
          ? "Scout In Field"
          : "Chamber Ready";

  return (
    <header
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      data-animate="panel"
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-200/55">
          Scout Dispatch Chamber
        </p>
        <h1 className="mt-2 font-serif text-4xl text-amber-50 md:text-5xl">
          {displayName}
        </h1>
        <p className="mt-2 font-mono text-xs text-white/42">
          {[identity, externalId ? `@${externalId}` : null].filter(Boolean).join(" / ")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-md border border-amber-200/20 bg-amber-200/5 px-4 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">
            Chamber Status
          </p>
          <p className="mt-1 flex items-center gap-2 font-mono text-xs text-amber-100">
            <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />
            {statusText}
          </p>
        </div>
        {hasCompletedRun && (
          <Link
            href={`/profile/${memberId}`}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-200/25 bg-emerald-200/8 px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-100/45 hover:bg-emerald-200/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
          >
            Open Latest Dossier
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </header>
  );
}

function MissionControlPanel({
  memberId,
  mode,
  activeRun,
  displayRun,
  disabled,
  isDispatching,
  mutationError,
  onDispatch,
}: {
  memberId: string;
  mode: ScanLobbyMode;
  activeRun: ScanRun | undefined;
  displayRun: ScanRun | undefined;
  disabled: boolean;
  isDispatching: boolean;
  mutationError: Error | null;
  onDispatch: (periodStart: string, periodEnd: string) => void;
}) {
  return (
    <aside className="space-y-4" data-animate="panel">
      {activeRun && (
        <CurrentMissionStatus activeRun={activeRun} mode={mode} memberId={memberId} />
      )}
      {!activeRun && displayRun?.status === "failed" && (
        <BrokenBannerDetail run={displayRun} />
      )}
      <DispatchOrderForm
        disabled={disabled}
        isDispatching={isDispatching}
        mutationError={mutationError}
        onDispatch={onDispatch}
      />
    </aside>
  );
}

function CurrentMissionStatus({
  activeRun,
  mode,
  memberId,
}: {
  activeRun: ScanRun;
  mode: ScanLobbyMode;
  memberId: string;
}) {
  const meta = getRunStatusMeta(activeRun.status);
  const tone = toneClasses[meta.tone];
  const phase = getProgressPhase(activeRun.status, activeRun.progressPct);
  const currentIndex = PHASES.indexOf(phase);

  return (
    <section className={`rounded-lg border ${tone.border} ${tone.bg} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">
            Current Mission
          </p>
          <h2 className={`mt-2 flex items-center gap-2 text-xl font-semibold ${tone.text}`}>
            {meta.tone === "failed" ? (
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            ) : meta.tone === "completed" ? (
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Compass className="h-5 w-5" aria-hidden="true" />
            )}
            {mode === "dispatching" ? "Sealing Order" : meta.label}
          </h2>
        </div>
        <span className="rounded border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
          {meta.technicalLabel}
        </span>
      </div>

      <p className="mt-3 text-sm text-white/62">{meta.summary}</p>
      {activeRun.progressStage && (
        <p className="mt-2 font-mono text-xs text-white/42">{activeRun.progressStage}</p>
      )}

      {meta.tone !== "failed" && meta.tone !== "completed" && (
        <>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-emerald-300 transition-all duration-500"
              style={{ width: `${Math.max(activeRun.progressPct, 8)}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {PHASES.map((phaseKey, index) => {
              const complete = index <= currentIndex;
              return (
                <div key={phaseKey} className="min-w-0">
                  <div
                    className={`h-1 rounded-full ${
                      complete ? "bg-sky-200" : "bg-white/12"
                    }`}
                  />
                  <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
                    {PHASE_LABELS[phaseKey]}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {meta.tone === "completed" && (
        <Link
          href={`/profile/${memberId}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-200/30 bg-emerald-200/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-100/50 hover:bg-emerald-200/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
        >
          Open Dossier
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}

      {meta.tone === "failed" && activeRun.errorMessage && (
        <p className="mt-4 rounded-md border border-red-300/20 bg-red-950/20 p-3 font-mono text-xs text-red-100/80">
          {activeRun.errorMessage}
        </p>
      )}

      <p className="mt-4 font-mono text-[10px] text-white/30">
        {activeRun.periodStart} - {activeRun.periodEnd}
      </p>
    </section>
  );
}

function BrokenBannerDetail({ run }: { run: ScanRun }) {
  return (
    <section className="rounded-lg border border-red-300/25 bg-red-950/12 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-100/50">
        Required Repair
      </p>
      <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-red-100">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        Broken Banner
      </h2>
      <p className="mt-3 text-sm text-red-50/70">
        The chamber runner could not gather signal from this campaign window.
      </p>
      {run.errorMessage && (
        <p className="mt-3 rounded-md border border-red-300/20 bg-black/25 p-3 font-mono text-xs text-red-100/80">
          {run.errorMessage}
        </p>
      )}
    </section>
  );
}

function DispatchOrderForm({
  disabled,
  isDispatching,
  mutationError,
  onDispatch,
}: {
  disabled: boolean;
  isDispatching: boolean;
  mutationError: Error | null;
  onDispatch: (periodStart: string, periodEnd: string) => void;
}) {
  const [periodStart, setPeriodStart] = useState(daysAgo(90));
  const [periodEnd, setPeriodEnd] = useState(today());
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || isDispatching) return;
    if (!periodStart || !periodEnd) {
      setValidationError("Campaign start and end are required.");
      return;
    }
    if (periodStart > periodEnd) {
      setValidationError("Campaign start must be before campaign end.");
      return;
    }
    setValidationError(null);
    onDispatch(periodStart, periodEnd);
  };

  const inputClass =
    "w-full rounded-md border border-amber-200/15 bg-black/25 px-3 py-2.5 font-mono text-xs text-amber-50 outline-none transition placeholder:text-white/25 focus:border-amber-100/45 focus:bg-black/35 disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <section className="rounded-lg border border-amber-200/20 bg-[#19100d] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/55">
            Dispatch Order
          </p>
          <h2 className="mt-2 font-serif text-2xl text-amber-50">
            Seal a campaign window
          </h2>
        </div>
        <CheckCircle2 className="mt-1 h-5 w-5 text-amber-200/55" aria-hidden="true" />
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block" htmlFor="scan-campaign-start">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-white/38">
              Campaign Start
            </span>
            <input
              id="scan-campaign-start"
              type="date"
              value={periodStart}
              onChange={(event) => setPeriodStart(event.target.value)}
              disabled={disabled || isDispatching}
              className={inputClass}
            />
          </label>
          <label className="block" htmlFor="scan-campaign-end">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-white/38">
              Campaign End
            </span>
            <input
              id="scan-campaign-end"
              type="date"
              value={periodEnd}
              onChange={(event) => setPeriodEnd(event.target.value)}
              disabled={disabled || isDispatching}
              className={inputClass}
            />
          </label>
        </div>

        {(validationError || mutationError) && (
          <p className="rounded-md border border-red-300/20 bg-red-950/20 p-3 font-mono text-xs text-red-100/80">
            {validationError ?? mutationError?.message ?? "Failed to dispatch scout."}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled || isDispatching}
          title={disabled ? "A scan is already running" : undefined}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-amber-200/25 bg-amber-200/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-100/50 hover:bg-amber-200/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 disabled:cursor-not-allowed disabled:opacity-45"
          data-animate="dispatch-button"
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          {isDispatching ? "Sealing Order..." : disabled ? "Scout In Field" : "Dispatch Scout"}
        </button>
      </form>
    </section>
  );
}

function CampaignChronicle({
  memberId,
  runs,
  isLoading,
  isError,
  selectedRunId,
  activeRunId,
  isRetryDisabled,
  onSelect,
  onRetry,
}: {
  memberId: string;
  runs: ChamberAnalysisRun[];
  isLoading: boolean;
  isError: boolean;
  selectedRunId: string | null;
  activeRunId: string | undefined;
  isRetryDisabled: boolean;
  onSelect: (runId: string) => void;
  onRetry: (run: ChamberAnalysisRun) => void;
}) {
  return (
    <section
      className="rounded-lg border border-white/10 bg-[#120c0a] p-5"
      data-animate="panel"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/50">
            Campaign Chronicle
          </p>
          <h2 className="mt-2 font-serif text-2xl text-amber-50">
            Previous scout records
          </h2>
        </div>
        <span className="rounded border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
          {runs.length} records
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading && (
          <p className="rounded-md border border-white/8 bg-white/5 p-5 font-mono text-xs text-white/40">
            Loading campaign records...
          </p>
        )}
        {isError && (
          <p className="rounded-md border border-red-300/20 bg-red-950/15 p-5 font-mono text-xs text-red-100/75">
            Failed to load scan history.
          </p>
        )}
        {!isLoading && !isError && runs.length === 0 && <EmptyChronicleState />}
        {runs.map((run) => (
          <CampaignRecordCard
            key={run.id}
            memberId={memberId}
            run={run}
            selected={run.id === selectedRunId || run.id === activeRunId}
            retryDisabled={isRetryDisabled}
            onSelect={() => onSelect(run.id)}
            onRetry={() => onRetry(run)}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyChronicleState() {
  return (
    <div className="rounded-md border border-dashed border-amber-200/20 bg-amber-200/5 px-5 py-8 text-center">
      <p className="font-serif text-xl text-amber-50">No campaign record yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
        Choose a campaign window and dispatch your first AI scout.
      </p>
    </div>
  );
}

function CampaignRecordCard({
  memberId,
  run,
  selected,
  retryDisabled,
  onSelect,
  onRetry,
}: {
  memberId: string;
  run: ChamberAnalysisRun;
  selected: boolean;
  retryDisabled: boolean;
  onSelect: () => void;
  onRetry: () => void;
}) {
  const meta = getRunStatusMeta(run.status);
  const tone = toneClasses[meta.tone];
  const active = isActiveRun(run.status);
  const [showErrorTrace, setShowErrorTrace] = useState(false);
  const hasLongError = Boolean(run.errorMessage && run.errorMessage.length > 96);

  return (
    <article
      className={`rounded-md border p-4 transition ${
        selected ? `${tone.border} ${tone.bg}` : "border-white/8 bg-white/[0.025]"
      }`}
      data-animate="chronicle-card"
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full cursor-pointer items-start justify-between gap-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
      >
        <div className="flex min-w-0 gap-3">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
          <div className="min-w-0">
            <h3 className={`font-medium ${tone.text}`}>{meta.label}</h3>
            <p className="mt-1 font-mono text-xs text-white/50">
              {run.periodStart} - {run.periodEnd}
            </p>
            <p className="mt-2 text-sm text-white/55">{meta.summary}</p>
            {run.errorMessage && !hasLongError && (
              <p className="mt-2 font-mono text-xs text-red-100/72">
                {run.errorMessage}
              </p>
            )}
            {run.errorMessage && hasLongError && showErrorTrace && (
              <p className="mt-2 rounded border border-red-300/20 bg-black/20 p-2 font-mono text-xs text-red-100/72">
                {run.errorMessage}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 rounded border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
          {active ? `${run.progressPct}%` : formatRunDate(run.completedAt)}
        </span>
      </button>

      <div className="mt-4 flex flex-wrap gap-2 pl-5">
        {run.status === "completed" && (
          <Link
            href={`/profile/${memberId}`}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-200/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-100/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
          >
            Open Dossier
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
        {run.status === "failed" && (
          <>
            <button
              type="button"
              onClick={onRetry}
              disabled={retryDisabled}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-red-200/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-red-100 transition hover:border-red-100/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Send Again
            </button>
            {run.errorMessage && (
              <button
                type="button"
                onClick={() => setShowErrorTrace((current) => !current)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/12 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55 transition hover:border-white/28 hover:text-white/78 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
              >
                {showErrorTrace ? "Hide Error Trace" : "View Error Trace"}
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function ScoutAdvisor({
  mode,
  activeRun,
  selectedRun,
  hasHistory,
  hasCompletedRun,
}: {
  mode: ScanLobbyMode;
  activeRun: ScanRun | undefined;
  selectedRun: ScanRun | undefined;
  hasHistory: boolean;
  hasCompletedRun: boolean;
}) {
  const sourceHealth = getAdvisorSourceHealth(mode, selectedRun ?? activeRun);

  return (
    <aside
      className="rounded-lg border border-white/10 bg-[#120c0a] p-5"
      data-animate="panel"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/50">
        Scout Advisor
      </p>
      <p className="mt-3 text-sm leading-6 text-white/62">
        {getAdvisorCopy({ mode, activeRun, selectedRun, hasHistory })}
      </p>

      <div className="mt-5 rounded-md border border-amber-200/15 bg-amber-200/5 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-200/50">
          Recommended Next Action
        </p>
        <p className="mt-2 text-sm text-amber-50/76">
          {getRecommendedNextAction({ mode, selectedRun, hasCompletedRun })}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <AdvisorMetric label="Dossier" value={hasCompletedRun ? "Ready" : "Pending"} />
        <AdvisorMetric
          label="Motion"
          value={mode === "scouting" || mode === "dispatching" ? "Live" : "Calm"}
        />
      </div>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
          Source Health
        </p>
        <div className="mt-3 space-y-2">
          {sourceHealth.map((source) => (
            <div
              key={source.label}
              className="flex items-center justify-between gap-3 rounded border border-white/8 bg-white/[0.025] px-3 py-2"
            >
              <span className="truncate text-xs text-white/55">{source.label}</span>
              <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${source.className}`}>
                {source.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function getAdvisorSourceHealth(
  mode: ScanLobbyMode,
  run: ScanRun | undefined,
) {
  const sourceLabels = MAP_ANCHORS.map((anchor) => ({
    id: anchor.id,
    label: `${anchor.label} / ${anchor.technicalLabel}`,
  }));

  if (run?.status === "failed" || mode === "failed") {
    return sourceLabels.map((source) => ({
      label: source.label,
      status: source.id === "github" ? "Broken" : "Dormant",
      className: source.id === "github" ? "text-red-100" : "text-white/45",
    }));
  }

  if (run?.status === "completed" || mode === "success") {
    return sourceLabels.map((source) => ({
      label: source.label,
      status: "Sealed",
      className: "text-emerald-100",
    }));
  }

  if (mode === "scouting" || mode === "dispatching") {
    return sourceLabels.map((source) => ({
      label: source.label,
      status: source.id === "github" ? "Watching" : "Dormant",
      className: source.id === "github" ? "text-sky-100" : "text-white/45",
    }));
  }

  return sourceLabels.map((source) => ({
    label: source.label,
    status: "Dormant",
    className: "text-white/45",
  }));
}

function AdvisorMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-amber-50">{value}</p>
    </div>
  );
}
