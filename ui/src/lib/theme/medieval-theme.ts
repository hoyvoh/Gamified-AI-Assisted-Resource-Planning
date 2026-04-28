export const MEDIEVAL_THEME = {
  backgrounds: {
    pageBase: "#0c0907",
    pageTop: "#17110c",
    pageBottom: "#080605",
    shellTop: "#1d140e",
    shellBottom: "#0e0b09",
    shellMid: "#17110d",
    panelTop: "#1f150e",
    panelBottom: "#140e0a",
    panelRaisedTop: "#2e2014",
    panelRaisedBottom: "#201811",
    plaqueTop: "#2d2116",
    plaqueBottom: "#211811",
    plaqueHoverTop: "#3a2b1b",
    plaqueHoverBottom: "#281d13",
  },
  text: {
    primary: "#f3e3c1",
    heading: "#f4e6c8",
    secondary: "#e4d3af",
    soft: "#d8c19b",
    muted: "#d5bf90",
    dim: "#b89d71",
    inverse: "#24170c",
  },
  accents: {
    brass: "#d1ac67",
    brassBright: "#e3c480",
    brassSoft: "#d6bf94",
    brassBorder: "#a17737",
    brassBorderStrong: "#b89254",
    brassBorderMuted: "#8d6934",
    brassRailTop: "#caa35c",
    brassRailBottom: "#7f5a28",
    steel: "#617495",
    steelLight: "#b7c6dc",
    wax: "#8f4538",
    waxLight: "#e4aea2",
    forest: "#4d684f",
    forestLight: "#bad1bd",
    iron: "#8f826d",
    ironLight: "#d6c6a7",
    silver: "#9f9076",
  },
  effects: {
    shellShadow: "0 34px 80px rgba(0, 0, 0, 0.65)",
    panelShadow: "0 24px 70px rgba(0,0,0,0.35)",
    parchmentOverlay: "url('/journey-map/backgrounds/base-paper-bg.png')",
  },
  status: {
    active: {
      border: "#617495",
      background: "#1d2430",
      text: "#b7c6dc",
    },
    danger: {
      border: "#8f4538",
      background: "#281613",
      text: "#e4aea2",
    },
    idle: {
      border: "#8f826d",
      background: "#241c14",
      text: "#d6c6a7",
    },
    ready: {
      border: "#4d684f",
      background: "#172019",
      text: "#bad1bd",
    },
    unknown: {
      border: "#b68a44",
      background: "#261d14",
      text: "#ead9b7",
    },
  },
  gradients: {
    page:
      "radial-gradient(circle_at_14%_0%,rgba(170,120,52,0.15),transparent_24%),radial-gradient(circle_at_80%_12%,rgba(103,54,42,0.12),transparent_18%),linear-gradient(180deg,#17110c_0%,#080605_100%)",
    shell:
      "linear-gradient(180deg, rgba(29,20,14,0.96), rgba(14,11,9,0.98))",
    shellOverlay:
      "linear-gradient(180deg, rgba(209,172,103,0.08), rgba(209,172,103,0.02) 58%, transparent)",
    shellFrame:
      "radial-gradient(ellipse at 50% 18%, rgba(170,120,52,0.18), transparent 48%), radial-gradient(ellipse at 12% 58%, rgba(97,116,149,0.12), transparent 42%), radial-gradient(ellipse at 88% 70%, rgba(143,69,56,0.10), transparent 44%), linear-gradient(180deg, #17110c 0%, #100c09 35%, #080605 100%)",
    topBar:
      "linear-gradient(90deg, rgba(209,172,103,0.08), rgba(27,18,13,0.98) 28%, rgba(17,12,9,0.98) 100%)",
    rail: "linear-gradient(180deg, rgba(22,16,12,0.98), rgba(10,8,6,0.98))",
    ledger:
      "linear-gradient(180deg, rgba(25,18,13,0.97), rgba(13,10,8,0.98))",
    ledgerHeader:
      "linear-gradient(180deg, rgba(46,32,20,0.92), rgba(32,24,17,0.94))",
    selectedRow:
      "linear-gradient(90deg, rgba(106,77,33,0.26), rgba(39,28,18,0.62) 16%, rgba(25,19,14,0.94) 100%)",
    idleRow:
      "linear-gradient(90deg, rgba(255,255,255,0.02), transparent 34%)",
    hoverRow:
      "linear-gradient(90deg, rgba(112,79,34,0.14), rgba(27,20,15,0.72) 16%, rgba(18,14,11,0.94) 100%)",
    primaryButton: "linear-gradient(180deg, #d8b362, #c79a49)",
    primaryButtonHover: "linear-gradient(180deg, #e2bf78, #d0a454)",
    secondaryButton: "linear-gradient(180deg, #2d2116, #211811)",
    secondaryButtonHover: "linear-gradient(180deg, #3a2b1b, #281d13)",
  },
} as const;

export const MEDIEVAL_ANALYSIS_CHAMBER_PALETTE = {
  parchment: MEDIEVAL_THEME.backgrounds.shellTop,
  parchmentMid: MEDIEVAL_THEME.backgrounds.shellMid,
  parchmentDeep: MEDIEVAL_THEME.backgrounds.shellBottom,
  parchmentSurface: MEDIEVAL_THEME.backgrounds.panelTop,
  parchmentReading: "#f5e8d0",
  ink: MEDIEVAL_THEME.text.primary,
  inkSoft: MEDIEVAL_THEME.text.soft,
  inkMuted: MEDIEVAL_THEME.text.muted,
  inkReading: "#1e130a",
  inkReadingSoft: "#4a3520",
  inkReadingMuted: "#6b5040",
  gold: MEDIEVAL_THEME.accents.brass,
  goldLight: MEDIEVAL_THEME.accents.brassBright,
  goldPale: "rgba(209, 172, 103, 0.18)",
  goldDark: MEDIEVAL_THEME.accents.brassBorderMuted,
  ember: MEDIEVAL_THEME.accents.wax,
  emberLight: MEDIEVAL_THEME.accents.waxLight,
  crimson: "#6f241d",
  crimsonLight: "#cf7d70",
  azure: MEDIEVAL_THEME.accents.steel,
  azureLight: MEDIEVAL_THEME.accents.steelLight,
  vert: MEDIEVAL_THEME.accents.forest,
  vertLight: MEDIEVAL_THEME.accents.forestLight,
  silver: MEDIEVAL_THEME.accents.silver,
  shellShadow: MEDIEVAL_THEME.effects.shellShadow,
} as const;
