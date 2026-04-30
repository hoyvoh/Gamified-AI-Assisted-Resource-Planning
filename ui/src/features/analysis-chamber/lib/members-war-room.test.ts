import { describe, expect, it } from "vitest";

import type { FlatMemberRow } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import {
  getWarRoomAction,
  getWarRoomCounters,
  getWarRoomStatusDisplay,
  sortWarRoomMembers,
} from "@/features/analysis-chamber/lib/members-war-room";

const member = (
  memberId: string,
  displayName: string,
  analysisStatus: FlatMemberRow["analysisStatus"],
): FlatMemberRow => ({
  memberId,
  displayName,
  externalId: null,
  roleProfileId: null,
  roleName: null,
  teamId: "team-1",
  teamName: "Platform",
  orgId: "org-1",
  orgName: "Guild",
  analysisStatus,
  lastAnalysisAt: null,
});

describe("members war room derivations", () => {
  it("maps domain statuses to the normalized scan labels", () => {
    expect(getWarRoomStatusDisplay("not_analyzed")).toMatchObject({
      label: "Not Scanned",
      meaning: "No profile scan yet",
    });
    expect(getWarRoomStatusDisplay("completed")).toMatchObject({
      label: "Profile Ready",
      meaning: "The latest profile is ready",
    });
  });

  it("maps primary row actions to the correct routes", () => {
    expect(getWarRoomAction("member-1", "not_analyzed")).toMatchObject({
      label: "Start Scan",
      href: "/members/member-1/scan",
    });
    expect(getWarRoomAction("member-1", "completed")).toMatchObject({
      label: "Open Profile",
      href: "/profile/member-1",
    });
    expect(getWarRoomAction("member-1", "future_state")).toMatchObject({
      label: "Open Scan Lobby",
      href: "/members/member-1/scan",
    });
  });

  it("sorts work states before completed records, then by display name", () => {
    const sorted = sortWarRoomMembers([
      member("4", "Zed", "completed"),
      member("2", "Beth", "analyzing"),
      member("1", "Ada", "failed"),
      member("3", "Cy", "not_analyzed"),
      member("5", "Ari", "failed"),
    ]);

    expect(sorted.map((row) => row.displayName)).toEqual([
      "Ada",
      "Ari",
      "Beth",
      "Cy",
      "Zed",
    ]);
  });

  it("derives the council state counters from existing member rows", () => {
    const counters = getWarRoomCounters([
      member("1", "Ada", "failed"),
      member("2", "Beth", "analyzing"),
      member("3", "Cy", "completed"),
      member("4", "Dee", "completed"),
    ]);

    expect(counters).toMatchObject([
      { key: "total", value: 4 },
      { key: "analyzing", value: 1 },
      { key: "failed", value: 1 },
      { key: "completed", value: 2 },
    ]);
  });
});
