import type { FlatMemberRow } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import type { AnalysisStatus } from "@/types/organization";

export type WarRoomStatusDisplay = {
  label: string;
  meaning: string;
  tone: "idle" | "active" | "danger" | "ready" | "unknown";
};

export type WarRoomAction = {
  label: string;
  href: string;
  recommendation: string;
};

export type WarRoomCounter = {
  key: "total" | AnalysisStatus;
  label: string;
  value: number;
  tone: WarRoomStatusDisplay["tone"];
};

export const WAR_ROOM_STATUS_DISPLAY: Record<
  AnalysisStatus,
  WarRoomStatusDisplay
> = {
  not_analyzed: {
    label: "Not Scanned",
    meaning: "No profile scan yet",
    tone: "idle",
  },
  analyzing: {
    label: "Scanning",
    meaning: "Profile scan is running",
    tone: "active",
  },
  failed: {
    label: "Scan Failed",
    meaning: "The latest scan failed or was blocked",
    tone: "danger",
  },
  completed: {
    label: "Profile Ready",
    meaning: "The latest profile is ready",
    tone: "ready",
  },
};

const WAR_ROOM_SORT_PRIORITY: Record<AnalysisStatus, number> = {
  failed: 0,
  analyzing: 1,
  not_analyzed: 2,
  completed: 3,
};

export function getWarRoomStatusDisplay(
  status: AnalysisStatus | string,
): WarRoomStatusDisplay {
  return (
    WAR_ROOM_STATUS_DISPLAY[status as AnalysisStatus] ?? {
      label: "Unknown",
      meaning: "Campaign state needs review",
      tone: "unknown",
    }
  );
}

export function getWarRoomAction(
  memberId: string,
  status: AnalysisStatus | string,
): WarRoomAction {
  switch (status) {
    case "not_analyzed":
      return {
        label: "Start Scan",
        href: `/members/${memberId}/scan`,
        recommendation: "Run the first profile scan.",
      };
    case "analyzing":
      return {
        label: "Watch Scan",
        href: `/members/${memberId}/scan`,
        recommendation: "Open the scan lobby to watch live progress.",
      };
    case "failed":
      return {
        label: "Retry Scan",
        href: `/members/${memberId}/scan`,
        recommendation: "Review the failed run and retry from the scan lobby.",
      };
    case "completed":
      return {
        label: "Open Profile",
        href: `/profile/${memberId}`,
        recommendation: "Open the latest analysis profile.",
      };
    default:
      return {
        label: "Open Scan Lobby",
        href: `/members/${memberId}/scan`,
        recommendation: "Open the scan lobby and verify this member state.",
      };
  }
}

export function sortWarRoomMembers(members: FlatMemberRow[]): FlatMemberRow[] {
  return [...members].sort((left, right) => {
    const statusDelta =
      WAR_ROOM_SORT_PRIORITY[left.analysisStatus] -
      WAR_ROOM_SORT_PRIORITY[right.analysisStatus];

    if (statusDelta !== 0) {
      return statusDelta;
    }

    return left.displayName.localeCompare(right.displayName, undefined, {
      sensitivity: "base",
    });
  });
}

export function getWarRoomCounters(members: FlatMemberRow[]): WarRoomCounter[] {
  const totals = members.reduce<Record<AnalysisStatus, number>>(
    (accumulator, member) => {
      accumulator[member.analysisStatus] += 1;
      return accumulator;
    },
    {
      not_analyzed: 0,
      analyzing: 0,
      completed: 0,
      failed: 0,
    },
  );

  return [
    {
      key: "total",
      label: "Total Champions",
      value: members.length,
      tone: "unknown",
    },
    {
      key: "analyzing",
      label: "Scans Running",
      value: totals.analyzing,
      tone: WAR_ROOM_STATUS_DISPLAY.analyzing.tone,
    },
    {
      key: "failed",
      label: "Failed Scans",
      value: totals.failed,
      tone: WAR_ROOM_STATUS_DISPLAY.failed.tone,
    },
    {
      key: "completed",
      label: "Ready Profiles",
      value: totals.completed,
      tone: WAR_ROOM_STATUS_DISPLAY.completed.tone,
    },
  ];
}

export function formatWarRoomDate(value: string | null): string {
  if (!value) {
    return "No scan yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
