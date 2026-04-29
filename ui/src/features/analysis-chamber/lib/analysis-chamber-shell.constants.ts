import type {
  AnalysisChamberRouteKey,
  AnalysisChamberRouteMeta,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";
import { MEDIEVAL_ANALYSIS_CHAMBER_PALETTE } from "@/lib/theme/medieval-theme";

export const ANALYSIS_CHAMBER_SHELL_PALETTE = MEDIEVAL_ANALYSIS_CHAMBER_PALETTE;

export const CHAMBER_CHROME_TOKENS = {
  railBorder: "rgba(216, 175, 99, 0.16)",
  railTrack: "rgba(216, 175, 99, 0.10)",
  railRingOffset: "rgba(12, 11, 14, 0.98)",
  railActivePlate:
    "linear-gradient(135deg, rgba(216,175,99,0.14), rgba(216,175,99,0.06))",
  railActiveBorder: "rgba(216, 175, 99, 0.20)",
  railTooltipBg: "rgba(13, 10, 11, 0.96)",
  railTooltipBorder: "rgba(216, 175, 99, 0.2)",
  railTooltipShadow: "0 4px 16px rgba(0,0,0,0.4)",
  railDivider: "rgba(216, 175, 99, 0.12)",
  railLabelIdle: "rgba(169, 152, 131, 0.58)",
  goldGlowSoft: "rgba(216,175,99,0.40)",
  goldGlowStrong: "rgba(216,175,99,0.80)",
  goldDropShadow: "rgba(216,175,99,0.65)",
  sidePanelSurface:
    "linear-gradient(180deg, rgba(24,26,33,0.92) 0%, rgba(13,10,11,0.98) 100%)",
  sidePanelBorder: "rgba(216, 175, 99, 0.18)",
  sidePanelInnerBorder: "rgba(216, 175, 99, 0.12)",
  sidePanelShadow: "-12px 0 40px rgba(0,0,0,0.22)",
  portraitCardSurface:
    "radial-gradient(circle at 50% 24%, rgba(255,255,255,0.06) 0%, transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
  portraitCardShadow:
    "inset 0 1px 0 rgba(255,232,192,0.05), 0 14px 28px rgba(0,0,0,0.24)",
  portraitFade:
    "linear-gradient(180deg, rgba(18,17,22,0) 0%, rgba(13,10,11,0.96) 100%)",
  portraitChipBg: "rgba(17, 19, 26, 0.78)",
  portraitChipBorder: "rgba(216, 175, 99, 0.18)",
  signalCardBg: "rgba(255,255,255,0.025)",
  signalCardBorder: "rgba(216, 175, 99, 0.18)",
  actionBorder: "rgba(216, 175, 99, 0.28)",
  actionBg: "rgba(216, 175, 99, 0.10)",
  actionText: "#e9ddd0",
  heroAuraBg:
    "radial-gradient(circle at 50% 30%, rgba(216,175,99,0.10) 0%, transparent 70%)",
  frameBorder: "rgba(143, 116, 64, 0.5)",
  frameInnerBorder: "rgba(216, 175, 99, 0.12)",
  refreshBg: "rgba(216, 175, 99, 0.06)",
  statusReadyBg: "rgba(68, 96, 76, 0.08)",
  statusReadyBorder: "#44604c",
  statusReadyText: "#a8c0af",
  signalStatusReadyBorder: "rgba(77,104,79,0.34)",
  signalStatusReadyText: "#69cf88",
  signalStatusActiveBorder: "rgba(66,83,109,0.34)",
  signalStatusIdleBorder: "rgba(216,175,99,0.24)",
  loadingOrbBorder: "rgba(216,175,99,0.35)",
  loadingOrbBg:
    "radial-gradient(circle, rgba(216,175,99,0.18) 0%, rgba(216,175,99,0.06) 55%, transparent 70%)",
  pendingOrbActiveBorder: "rgba(216,175,99,0.5)",
  pendingOrbIdleBorder: "rgba(216,175,99,0.25)",
  pendingOrbActiveBg:
    "radial-gradient(circle, rgba(216,175,99,0.22) 0%, rgba(216,175,99,0.08) 55%, transparent 70%)",
  pendingOrbIdleBg:
    "radial-gradient(circle, rgba(216,175,99,0.10) 0%, transparent 70%)",
  pendingOrbActiveText: "rgba(216,175,99,0.9)",
  pendingOrbIdleText: "rgba(216,175,99,0.35)",
  pendingTitleActive: "rgba(255,232,192,0.85)",
  pendingTitleIdle: "rgba(255,232,192,0.5)",
  pendingBody: "rgba(255,232,192,0.4)",
  pendingActionBorder: "rgba(216,175,99,0.55)",
  pendingActionBg: "rgba(216,175,99,0.08)",
  pendingActionText: "rgba(216,175,99,0.9)",
  pendingRefreshText: "rgba(255,232,192,0.25)",
  errorText: "rgba(220,80,80,0.85)",
  loadingHalo:
    "radial-gradient(circle, rgba(216,175,99,0.18) 0%, rgba(216,175,99,0.06) 55%, transparent 70%)",
  loadingHaloBorder: "rgba(161, 119, 55, 0.35)",
} as const;

export const SCAN_LOBBY_TOKENS = {
  panelSurface:
    "linear-gradient(180deg, rgba(24,26,33,0.92), rgba(13,10,11,0.96))",
  panelSurfaceStrong:
    "linear-gradient(180deg, rgba(29,32,41,0.94), rgba(14,11,13,0.98))",
  panelInset: "rgba(255,255,255,0.025)",
  panelInsetStrong: "rgba(12,11,14,0.30)",
  panelBorder: "rgba(216, 175, 99, 0.14)",
  panelBorderStrong: "rgba(216, 175, 99, 0.18)",
  panelBorderSubtle: "rgba(255, 255, 255, 0.08)",
  dashedBorder: "rgba(216, 175, 99, 0.18)",
  surfaceGlow: "rgba(216, 175, 99, 0.05)",
  eyebrow: "rgba(216, 175, 99, 0.55)",
  title: "#f1e4cf",
  metaText: "rgba(233, 221, 208, 0.42)",
  labelText: "rgba(233, 221, 208, 0.35)",
  bodyText: "rgba(233, 221, 208, 0.62)",
  bodyTextStrong: "rgba(233, 221, 208, 0.76)",
  bodyMuted: "rgba(233, 221, 208, 0.56)",
  recordMeta: "rgba(233, 221, 208, 0.50)",
  chipBg: "rgba(216, 175, 99, 0.05)",
  chipBorder: "rgba(216, 175, 99, 0.20)",
  chipText: "#f3ead8",
  inputBg: "rgba(12,11,14,0.32)",
  inputBgFocus: "rgba(12,11,14,0.44)",
  placeholder: "rgba(233, 221, 208, 0.25)",
  buttonPrimaryText: "#2c2012",
  cardIdleBg: "rgba(255,255,255,0.02)",
  cardIdleBorder: "rgba(255,255,255,0.08)",
  advisorNodeBg: "rgba(255,255,255,0.025)",
  advisorNodeBorder: "rgba(255,255,255,0.08)",
  loadingBg: "rgba(255,255,255,0.05)",
  loadingBorder: "rgba(255,255,255,0.08)",
} as const;

/**
 * KPT board design tokens — warm charcoal surfaces inside the amber chamber shell.
 * The base stays dark for readability, with subtle bronze warmth so the stage
 * feels native to the overall world while semantic K/P/T accents stay crisp.
 */
export const KPT_TOKENS = {
  // ─ Surfaces (warm dark, layered depth) ──────────────────
  bgColumn:
    "radial-gradient(circle at 84% 78%, rgba(216,175,99,0.06) 0%, rgba(216,175,99,0.025) 14%, transparent 34%), linear-gradient(180deg, rgba(24,26,33,0.96) 0%, rgba(13,10,11,0.98) 100%)",
  bgCard:
    "radial-gradient(circle at 84% 74%, rgba(216,175,99,0.05) 0%, rgba(216,175,99,0.02) 18%, transparent 40%), linear-gradient(180deg, rgba(24,26,33,0.94) 0%, rgba(13,10,11,0.96) 100%)",
  bgCardHover:
    "radial-gradient(circle at 84% 74%, rgba(216,175,99,0.07) 0%, rgba(216,175,99,0.03) 18%, transparent 42%), linear-gradient(180deg, rgba(29,32,41,0.96) 0%, rgba(14,11,13,0.98) 100%)",
  surfaceInset: "rgba(255,255,255,0.03)",
  surfaceChip: "rgba(216,175,99,0.05)",
  borderSubtle: "rgba(216,175,99,0.12)",
  borderStrong: "rgba(216,175,99,0.20)",
  columnShadow:
    "inset 0 1px 0 rgba(255,232,192,0.04), 0 18px 40px rgba(0,0,0,0.22)",
  cardInset: "inset 0 1px 0 rgba(255,232,192,0.03)",
  cardGlow: "0 16px 32px rgba(0,0,0,0.22)",

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
    "radial-gradient(circle at 18% 0%, rgba(216,175,99,0.07) 0%, transparent 28%), linear-gradient(180deg, rgba(24,26,33,0.96) 0%, rgba(13,10,11,0.98) 100%)",
  ledgerHeader: "rgba(216,175,99,0.05)",
  ledgerDivider: "rgba(216,175,99,0.10)",
  rowIdle: "rgba(255,255,255,0.015)",
  rowHover: "rgba(216,175,99,0.045)",
  rowSelected:
    "linear-gradient(90deg, rgba(216,175,99,0.16) 0%, rgba(24,26,33,0.52) 38%, rgba(13,10,11,0.92) 100%)",
  rowBorder: "rgba(216,175,99,0.12)",
  panelSurface:
    "radial-gradient(circle at 0% 0%, rgba(216,175,99,0.05) 0%, transparent 22%), linear-gradient(180deg, rgba(24,26,33,0.96) 0%, rgba(13,10,11,0.98) 100%)",
  panelBorder: "rgba(216,175,99,0.16)",
  cardSurface:
    "radial-gradient(circle at 84% 30%, rgba(216,175,99,0.05) 0%, rgba(216,175,99,0.02) 18%, transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
  cardSurfaceStrong:
    "radial-gradient(circle at 84% 30%, rgba(216,175,99,0.06) 0%, rgba(216,175,99,0.03) 18%, transparent 44%), linear-gradient(180deg, rgba(216,175,99,0.06) 0%, rgba(255,255,255,0.018) 100%)",
  cardBorder: "rgba(216,175,99,0.14)",
  cardBorderStrong: "rgba(216,175,99,0.20)",
  impactNeutralBorder: "rgba(185,173,155,0.24)",
  mutedText: "rgba(185,173,155,0.72)",
  softText: "#D8C5A7",
  pendingText: "rgba(185,173,155,0.48)",
  emptyIcon: "rgba(216,175,99,0.24)",
  emptyHalo: "radial-gradient(circle, rgba(216,175,99,0.10), transparent 70%)",
  journeyBorder: "rgba(66,83,109,0.55)",
  journeyBg: "rgba(66,83,109,0.10)",
  journeyText: "#b7c6dc",
  shellShadow: "0 16px 32px rgba(0,0,0,0.18)",
  selectedRowShadow:
    "inset 0 1px 0 rgba(255,232,192,0.04), 0 8px 24px rgba(216,175,99,0.08)",
  hoveredRowShadow:
    "inset 0 1px 0 rgba(255,232,192,0.03), 0 4px 14px rgba(216,175,99,0.05)",
  sidePanelShadow: "-8px 0 32px rgba(0,0,0,0.22)",
  spotlightShadow: "0 8px 24px rgba(0,0,0,0.12)",
} as const;

export const JOURNEY_TOKENS = {
  stateConqueredBorder: "rgba(216,175,99,0.20)",
  stateConqueredBg: "rgba(216,175,99,0.10)",
  stateFrontierBorder: "rgba(216,175,99,0.38)",
  stateFrontierBg:
    "linear-gradient(90deg, rgba(216,175,99,0.20) 0%, rgba(216,175,99,0.10) 100%)",
  stateFrontierText: "#f3ead8",
  stateFrontierDot: "#e9ddd0",
  stateLockedBorder: "rgba(158,175,197,0.16)",
  stateLockedBg: "rgba(255,255,255,0.03)",
  stateStripBorder: "rgba(216,175,99,0.18)",
  stateFocusBorder: "rgba(216,175,99,0.42)",
  stateFocusBg: "rgba(216,175,99,0.18)",
  stateFocusShadow: "0 6px 18px rgba(0,0,0,0.18)",
  railLocked: "rgba(158,175,197,0.34)",
  railActive: "rgba(216,175,99,0.34)",
  emptyText: "rgba(169,152,131,0.56)",
  dossierSurface:
    "radial-gradient(circle at 0% 0%, rgba(216,175,99,0.08) 0%, transparent 20%), linear-gradient(180deg, rgba(24,26,33,0.98) 0%, rgba(13,10,11,0.98) 100%)",
  dossierBorder: "rgba(216,175,99,0.18)",
  dossierInset: "inset 0 1px 0 rgba(255,232,192,0.03)",
  dossierChipBorder: "rgba(216,175,99,0.28)",
  dossierMeta: "rgba(158,175,197,0.90)",
  dossierMetaDivider: "rgba(158,175,197,0.36)",
  dossierImpactBg: "rgba(216,175,99,0.05)",
  dossierBody: "rgba(200,210,220,0.85)",
  dossierButtonIdleBg: "rgba(255,255,255,0.03)",
  dossierButtonIdleBorder: "rgba(216,175,99,0.20)",
  dossierButtonActiveBg: "rgba(216,175,99,0.12)",
  dossierButtonActiveBorder: "rgba(216,175,99,0.34)",
  mapNodeConqueredBorder: "rgba(216,175,99,0.58)",
  mapNodeConqueredSurface:
    "radial-gradient(circle at 50% 24%, rgba(242,203,127,0.20), transparent 42%), linear-gradient(180deg, rgba(52,38,28,0.95) 0%, rgba(20,15,14,0.96) 100%)",
  mapNodeConqueredGlow: "0 0 0 10px rgba(216,175,99,0.08), 0 0 28px rgba(216,175,99,0.18)",
  mapNodeFrontierBorder: "rgba(216,175,99,0.92)",
  mapNodeFrontierSurface:
    "radial-gradient(circle at 50% 16%, rgba(242,203,127,0.34), transparent 46%), linear-gradient(180deg, rgba(64,44,29,0.98) 0%, rgba(20,15,14,0.98) 100%)",
  mapNodeFrontierGlow: "0 0 0 12px rgba(216,175,99,0.12), 0 0 42px rgba(216,175,99,0.36)",
  mapNodeFrontierIcon: "#f3ead8",
  mapNodeFrontierText: "#f3ead8",
  mapNodeFrontierBadge: "rgba(216,175,99,0.24)",
  mapNodeFrontierBadgeBorder: "rgba(216,175,99,0.42)",
  mapNodeLockedBorder: "rgba(118,107,94,0.46)",
  mapNodeLockedSurface:
    "radial-gradient(circle at 50% 16%, rgba(66,83,109,0.10), transparent 36%), linear-gradient(180deg, rgba(31,29,31,0.96) 0%, rgba(18,17,20,0.96) 100%)",
  mapNodeLockedIcon: "rgba(158,175,197,0.70)",
  mapNodeLockedText: "rgba(216,175,99,0.72)",
  mapNodeLockedBadge: "rgba(255,255,255,0.04)",
  mapNodeLockedBadgeBorder: "rgba(158,175,197,0.18)",
  glyphShadow: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
  glyphLockedOverlay: "linear-gradient(180deg, rgba(16,16,18,0.08), rgba(16,16,18,0.26))",
  glyphConqueredOverlay: "radial-gradient(circle at 50% 28%, rgba(242,203,127,0.16), transparent 52%)",
  glyphFrontierOverlay: "radial-gradient(circle at 50% 24%, rgba(242,203,127,0.24), transparent 48%)",
  glyphFrontierBeacon: "rgba(233,221,208,0.95)",
  glyphFrontierBeaconShadow:
    "0 0 0 8px rgba(216,175,99,0.12), 0 0 22px rgba(242,203,127,0.55)",
  mapShellBorder: "rgba(216,175,99,0.18)",
  mapShellSurface:
    "radial-gradient(circle at 20% 58%, rgba(216,175,99,0.10) 0%, rgba(216,175,99,0.04) 24%, transparent 48%), radial-gradient(circle at 58% 42%, rgba(216,175,99,0.05) 0%, transparent 22%), linear-gradient(90deg, rgba(64,44,29,0.18) 0%, rgba(64,44,29,0.08) 44%, rgba(12,10,12,0.00) 54%), linear-gradient(180deg, rgba(26,27,34,0.84) 0%, rgba(13,10,11,0.94) 100%), url('/journey-map/backgrounds/base-paper-bg.png')",
  mapShellShadow:
    "inset 0 1px 0 rgba(255,232,192,0.04), inset 0 -18px 40px rgba(0,0,0,0.28)",
  mapTopGlow:
    "linear-gradient(180deg, rgba(242,203,127,0.10), rgba(242,203,127,0.00))",
  mapCenterBeam:
    "linear-gradient(180deg, rgba(216,175,99,0.00) 0%, rgba(216,175,99,0.08) 24%, rgba(216,175,99,0.10) 50%, rgba(216,175,99,0.00) 100%)",
  mapProgressField:
    "linear-gradient(90deg, rgba(216,175,99,0.10) 0%, rgba(216,175,99,0.04) 72%, rgba(216,175,99,0.00) 100%)",
  mapFogWall:
    "linear-gradient(90deg, rgba(14,14,18,0.00) 0%, rgba(12,11,14,0.48) 26%, rgba(8,8,10,0.82) 100%)",
  mapFogTexture:
    "radial-gradient(circle at 24% 42%, rgba(255,255,255,0.04) 0%, transparent 18%), radial-gradient(circle at 56% 72%, rgba(255,255,255,0.03) 0%, transparent 16%), linear-gradient(90deg, rgba(16,14,16,0.00) 0%, rgba(10,10,12,0.18) 100%)",
  mapMist:
    "radial-gradient(circle at 76% 52%, rgba(255,255,255,0.03) 0%, transparent 14%), radial-gradient(circle at 84% 28%, rgba(255,255,255,0.02) 0%, transparent 18%), radial-gradient(circle at 91% 68%, rgba(255,255,255,0.025) 0%, transparent 20%)",
  routeGlowStart: "rgba(216,175,99,0.50)",
  routeGlowMid: "rgba(242,203,127,0.95)",
  routeGlowEnd: "rgba(216,175,99,0.38)",
  routeBase: "rgba(118,107,94,0.42)",
  routeLocked: "rgba(158,175,197,0.30)",
  routeConquered: "rgba(216,175,99,0.62)",
  annotationFocusBorder: "rgba(216,175,99,0.42)",
  annotationFocusBg:
    "linear-gradient(180deg, rgba(216,175,99,0.18) 0%, rgba(216,175,99,0.10) 100%)",
  annotationFocusShadow: "0 10px 20px rgba(0,0,0,0.24)",
  annotationIdleShadow: "0 6px 14px rgba(0,0,0,0.14)",
  emptyMapBorder: "rgba(216,175,99,0.18)",
  emptyMapInnerBorder: "rgba(216,175,99,0.12)",
  emptyMapLine: "rgba(216,175,99,0.14)",
  emptyMapDot: "rgba(216,175,99,0.4)",
  emptyMapBody: "rgba(216,175,99,0.66)",
  frontierPulseOuter: "rgba(216,175,99,0.12)",
  frontierPulseGlow: "rgba(216,175,99,0.36)",
  frontierPulseOuterStrong: "rgba(216,175,99,0.16)",
  frontierPulseGlowStrong: "rgba(242,203,127,0.40)",
} as const;

export const BRANCH_TOKENS = {
  fallbackBorder: "rgba(158,175,197,0.44)",
  fallbackPlate: "rgba(158,175,197,0.10)",
  inactiveDropShadow: "rgba(0,0,0,0.18)",
  baseShadowActive: "rgba(0,0,0,0.35)",
  baseShadowIdle: "rgba(0,0,0,0.32)",
  tierIdleBorder: "rgba(158,175,197,0.26)",
  tierActiveBg: "rgba(255,255,255,0.03)",
  tierIdleBg: "rgba(0,0,0,0.12)",
  signalTextActive: "rgba(255,232,192,0.70)",
  signalTextIdle: "rgba(216,175,99,0.58)",
  pendingText: "rgba(216,175,99,0.44)",
  spineGhost: "rgba(0,0,0,0.22)",
  pendingShellBorder: "rgba(158,175,197,0.24)",
  pendingShellBg:
    "linear-gradient(180deg, rgba(158,175,197,0.08), rgba(255,255,255,0.025))",
  knownLanesBorder: "rgba(216,175,99,0.18)",
  knownLanesBg: "rgba(216,175,99,0.035)",
  knownLaneIdleBorder: "rgba(158,175,197,0.30)",
  knownLaneActiveBg: "rgba(216,175,99,0.10)",
  knownLaneIdleBg: "rgba(158,175,197,0.055)",
  emptyBorder: "rgba(216,175,99,0.22)",
  emptyBg: "rgba(255,255,255,0.05)",
  popupTrack: "rgba(158,175,197,0.15)",
  popupSurface:
    "linear-gradient(160deg, rgba(24,26,33,0.97) 0%, rgba(13,10,11,0.98) 100%)",
  popupShadow: "0 24px 60px rgba(0,0,0,0.6)",
  popupButtonBorder: "rgba(158,175,197,0.25)",
  popupUnscoredBorder: "rgba(158,175,197,0.28)",
  popupPositive: "rgba(34,197,94,0.9)",
  popupPositiveBorder: "rgba(34,197,94,0.28)",
  popupPositiveBg: "rgba(34,197,94,0.07)",
  popupNegative: "rgba(230,80,40,0.9)",
  popupNegativeBorder: "rgba(230,80,40,0.28)",
  popupNegativeBg: "rgba(230,80,40,0.07)",
  popupMixed: "rgba(158,175,197,0.9)",
  popupMixedBorder: "rgba(158,175,197,0.28)",
  popupMixedBg: "rgba(158,175,197,0.07)",
} as const;

export const RADAR_TOKENS = {
  activeNodeStroke: "rgba(255,255,255,0.55)",
  gridStroke: "rgba(216,175,99,0.18)",
  tickFill: "rgba(255,232,192,0.36)",
} as const;

export const OVERVIEW_TOKENS = {
  errorAura: "rgba(130,71,64,0.09)",
  errorSurface: "rgba(255,255,255,0.035)",
  errorBorder: "rgba(130,71,64,0.32)",
  retryBorder: "rgba(216,175,99,0.34)",
  stageAura: "rgba(216,175,99,0.07)",
  sideDivider: "rgba(216,175,99,0.10)",
  groundShadow: "rgba(0,0,0,0.38)",
  portraitFade:
    "linear-gradient(180deg, rgba(30,23,18,0) 0%, rgba(30,23,18,0.91) 68%, rgba(30,23,18,1) 100%)",
  primaryCardBorder: "rgba(216,175,99,0.38)",
  primaryCardSurface:
    "linear-gradient(180deg, rgba(216,175,99,0.18), rgba(255,255,255,0.035))",
  primaryCardShadow:
    "inset 0 1px 0 rgba(255,232,192,0.12), inset 0 -1px 0 rgba(0,0,0,0.3), 0 18px 38px rgba(216,175,99,0.14)",
  actionHoverText: "#ffe8c0",
  secondaryCardBorder: "rgba(216,175,99,0.18)",
  secondaryCardSurface: "rgba(255,255,255,0.025)",
  secondaryCardShadow:
    "inset 0 1px 0 rgba(216,175,99,0.08), inset 0 -1px 0 rgba(0,0,0,0.24)",
  fairnessDivider: "rgba(255,232,192,0.08)",
} as const;

export const COMPETENCY_TOKENS = {
  fallbackBorder: "rgba(158,175,197,0.45)",
  fallbackBg: "rgba(255,255,255,0.08)",
  focusShellBorder: "rgba(216,175,99,0.25)",
  focusShellAura:
    "radial-gradient(circle at 50% 45%, rgba(216,175,99,0.13), rgba(216,175,99,0.055) 42%, rgba(216,175,99,0.02) 72%, transparent 100%)",
  focusShellInset: "inset 0 0 64px rgba(216,175,99,0.04)",
  readingBorder: "rgba(66,83,109,0.34)",
  readingBg: "rgba(66,83,109,0.08)",
  scoreBorder: "rgba(216,175,99,0.34)",
  scoreBg: "rgba(216,175,99,0.06)",
  confidenceBorder: "rgba(158,175,197,0.28)",
  confidenceBg: "rgba(158,175,197,0.06)",
  latticeShellBorder: "rgba(216,175,99,0.20)",
  latticeShellSurface:
    "linear-gradient(180deg, rgba(216,175,99,0.055), rgba(255,255,255,0.02))",
  latticeActiveBorder: "rgba(66,83,109,0.34)",
  latticeActiveBg: "rgba(66,83,109,0.08)",
  latticeIdleBorder: "rgba(158,175,197,0.28)",
  latticeIdleBg: "rgba(158,175,197,0.06)",
  coreGlow: "rgba(216,175,99,0.45)",
  coreBg: "linear-gradient(145deg, rgba(216,175,99,0.32), rgba(216,175,99,0.14))",
  coreCenterBg:
    "radial-gradient(circle, rgba(216,175,99,0.22), rgba(216,175,99,0.07))",
  coreCenterGlow: "0 16px 32px rgba(216,175,99,0.18)",
  depthGlow: "rgba(66,83,109,0.4)",
  depthBg: "linear-gradient(145deg, rgba(66,83,109,0.28), rgba(66,83,109,0.12))",
  depthCenterBg:
    "radial-gradient(circle, rgba(66,83,109,0.22), rgba(66,83,109,0.07))",
  depthCenterGlow: "0 16px 32px rgba(66,83,109,0.18)",
  mindsetGlow: "rgba(130,71,64,0.4)",
  mindsetBg: "linear-gradient(145deg, rgba(130,71,64,0.24), rgba(130,71,64,0.10))",
  mindsetCenterBg:
    "radial-gradient(circle, rgba(130,71,64,0.20), rgba(130,71,64,0.06))",
  mindsetCenterGlow: "0 16px 32px rgba(130,71,64,0.16)",
  collabGlow: "rgba(68,96,76,0.4)",
  collabBg: "linear-gradient(145deg, rgba(68,96,76,0.28), rgba(68,96,76,0.12))",
  collabCenterBg:
    "radial-gradient(circle, rgba(68,96,76,0.22), rgba(68,96,76,0.07))",
  collabCenterGlow: "0 16px 32px rgba(68,96,76,0.18)",
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
