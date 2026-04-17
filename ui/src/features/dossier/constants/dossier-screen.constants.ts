import { DOSSIER_COLORS, DOSSIER_TABS } from "@/features/dossier/constants/dossier.constants";
import type { DossierChapterDefinition } from "@/features/dossier/types/dossier-screen.types";

export const DOSSIER_SCREEN_PALETTE = {
  bg: "#07111b",
  bgSoft: "#0b1724",
  navyEdge: "#102235",
  shell: "rgba(10, 18, 30, 0.76)",
  shellStrong: "rgba(10, 18, 30, 0.9)",
  border: "rgba(146, 208, 255, 0.18)",
  borderBright: "rgba(157, 232, 255, 0.34)",
  icyBlue: "#a7efff",
  icyBlueStrong: "#7fe7ff",
  gold: "#d7bb74",
  goldSoft: "#f0deaf",
  mist: "rgba(181, 239, 255, 0.14)",
  text: "#eef6ff",
  textMuted: "#adc0d0",
  textDim: "#7f93a7",
} as const;

export const DOSSIER_SCREEN_CHAPTERS: DossierChapterDefinition[] = [
  {
    id: DOSSIER_TABS[0].id,
    title: "Prime Readout",
    description: "Narrative-first summary with the operative held at the center.",
    icon: "OV",
    accentColor: DOSSIER_COLORS.primaryGlow,
  },
  {
    id: DOSSIER_TABS[1].id,
    title: "Attribute Signal",
    description: "Dense attribute modules linked back to the chamber and evidence layer.",
    icon: "CP",
    accentColor: "#9de8ff",
  },
  {
    id: DOSSIER_TABS[2].id,
    title: "Behavior Loops",
    description: "Keep, pressure, and next experiments in one coaching surface.",
    icon: "KP",
    accentColor: "#f7c96f",
  },
  {
    id: DOSSIER_TABS[3].id,
    title: "Case Threads",
    description: "Evidence-led case inspection without losing the chamber context.",
    icon: "CS",
    accentColor: "#7fe2d0",
  },
  {
    id: DOSSIER_TABS[4].id,
    title: "Progress Vector",
    description: "Timeline-style progression surface for the current growth path.",
    icon: "JR",
    accentColor: "#7fb8ff",
  },
] as const;

export const DOSSIER_SCREEN_MOTION = {
  chapterLockMs: 800,
  chapterThreshold: 20,
  shellEnterOffset: 28,
  shellBlur: 18,
  chapterShift: 18,
  boundaryNudge: 16,
  boundaryDuration: 0.26,
} as const;

export const DOSSIER_SCREEN_COPY = {
  chamberLabel: "Operative Stage",
  leftRailLabel: "Chapter Orbit",
  shellLabel: "Adaptive Story Shell",
  scrollHint: "Wheel, swipe, arrow keys, or space to rotate the dossier decks.",
} as const;
