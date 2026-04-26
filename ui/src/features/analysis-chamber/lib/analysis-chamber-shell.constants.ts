import type {
  AnalysisChamberRouteKey,
  AnalysisChamberRouteMeta,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";

export const ANALYSIS_CHAMBER_SHELL_PALETTE = {
  // ─ Shell surfaces — dark burgundy (Dynasty Wars) ─
  parchment: "#1a0f0a", // main shell body bg
  parchmentMid: "#15090a", // rail + inset panel bg
  parchmentDeep: "#1b0f0a", // top bar bg
  parchmentSurface: "#201008", // elevated surfaces
  parchmentReading: "#f5e8d0", // actual parchment — reading areas ONLY (unchanged)

  // ─ Text on dark surfaces ─
  ink: "#ffe8c0", // primary (golden white on burgundy bg)
  inkSoft: "#ffb84d", // secondary golden orange
  inkMuted: "#e8a850", // tertiary muted orange — 5.2:1 contrast on dark bg

  // ─ Text on reading/parchment surfaces ─
  inkReading: "#1e130a", // dark ink on parchment (unchanged)
  inkReadingSoft: "#4a3520", // soft dark ink on parchment (unchanged)
  inkReadingMuted: "#6b5040", // dim dark ink on parchment (unchanged)

  // ─ Accents — Dynasty Wars orange-fire palette ─
  gold: "#ff9500", // primary orange-fire accent
  goldLight: "#ffb84d", // bright golden-orange highlight
  goldPale: "rgba(255, 149, 0, 0.18)", // CTA bg glow on dark (orange)
  goldDark: "#d47a1f", // orange readable on parchment surfaces
  ember: "#ff7a1f", // fire orange — hot accent
  emberLight: "#ffaa4f", // lighter fire
  crimson: "#8b1a1a", // deep crimson (unchanged for KPT PROBLEM badge)
  crimsonLight: "#c42828", // brighter crimson for badges (unchanged)
  azure: "#2a5a9a", // steel blue (unchanged for KPT TRY badge)
  azureLight: "#4a7aba", // lighter steel blue (unchanged)
  vert: "#2a6a3a", // forest green (unchanged for KPT KEEP badge)
  vertLight: "#4a8a5a", // lighter vert (unchanged)
  silver: "#9aabb8", // steel grey (unchanged)

  // ─ Shadow ─
  shellShadow: "0 34px 80px rgba(0, 0, 0, 0.65)",
};

/**
 * KPT board design tokens — warm charcoal surfaces inside the amber chamber shell.
 * The base stays dark for readability, with subtle bronze warmth so the stage
 * feels native to the overall world while semantic K/P/T accents stay crisp.
 */
export const KPT_TOKENS = {
  // ─ Surfaces (warm dark, layered depth) ──────────────────
  bgColumn:
    "radial-gradient(circle at 84% 78%, rgba(255,190,120,0.07) 0%, rgba(255,190,120,0.03) 14%, transparent 34%), linear-gradient(180deg, #191411 0%, #120e0c 100%)",
  bgCard:
    "radial-gradient(circle at 84% 74%, rgba(255,196,128,0.05) 0%, rgba(255,196,128,0.02) 18%, transparent 40%), linear-gradient(180deg, #181411 0%, #12100e 100%)",
  bgCardHover:
    "radial-gradient(circle at 84% 74%, rgba(255,196,128,0.07) 0%, rgba(255,196,128,0.03) 18%, transparent 42%), linear-gradient(180deg, #1b1613 0%, #15110f 100%)",
  surfaceInset: "rgba(255,255,255,0.03)",
  surfaceChip: "rgba(255,184,77,0.05)",
  borderSubtle: "rgba(255,184,77,0.12)",
  borderStrong: "rgba(255,184,77,0.20)",

  // ─ Text — parchment-tinted white for chamber cohesion ───
  textPrimary: "#F3EBDD",
  textSecondary: "#B9AD9B",
  textMuted: "#8A7C69",
  textLabel: "#B8AA95",

  // ─ TOP card accent ──────────────────────────────────────
  accentTop: "#FFD166",

  // ─ KPT semantic accents (primarily icon / bottom bar) ────
  keep: {
    main: "#4FD1A5",
  },
  problem: {
    main: "#FF6B6B",
  },
  try: {
    main: "#5B8CFF",
  },
} as const;

/**
 * Cases stage tokens — warm archive surfaces with more neutral breathing room
 * so the ledger/detail layout feels consistent with the refined KPT stage.
 */
export const CASES_TOKENS = {
  ledgerShell:
    "radial-gradient(circle at 18% 0%, rgba(255,184,77,0.08) 0%, transparent 28%), linear-gradient(180deg, rgba(255,184,77,0.05) 0%, rgba(255,184,77,0.02) 100%)",
  ledgerHeader: "rgba(255,184,77,0.06)",
  ledgerDivider: "rgba(255,184,77,0.10)",
  rowIdle: "rgba(255,255,255,0.015)",
  rowHover: "rgba(255,184,77,0.045)",
  rowSelected:
    "linear-gradient(90deg, rgba(255,184,77,0.18) 0%, rgba(255,184,77,0.07) 52%, rgba(255,255,255,0.015) 100%)",
  rowBorder: "rgba(255,184,77,0.12)",
  panelSurface:
    "radial-gradient(circle at 0% 0%, rgba(255,184,77,0.05) 0%, transparent 22%), linear-gradient(180deg, #1a110d 0%, #140d0b 100%)",
  panelBorder: "rgba(255,184,77,0.16)",
  cardSurface:
    "radial-gradient(circle at 84% 30%, rgba(255,196,128,0.05) 0%, rgba(255,196,128,0.02) 18%, transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
  cardSurfaceStrong:
    "radial-gradient(circle at 84% 30%, rgba(255,196,128,0.06) 0%, rgba(255,196,128,0.03) 18%, transparent 44%), linear-gradient(180deg, rgba(255,184,77,0.06) 0%, rgba(255,255,255,0.018) 100%)",
  cardBorder: "rgba(255,184,77,0.14)",
  cardBorderStrong: "rgba(255,184,77,0.20)",
  impactNeutralBorder: "rgba(185,173,155,0.24)",
  mutedText: "rgba(185,173,155,0.72)",
  softText: "#D8C5A7",
  pendingText: "rgba(185,173,155,0.48)",
  emptyIcon: "rgba(255,184,77,0.24)",
  emptyHalo: "radial-gradient(circle, rgba(255,184,77,0.10), transparent 70%)",
  journeyBorder: "rgba(91,140,255,0.55)",
  journeyBg: "rgba(91,140,255,0.08)",
  journeyText: "#82A9FF",
} as const;

/** Maps every dimension ID to its parent category ID. */
export const DIMENSION_TO_CATEGORY: Record<string, string> = {
  // core_technical_execution
  implementation_reliability: "core_technical_execution",
  code_quality_discipline: "core_technical_execution",
  debugging_root_cause: "core_technical_execution",
  careless_mistake_control: "core_technical_execution",
  technical_ownership: "core_technical_execution",
  technical_learning_adaptability: "core_technical_execution",
  // technical_depth_breadth
  backend_capability: "technical_depth_breadth",
  frontend_capability: "technical_depth_breadth",
  devops_delivery_capability: "technical_depth_breadth",
  system_integration_capability: "technical_depth_breadth",
  data_interface_handling: "technical_depth_breadth",
  architecture_exposure: "technical_depth_breadth",
  // engineering_mindset
  quality_mindset: "engineering_mindset",
  performance_awareness: "engineering_mindset",
  security_awareness: "engineering_mindset",
  maintainability_thinking: "engineering_mindset",
  risk_awareness: "engineering_mindset",
  decision_hygiene: "engineering_mindset",
  // collaboration_growth
  problem_solving: "collaboration_growth",
  self_management: "collaboration_growth",
  horenso_reporting_discipline: "collaboration_growth",
  user_first: "collaboration_growth",
  collaboration: "collaboration_growth",
  mentoring_knowledge_support: "collaboration_growth",
  ai_leverage_ability: "collaboration_growth",
};

export const DIMENSION_LABELS: Record<string, string> = {
  // core_technical_execution
  implementation_reliability: "Implementation Reliability",
  code_quality_discipline: "Code Quality",
  debugging_root_cause: "Debugging",
  careless_mistake_control: "Mistake Control",
  technical_ownership: "Technical Ownership",
  technical_learning_adaptability: "Learning Adaptability",
  // technical_depth_breadth
  backend_capability: "Backend",
  frontend_capability: "Frontend",
  devops_delivery_capability: "DevOps",
  system_integration_capability: "Integration",
  data_interface_handling: "Data Interfaces",
  architecture_exposure: "Architecture",
  // engineering_mindset
  quality_mindset: "Quality Mindset",
  performance_awareness: "Performance",
  security_awareness: "Security",
  maintainability_thinking: "Maintainability",
  risk_awareness: "Risk Awareness",
  decision_hygiene: "Decision Hygiene",
  // collaboration_growth
  problem_solving: "Problem Solving",
  self_management: "Self Management",
  horenso_reporting_discipline: "Horenso",
  user_first: "User First",
  collaboration: "Collaboration",
  mentoring_knowledge_support: "Mentoring",
  ai_leverage_ability: "AI Leverage",
};

export const ANALYSIS_CHAMBER_ROUTES: AnalysisChamberRouteMeta[] = [
  {
    key: "overview",
    label: "Overview",
    shortLabel: "OV",
    artifact: "Crest",
    artifactSymbol: "♛",
    description: "Hero reveal and dossier entry point.",
  },
  {
    key: "competency",
    label: "Competency",
    shortLabel: "CP",
    artifact: "Sigil",
    artifactSymbol: "⚔",
    description: "Skill structure and evidence by competency.",
  },
  {
    key: "kpt",
    label: "KPT",
    shortLabel: "KP",
    artifact: "Scroll",
    artifactSymbol: "⚜",
    description: "Council reflection — keep, problem, try.",
  },
  {
    key: "cases",
    label: "Cases",
    shortLabel: "CS",
    artifact: "Ledger",
    artifactSymbol: "⊞",
    description: "Case archive — flagged patterns and outcomes.",
  },
  {
    key: "journey",
    label: "Journey",
    shortLabel: "JR",
    artifact: "Map",
    artifactSymbol: "⧖",
    description: "Expedition milestones and progression map.",
  },
];

export const ANALYSIS_CHAMBER_ROUTE_TITLE: Record<
  AnalysisChamberRouteKey,
  string
> = {
  overview: "Overview",
  competency: "Competency",
  kpt: "Reflection",
  cases: "Cases",
  journey: "Expedition",
};
