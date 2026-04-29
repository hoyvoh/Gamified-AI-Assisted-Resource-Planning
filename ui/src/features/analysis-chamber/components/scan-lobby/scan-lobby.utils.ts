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
      label: "Profile Ready",
      technicalLabel: "Completed",
      tone: "completed",
      summary: "The scan completed successfully. The profile is ready to review.",
    };
  }

  if (status === "failed") {
    return {
      label: "Scan Failed",
      technicalLabel: "Failed",
      tone: "failed",
      summary: "The scan could not gather enough signal to finish.",
    };
  }

  if (status === "pending") {
    return {
      label: "Queued",
      technicalLabel: "Pending",
      tone: "pending",
      summary: "The scan request is queued and waiting to start.",
    };
  }

  return {
    label: "Scanning",
    technicalLabel: status.charAt(0).toUpperCase() + status.slice(1),
    tone: "scouting",
    summary: "The scan is gathering signal from the selected campaign window.",
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
    return `Selected failed scan: ${selectedRun.errorMessage}`;
  }

  if (selectedRun?.status === "completed") {
    return "Selected scan is complete. Open the latest profile when you need the current analysis view.";
  }

  if (mode === "failed" && activeRun?.errorMessage) {
    return `The previous scan failed because: ${activeRun.errorMessage}`;
  }

  if (mode === "success") {
    return "The profile is ready. Open it to review the latest analysis signals.";
  }

  if (mode === "scouting" || mode === "dispatching") {
    return "The scan is running. Keep the live chamber open to watch the latest run state returned by the API.";
  }

  if (!hasHistory) {
    return "Choose a campaign window, then start the first profile scan for this member.";
  }

  return "Select a previous scan for context, or start a fresh scan when new signal is available.";
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
  if (selectedRun?.status === "failed") return "Review the error trace, then retry the scan.";
  if (mode === "failed") return "Review the failed scan, then dispatch a retry.";
  if (mode === "scouting" || mode === "dispatching") {
    return "The Live Scan Chamber will hold focus until the scan reaches a final status.";
  }
  if (hasCompletedRun) return "Open the latest profile or start a fresh scan.";
  return "Choose a campaign window and start the first scan.";
};
