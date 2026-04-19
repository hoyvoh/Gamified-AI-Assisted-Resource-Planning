/**
 * Character system constants — motion timings and particle aura configuration.
 * Migrated from dossier feature (replaced by analysis-chamber).
 */

export const CHARACTER_MOTION = {
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

export const CHARACTER_PARTICLE_AURA = {
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
