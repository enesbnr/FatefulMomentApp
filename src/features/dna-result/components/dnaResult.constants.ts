import type { DnaDimension } from '../../../entities/scenario/model/decisionTypes';
import { appColors, withAlpha } from '../../../theme/colors';
import { fontFamilies } from '../../../theme/typography';

export const dnaResultLayout = {
  referenceWidth: 812,
  referenceHeight: 375,
  contentWidth: 727,
  contentHeight: 272,
  columnWidth: 355.5,
  columnGap: 16,
  protectedEdge: 66,
  compactEdge: 19,
} as const;

export const dnaResultColors = {
  background: appColors.background,
  panel: withAlpha(appColors.surfaceElevated, 0.4),
  matrixPanel: withAlpha(appColors.surfaceElevated, 0.6),
  panelBorder: appColors.cardBorder,
  accent: appColors.accent,
  accentSecondary: appColors.link,
  radar: appColors.accentStrong,
  title: appColors.textSoft,
  text: appColors.textPrimary,
  muted: appColors.textSecondary,
  subdued: appColors.textMuted,
  danger: appColors.dangerStrong,
  white: appColors.white,
} as const;

export const monoFont = fontFamilies.mono;

export const dnaTraitOrder: DnaDimension[] = [
  'vision',
  'courage',
  'risk',
  'control',
  'empathy',
  'ethics',
];

export const dnaTraitLabels: Record<DnaDimension, string> = {
  vision: 'Vision',
  courage: 'Courage',
  risk: 'Risk',
  control: 'Control',
  empathy: 'Empathy',
  ethics: 'Ethics',
};
