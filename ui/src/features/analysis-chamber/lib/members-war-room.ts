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
    label: "Unsworn",
    meaning: "No chamber record yet",
    tone: "idle",
  },
  analyzing: {
    label: "Scouting",
    meaning: "Analysis is running",
    tone: "active",
  },
  failed: {
    label: "Breach",
    meaning: "Last run failed or is blocked",
    tone: "danger",
  },
  completed: {
    label: "Fortified",
    meaning: "Chamber is ready",
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
        label: "Dispatch Scout",
        href: `/members/${memberId}/scan`,
        recommendation: "Begin the first chamber scan.",
      };
    case "analyzing":
      return {
        label: "Watch Scout",
        href: `/members/${memberId}/scan`,
        recommendation: "Check the active scan progress.",
      };
    case "failed":
      return {
        label: "Send Again",
        href: `/members/${memberId}/scan`,
        recommendation: "Review the blocked run and retry from the scan lobby.",
      };
    case "completed":
      return {
        label: "Open Dossier",
        href: `/profile/${memberId}`,
        recommendation: "Open the completed profile chamber.",
      };
    default:
      return {
        label: "Open Chamber",
        href: `/members/${memberId}/scan`,
        recommendation: "Open the chamber and verify this member state.",
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
      label: "Scouts In Field",
      value: totals.analyzing,
      tone: WAR_ROOM_STATUS_DISPLAY.analyzing.tone,
    },
    {
      key: "failed",
      label: "Broken Banners",
      value: totals.failed,
      tone: WAR_ROOM_STATUS_DISPLAY.failed.tone,
    },
    {
      key: "completed",
      label: "Fortified Records",
      value: totals.completed,
      tone: WAR_ROOM_STATUS_DISPLAY.completed.tone,
    },
  ];
}

export function formatWarRoomDate(value: string | null): string {
  if (!value) {
    return "No campaign yet";
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
