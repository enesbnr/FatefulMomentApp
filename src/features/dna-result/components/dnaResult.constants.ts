import { Platform } from 'react-native';
import type { DnaDimension } from '../../../entities/scenario/model/decisionTypes';

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
  background: '#020618',
  panel: 'rgba(15, 23, 43, 0.4)',
  matrixPanel: 'rgba(15, 23, 43, 0.6)',
  panelBorder: '#1D293D',
  accent: '#00D3F3',
  accentSecondary: '#00B8DB',
  radar: '#06B6D4',
  title: '#F1F5F9',
  text: '#E2E8F0',
  muted: '#90A1B9',
  subdued: '#62748E',
  danger: '#FB2C36',
  white: '#FFFFFF',
} as const;

export const monoFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

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
