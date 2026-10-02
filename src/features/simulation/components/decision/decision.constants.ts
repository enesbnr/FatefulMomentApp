import { appColors, withAlpha } from '../../../../theme/colors';

export const decisionLayout = {
  referenceWidth: 812,
  referenceHeight: 375,
  optionsWidth: 702,
  optionsHeight: 222,
  optionHeight: 66,
  optionGap: 12,
  optionRadius: 16,
  countdownHorizontalInset: 24,
  countdownHeight: 6,
  countdownBottom: 24,
} as const;

export const decisionColors = {
  scrim: withAlpha(appColors.black, 0.49),
  optionBackground: withAlpha(appColors.surfaceElevated, 0.63),
  selectedGradientEdge: appColors.surfaceElevated,
  selectedGradientCenter: appColors.accent,
  selectedGradientOpacity: 0.63,
  optionBorder: appColors.textStrong,
  countdownTrack: withAlpha(appColors.cardBorder, 0.56),
  countdownNormal: appColors.warningBright,
  countdownUrgent: appColors.dangerStrong,
  urgencyEdge: appColors.critical,
  badgeBackground: appColors.warningBright,
  badgeText: appColors.white,
} as const;

export const selectedOptionGradient = {
  viewBoxWidth: 345,
  viewBoxHeight: 66,
  // CSS 91.21deg mapped to the full SVG bounds. The small Y delta keeps the
  // Figma angle while allowing the dark/cyan/dark stops to span the card.
  startX: 0,
  startY: 29.35,
  endX: 345,
  endY: 36.65,
} as const;

export const decisionMotion = {
  highlightDurationMs: 280,
  revealFadeDurationMs: 450,
} as const;
