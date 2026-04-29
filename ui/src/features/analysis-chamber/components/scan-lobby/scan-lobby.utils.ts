import type {
  ScanLobbyMode,
  ScanProgressPhase,
  ScanRun,
  ScanStatusMeta,
} from "@/features/analysis-chamber/components/scan-lobby/scan-lobby.types";

export const today = () => new Date().toISOString().slice(0, 10);

export const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

export const isActiveRun = (status: string) =>
  status !== "completed" && status !== "failed";

export const isTerminalRun = (status: string | null | undefined) =>
  status === "completed" || status === "failed";

export const getRunStatusMeta = (status: string): ScanStatusMeta => {
  if (status === "completed") {
    return {
      label: "Fortified",
      technicalLabel: "Completed",
      tone: "completed",
      summary: "Campaign completed successfully. Dossier is ready for review.",
    };
  }

  if (status === "failed") {
    return {
      label: "Broken Banner",
      technicalLabel: "Failed",
      tone: "failed",
      summary: "The chamber runner could not gather enough signal.",
    };
  }

  if (status === "pending") {
    return {
      label: "Awaiting Signal",
      technicalLabel: "Pending",
      tone: "pending",
      summary: "The dispatch order is queued for the chamber runner.",
    };
  }

  return {
    label: "Scouting",
    technicalLabel: status.charAt(0).toUpperCase() + status.slice(1),
    tone: "scouting",
    summary: "Scout is gathering signal from the selected campaign window.",
  };
};

export const getScanMode = ({
  history,
  activeRun,
  isDispatching,
}: {
  history: ScanRun[] | undefined;
  activeRun: ScanRun | undefined;
  isDispatching: boolean;
}): ScanLobbyMode => {
  if (isDispatching) return "dispatching";
  if (activeRun && isActiveRun(activeRun.status)) return "scouting";
  if (activeRun?.status === "completed") return "success";
  if (activeRun?.status === "failed") return "failed";
  if (!history || history.length === 0) return "empty";
  return "idle";
};

export const getProgressPhase = (
  status: string | undefined,
  progressPct: number | undefined,
): ScanProgressPhase => {
  if (status === "completed" || status === "failed") return "verdict";
  if (status === "pending") return "sealing-order";
  const pct = progressPct ?? 0;
  if (pct < 30) return "crossing-signal-realm";
  if (pct < 68) return "gathering-fragments";
  return "forging-dossier";
};

export const formatRunDate = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : "Pending";

export const getAdvisorCopy = ({
  mode,
  activeRun,
  selectedRun,
  hasHistory,
}: {
  mode: ScanLobbyMode;
  activeRun: ScanRun | undefined;
  selectedRun: ScanRun | undefined;
  hasHistory: boolean;
}) => {
  if (selectedRun?.status === "failed" && selectedRun.errorMessage) {
    return `Selected broken banner: ${selectedRun.errorMessage}`;
  }

  if (selectedRun?.status === "completed") {
    return "Selected campaign is fortified. Open the latest dossier when you need the current profile view.";
  }

  if (mode === "failed" && activeRun?.errorMessage) {
    return `The previous mission failed because: ${activeRun.errorMessage}`;
  }

  if (mode === "success") {
    return "The dossier is ready. Open it to review the member profile and latest signals.";
  }

  if (mode === "scouting" || mode === "dispatching") {
    return "The scout is in the field. Keep the chamber open to watch the live run state returned by the API.";
  }

  if (!hasHistory) {
    return "Choose a campaign window, then dispatch the first AI scout for this member.";
  }

  return "Select a previous campaign for context, or dispatch a fresh scout when new signal is available.";
};

export const getRecommendedNextAction = ({
  mode,
  selectedRun,
  hasCompletedRun,
}: {
  mode: ScanLobbyMode;
  selectedRun: ScanRun | undefined;
  hasCompletedRun: boolean;
}) => {
  if (selectedRun?.status === "failed") return "Review error trace, repair, then send again.";
  if (mode === "failed") return "Repair the broken banner, then dispatch a retry.";
  if (mode === "scouting" || mode === "dispatching") {
    return "The Live Scan Chamber will hold focus until the chamber verdict returns.";
  }
  if (hasCompletedRun) return "Open latest dossier or dispatch a fresh scout.";
  return "Choose a campaign window and dispatch the first scout.";
};
