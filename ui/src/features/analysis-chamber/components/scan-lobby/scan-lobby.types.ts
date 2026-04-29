import type { ChamberAnalysisRun } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

export type ScanLobbyMode =
  | "empty"
  | "idle"
  | "dispatching"
  | "scouting"
  | "success"
  | "failed";

export type LiveScanChamberState =
  | "opening"
  | "dispatching"
  | "scouting"
  | "success"
  | "redirecting"
  | "failed";

export type ScanProgressPhase =
  | "sealing-order"
  | "crossing-signal-realm"
  | "gathering-fragments"
  | "forging-dossier"
  | "verdict";

export type ScanStatusTone =
  | "pending"
  | "scouting"
  | "completed"
  | "failed";

export type SourceStatus = "dormant" | "watching" | "sealed" | "broken";

export interface MapRing {
  id: string;
  label: string;
  radius: number;
  variant: "solid" | "dashed" | "faint";
}

export interface MapArc {
  id: string;
  label: string;
  ringId: string;
  startAngle: number;
  endAngle: number;
  category: "code" | "collaboration" | "archive" | "delivery" | "storage";
}

export interface MapAnchor {
  id: string;
  label: string;
  technicalLabel: string;
  arcId: string;
  angle: number;
  ringId: string;
  shortCode: string;
  phase: ScanProgressPhase;
  icon: "code" | "signal" | "archive" | "forge" | "vault";
}

export interface MapRoute {
  id: string;
  anchorId: string;
  phase: ScanProgressPhase;
}

export interface ScanStatusMeta {
  label: string;
  technicalLabel: string;
  tone: ScanStatusTone;
  summary: string;
}

export interface MissionSource {
  id: string;
  label: string;
  sublabel: string;
}

export type ScanRun = ChamberAnalysisRun;
