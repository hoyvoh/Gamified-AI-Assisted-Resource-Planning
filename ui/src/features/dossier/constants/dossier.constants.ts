/**
 * Dossier constants.
 */

import type {
  DossierMaturity,
  DossierTab,
} from "@/features/dossier/types/dossier.types";
import {
  normalizeAnalysisStatus,
  type AnalysisStatus,
} from "@/types/organization";

export const DOSSIER_TABS: { id: DossierTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "competency", label: "Competency" },
  { id: "kpt", label: "KPT" },
  { id: "cases", label: "Cases" },
  { id: "journey", label: "Journey" },
];

// Design tokens
export const DOSSIER_COLORS = {
  // Background — deep obsidian with radial depth
  bg: "#05070d",
  bgElevated: "#101726",
  bgMuted: "#0a0f1a",
  bgChamber: "#0a1221",

  // Glass system — frosted panels with blur
  panelBg: "rgba(255, 255, 255, 0.04)",
  panelBgStrong: "rgba(255, 255, 255, 0.06)",
  panelBgSoft: "rgba(255, 255, 255, 0.03)",
  panelBorder: "rgba(255, 255, 255, 0.08)",
  panelBorderStrong: "rgba(255, 255, 255, 0.12)",
  panelGlow: "rgba(63, 211, 255, 0.12)",
  panelGlowStrong: "rgba(63, 211, 255, 0.28)",

  // Semantic colors — signal-driven
  success: "#2ee6a6", // Emerald — trust, completed, high confidence
  successGlow: "#6ee7b7", // Brighter emerald for glow effects
  warning: "#ffb547", // Amber — flagged, needs review, caution
  warningGlow: "#fcd34d", // Brighter amber for glow
  danger: "#ff5c5c", // Red — failed, critical
  dangerGlow: "#fca5a5",
  primary: "#3fd3ff", // Cyan — active, progress, timeline nodes
  primarySoft: "#7ae6ff",
  primaryDim: "#1fa3c9",
  primaryGlow: "#a9fff0",

  // Neutral states
  neutral: "#64748b",
  focus: "#8bc4a0",
  signal: "#a9fff0",
  fog: "rgba(63, 211, 255, 0.05)",

  // Text — white with cool blue tint for harmony
  text: "#e6edf7",
  textDim: "#a8b3c7",
  textMuted: "#6b768a",

  // Brighter contrast for readability
  textPrimary: "#f0f6fc",
  textSecondary: "#b8cde0",
  textTertiary: "#94aac0",
  signalBright: "#d0fff0",
  successBright: "#6ee7b7",
  warningBright: "#fcd34d",
  dangerBright: "#fca5a5",
  primaryBright: "#7dd3fc",
} as const;

// ─── High Contrast Color Aliases ───────────────────────────────────
export const CONTRAST = {
  textPrimary: DOSSIER_COLORS.textPrimary,
  textSecondary: DOSSIER_COLORS.textSecondary,
  textTertiary: DOSSIER_COLORS.textTertiary,
  signalBright: DOSSIER_COLORS.signalBright,
  successBright: DOSSIER_COLORS.successBright,
  successGlow: DOSSIER_COLORS.successGlow,
  warningBright: DOSSIER_COLORS.warningBright,
  warningGlow: DOSSIER_COLORS.warningGlow,
  dangerBright: DOSSIER_COLORS.dangerBright,
  primaryBright: DOSSIER_COLORS.primaryBright,
  primaryGlow: DOSSIER_COLORS.primaryGlow,
  // Semantic mappings for quick access
  confidence: DOSSIER_COLORS.successGlow, // Emerald for trust
  flagged: DOSSIER_COLORS.warningGlow, // Amber for attention
  timeline: DOSSIER_COLORS.primaryBright, // Cyan for progression
} as const;

// Animation durations (ms)
export const ANIM = {
  fast: 120,
  normal: 250,
  slow: 600,
  cinematic: 1000,
} as const;

export const DOSSIER_MOTION = {
  deckExitDuration: 0.28,
  deckEnterDuration: 0.34,
  deckExitOffset: -56,
  deckEnterOffset: 42,
  deckExitBlur: 16,
  deckEnterBlur: 22,
  panelFocusDuration: 0.42,
  panelBlur: 14,
  panelDimOpacity: 0.32,
  panelShift: 18,
  cameraFocusDuration: 0.52,
  drawerBackdropDuration: 0.24,
  drawerDeployDuration: 0.38,
  drawerRetractDuration: 0.24,
  drawerOffset: 44,
  drawerBlur: 18,
  drawerScaleFrom: 0.985,
  drawerCardOffset: 18,
  drawerCardStagger: 0.05,
  reviewBackdropDuration: 0.24,
  reviewDeployDuration: 0.34,
  reviewRetractDuration: 0.24,
  reviewOffset: 24,
  reviewBlur: 14,
  reviewScaleFrom: 0.972,
  reviewCardOffset: 16,
  reviewCardStagger: 0.045,
} as const;

export const DOSSIER_PARTICLE_AURA = {
  minCount: 56,
  maxCount: 144,
  minRadius: 1.02,
  maxRadius: 1.34,
  minHeight: 1.58,
  maxHeight: 2.08,
  minSpeed: 0.12,
  maxSpeed: 0.34,
  pointSize: 0.022,
  pointOpacity: 0.34,
} as const;

export const DOSSIER_COPY = {
  title: "Operative Dossier",
  subtitleFallback: "Role pending",
  status: {
    not_analyzed: "Idle",
    analyzing: "Analyzing",
    completed: "Completed",
    failed: "Failed",
  } satisfies Record<AnalysisStatus, string>,
  actions: {
    evidence: "Open Evidence",
    scan: "Start Scan",
    back: "Return to War Room",
  },
} as const;

export const DOSSIER_STATUS_META = {
  not_analyzed: {
    label: "Idle",
    color: DOSSIER_COLORS.neutral,
    borderColor: "rgba(100, 116, 139, 0.28)",
    backgroundColor: "rgba(17, 24, 39, 0.72)",
    glowColor: "rgba(100, 116, 139, 0.12)",
  },
  analyzing: {
    label: "Analyzing",
    color: DOSSIER_COLORS.primary,
    borderColor: "rgba(63, 211, 255, 0.32)",
    backgroundColor: "rgba(8, 22, 38, 0.86)",
    glowColor: "rgba(63, 211, 255, 0.18)",
  },
  completed: {
    label: "Completed",
    color: DOSSIER_COLORS.success,
    borderColor: "rgba(46, 230, 166, 0.32)",
    backgroundColor: "rgba(8, 28, 22, 0.82)",
    glowColor: "rgba(46, 230, 166, 0.16)",
  },
  failed: {
    label: "Failed",
    color: DOSSIER_COLORS.danger,
    borderColor: "rgba(255, 92, 92, 0.34)",
    backgroundColor: "rgba(34, 10, 10, 0.84)",
    glowColor: "rgba(255, 92, 92, 0.16)",
  },
} satisfies Record<
  AnalysisStatus,
  {
    label: string;
    color: string;
    borderColor: string;
    backgroundColor: string;
    glowColor: string;
  }
>;

export const getStatusMeta = (status: string | null | undefined) =>
  DOSSIER_STATUS_META[normalizeAnalysisStatus(status)];

export const DOSSIER_MATURITY_META = {
  advanced: {
    label: "Advanced",
    color: DOSSIER_COLORS.success,
  },
  proficient: {
    label: "Proficient",
    color: DOSSIER_COLORS.primary,
  },
  developing: {
    label: "Developing",
    color: DOSSIER_COLORS.warning,
  },
  emerging: {
    label: "Emerging",
    color: DOSSIER_COLORS.danger,
  },
} satisfies Record<DossierMaturity, { label: string; color: string }>;

export const DEFAULT_DOSSIER_MATURITY: DossierMaturity = "developing";

export const getMaturityMeta = (maturityLevel: string | null | undefined) =>
  DOSSIER_MATURITY_META[
    (maturityLevel as DossierMaturity | null | undefined) ??
      DEFAULT_DOSSIER_MATURITY
  ] ?? DOSSIER_MATURITY_META[DEFAULT_DOSSIER_MATURITY];

// ─── Typography Tokens ─────────────────────────────────────────────
// Design principle: nothing below 10px, increase sub-20px text for readability

export const TYPO = {
  // Eyebrow / label (mono, uppercase)
  eyebrow: {
    fontSize: "12px",
    lineHeight: "1.4",
    letterSpacing: "0.22em",
  },
  // Section title
  sectionTitle: {
    fontSize: "15px",
    lineHeight: "1.3",
    letterSpacing: "0.1em",
  },
  sectionTitleMd: {
    fontSize: "16px",
  },
  // Body text
  body: {
    fontSize: "13px",
    lineHeight: "1.65",
  },
  bodySm: {
    fontSize: "12px",
    lineHeight: "1.6",
  },
  // Tab pills
  tab: {
    fontSize: "10px",
    lineHeight: "1",
    letterSpacing: "0.18em",
  },
  // Card title
  cardTitle: {
    fontSize: "13px",
    lineHeight: "1.4",
    letterSpacing: "0.12em",
  },
  // Card body
  cardBody: {
    fontSize: "14px",
    lineHeight: "1.6",
  },
  // Numeric values
  valueLg: {
    fontSize: "18px",
    lineHeight: "1",
    letterSpacing: "0.04em",
  },
  valueMd: {
    fontSize: "15px",
    lineHeight: "1",
  },
  valueSm: {
    fontSize: "13px",
    lineHeight: "1",
    letterSpacing: "0.1em",
  },
  // Badge / pill
  badge: {
    fontSize: "11px",
    lineHeight: "1.4",
    letterSpacing: "0.16em",
  },
  // Header
  headerName: {
    fontSize: "16px",
    lineHeight: "1.3",
    letterSpacing: "0.12em",
  },
  headerNameMd: {
    fontSize: "17px",
  },
  headerSub: {
    fontSize: "12px",
    lineHeight: "1.4",
    letterSpacing: "0.14em",
  },
  headerEyebrow: {
    fontSize: "11px",
    lineHeight: "1.4",
    letterSpacing: "0.28em",
  },
  // Status
  status: {
    fontSize: "11px",
    lineHeight: "1.4",
    letterSpacing: "0.2em",
  },
  // Milestone
  milestone: {
    fontSize: "13px",
    lineHeight: "1.4",
    letterSpacing: "0.12em",
  },
  milestoneDate: {
    fontSize: "11px",
    lineHeight: "1.4",
    letterSpacing: "0.22em",
  },
  // Brief panel
  briefTitle: {
    fontSize: "13px",
    lineHeight: "1.5",
    letterSpacing: "0.12em",
  },
  briefBody: {
    fontSize: "12px",
    lineHeight: "1.5",
  },
  briefPill: {
    fontSize: "13.5px",
    lineHeight: "1.4",
  },
  // Launcher
  launcherLabel: {
    fontSize: "11px",
    lineHeight: "1.4",
    letterSpacing: "0.2em",
  },
  launcherAction: {
    fontSize: "11px",
    lineHeight: "1.3",
    letterSpacing: "0.12em",
  },
  // Hero caption
  heroCaption: {
    fontSize: "12px",
    lineHeight: "1.55",
  },
} as const;
