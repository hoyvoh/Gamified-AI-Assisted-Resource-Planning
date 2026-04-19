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
