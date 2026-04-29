import type {
  MapAnchor,
  MapArc,
  MapRing,
  ScanProgressPhase,
  SourceStatus,
} from "../scan-lobby.types";

export const MAP_VIEWBOX = {
  width: 800,
  height: 320,
  centerX: 400,
  centerY: 148,
} as const;

export const MAP_RINGS: MapRing[] = [
  { id: "inner-ward", label: "Inner Ward", radius: 74, variant: "solid" },
  { id: "signal-belt", label: "Signal Belt", radius: 126, variant: "dashed" },
  { id: "outer-march", label: "Outer March", radius: 188, variant: "solid" },
  { id: "far-watch", label: "Far Watch", radius: 226, variant: "faint" },
];

export const MAP_ARCS: MapArc[] = [
  {
    id: "code-arc",
    label: "Code Arc",
    ringId: "outer-march",
    startAngle: 296,
    endAngle: 344,
    category: "code",
  },
  {
    id: "collab-arc",
    label: "Signal Arc",
    ringId: "outer-march",
    startAngle: 16,
    endAngle: 64,
    category: "collaboration",
  },
  {
    id: "delivery-arc",
    label: "Forge Arc",
    ringId: "outer-march",
    startAngle: 96,
    endAngle: 144,
    category: "delivery",
  },
  {
    id: "archive-arc",
    label: "Archive Arc",
    ringId: "outer-march",
    startAngle: 176,
    endAngle: 224,
    category: "archive",
  },
  {
    id: "storage-arc",
    label: "Vault Arc",
    ringId: "outer-march",
    startAngle: 256,
    endAngle: 304,
    category: "storage",
  },
];

export const MAP_ANCHORS: MapAnchor[] = [
  {
    id: "github",
    label: "Code Fortress",
    technicalLabel: "GitHub",
    arcId: "code-arc",
    angle: 320,
    ringId: "outer-march",
    shortCode: "GH",
    phase: "sealing-order",
    icon: "code",
  },
  {
    id: "slack",
    label: "Signal Beacon",
    technicalLabel: "Slack",
    arcId: "collab-arc",
    angle: 40,
    ringId: "outer-march",
    shortCode: "SL",
    phase: "crossing-signal-realm",
    icon: "signal",
  },
  {
    id: "ci",
    label: "Forge Relay",
    technicalLabel: "CI",
    arcId: "delivery-arc",
    angle: 120,
    ringId: "outer-march",
    shortCode: "CI",
    phase: "forging-dossier",
    icon: "forge",
  },
  {
    id: "docs",
    label: "Archive Tower",
    technicalLabel: "Docs",
    arcId: "archive-arc",
    angle: 200,
    ringId: "outer-march",
    shortCode: "AR",
    phase: "gathering-fragments",
    icon: "archive",
  },
  {
    id: "drive",
    label: "Vault Keep",
    technicalLabel: "Drive",
    arcId: "storage-arc",
    angle: 280,
    ringId: "outer-march",
    shortCode: "VT",
    phase: "verdict",
    icon: "vault",
  },
];

// ─── Phases ──────────────────────────────────────────────────────

export const PHASES: ScanProgressPhase[] = [
  "sealing-order",
  "crossing-signal-realm",
  "gathering-fragments",
  "forging-dossier",
  "verdict",
];

export const PHASE_LABELS: Record<ScanProgressPhase, string> = {
  "sealing-order": "Seal",
  "crossing-signal-realm": "Cross",
  "gathering-fragments": "Gather",
  "forging-dossier": "Forge",
  verdict: "Verdict",
};

export const PHASE_COPY: Record<
  ScanProgressPhase,
  { title: string; detail: string }
> = {
  "sealing-order": {
    title: "Sealing Dispatch Order",
    detail: "Preparing campaign window and mission instruction.",
  },
  "crossing-signal-realm": {
    title: "Scout Crossing the Signal Realm",
    detail: "Contacting available developer signal sources.",
  },
  "gathering-fragments": {
    title: "Gathering Banners and Fragments",
    detail: "Collecting developer activity traces.",
  },
  "forging-dossier": {
    title: "Forging the Dossier",
    detail: "Composing the member profile and scan result.",
  },
  verdict: {
    title: "Chamber Verdict",
    detail: "The latest backend run state is ready.",
  },
};

// ─── Source status styles ─────────────────────────────────────────

export const SOURCE_STATUS_STYLES: Record<
  SourceStatus,
  {
    dot: string;
    text: string;
    rowHighlight: string;
    label: string;
    anchor: string;
    anchorRing: string;
  }
> = {
  dormant: {
    dot: "bg-amber-200/55",
    text: "text-white/42",
    rowHighlight: "",
    label: "Dormant",
    anchor: "border-amber-200/25 bg-[#21140d]/90 text-amber-100/60",
    anchorRing: "border-amber-200/15",
  },
  watching: {
    dot: "bg-sky-200",
    text: "text-sky-100",
    rowHighlight: "rounded bg-sky-200/10 px-1.5 -mx-1.5",
    label: "Watching",
    anchor:
      "border-sky-200/75 bg-sky-300/15 text-sky-100 shadow-[0_0_22px_rgba(125,211,252,0.3)]",
    anchorRing: "border-sky-200/50",
  },
  sealed: {
    dot: "bg-emerald-200",
    text: "text-emerald-100",
    rowHighlight: "",
    label: "Sealed",
    anchor:
      "border-emerald-200/60 bg-emerald-300/10 text-emerald-100 shadow-[0_0_18px_rgba(167,243,208,0.18)]",
    anchorRing: "border-emerald-200/40",
  },
  broken: {
    dot: "bg-red-300",
    text: "text-red-100",
    rowHighlight: "",
    label: "Broken",
    anchor:
      "border-red-300/70 bg-red-400/12 text-red-100 shadow-[0_0_20px_rgba(252,165,165,0.22)]",
    anchorRing: "border-red-300/45",
  },
};
