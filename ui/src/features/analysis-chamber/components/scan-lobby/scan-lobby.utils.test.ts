import { describe, expect, it } from "vitest";

import type { ChamberAnalysisRun } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import {
  getProgressPhase,
  getScanMode,
  isTerminalRun,
} from "@/features/analysis-chamber/components/scan-lobby/scan-lobby.utils";

const makeRun = (
  overrides: Partial<ChamberAnalysisRun> = {},
): ChamberAnalysisRun => ({
  id: "run-1",
  memberId: "member-1",
  periodStart: "2026-01-01",
  periodEnd: "2026-03-31",
  runType: "refresh",
  status: "pending",
  progressStage: null,
  progressPct: 0,
  errorMessage: null,
  scoringVersion: null,
  createdAt: "2026-04-01T00:00:00Z",
  updatedAt: "2026-04-01T00:00:00Z",
  completedAt: null,
  ...overrides,
});

describe("scan lobby state derivation", () => {
  it("returns dispatching while the trigger mutation is pending", () => {
    expect(
      getScanMode({
        history: [],
        activeRun: undefined,
        isDispatching: true,
      }),
    ).toBe("dispatching");
  });

  it("returns scouting when an active run is present", () => {
    expect(
      getScanMode({
        history: [makeRun({ status: "running" })],
        activeRun: makeRun({ status: "running", progressPct: 42 }),
        isDispatching: false,
      }),
    ).toBe("scouting");
  });

  it("returns success for a completed active run", () => {
    expect(
      getScanMode({
        history: [makeRun({ status: "completed", completedAt: "2026-04-29T08:00:00Z" })],
        activeRun: makeRun({
          status: "completed",
          progressPct: 100,
          completedAt: "2026-04-29T08:00:00Z",
        }),
        isDispatching: false,
      }),
    ).toBe("success");
  });

  it("returns failed for a failed active run", () => {
    expect(
      getScanMode({
        history: [makeRun({ status: "failed", errorMessage: "Signal lost" })],
        activeRun: makeRun({ status: "failed", errorMessage: "Signal lost" }),
        isDispatching: false,
      }),
    ).toBe("failed");
  });
});

describe("scan lobby progress helpers", () => {
  it("detects terminal runs", () => {
    expect(isTerminalRun("completed")).toBe(true);
    expect(isTerminalRun("failed")).toBe(true);
    expect(isTerminalRun("running")).toBe(false);
    expect(isTerminalRun(undefined)).toBe(false);
  });

  it("maps completed and failed runs to verdict phase", () => {
    expect(getProgressPhase("completed", 100)).toBe("verdict");
    expect(getProgressPhase("failed", 81)).toBe("verdict");
  });

  it("maps in-progress percentages to chamber phases", () => {
    expect(getProgressPhase("running", 10)).toBe("crossing-signal-realm");
    expect(getProgressPhase("running", 45)).toBe("gathering-fragments");
    expect(getProgressPhase("running", 80)).toBe("forging-dossier");
  });
});
