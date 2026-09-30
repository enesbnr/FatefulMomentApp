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
  scrim: 'rgba(0, 0, 0, 0.49)',
  optionBackground: 'rgba(15, 23, 43, 0.63)',
  selectedGradientEdge: '#0F172B',
  selectedGradientCenter: '#00D3F3',
  selectedGradientOpacity: 0.63,
  optionBorder: '#F8FAFC',
  countdownTrack: 'rgba(29, 41, 61, 0.56)',
  countdownNormal: '#FFD230',
  countdownUrgent: '#FB2C36',
  urgencyEdge: '#FF0000',
  badgeBackground: '#FFD230',
  badgeText: '#FFFFFF',
} as const;

export const selectedOptionGradient = {
  viewBoxWidth: 345,
  viewBoxHeight: 66,
  startX: 86.25,
  startY: 0,
  endX: 258.75,
  endY: 66,
} as const;
