export const appColors = {
  background: '#020618',
  accent: '#00D3F3',
  accentStrong: '#06B6D4',
  white: '#FFFFFF',
  textStrong: '#F8FAFC',
  textSoft: '#F1F5F9',
  textPrimary: '#E2E8F0',
  textSecondary: '#90A1B9',
  textMuted: '#62748E',
  textSubtle: '#6A7282',
  divider: '#314158',
  cardBorder: '#1D293D',
  chartGrid: '#1E293B',
  surfaceElevated: '#0F172B',
  surfaceSocial: '#111827',
  glassBorder: '#96DCEB',
  link: '#00B8DB',
  danger: '#E53A3A',
  dangerStrong: '#FB2C36',
  critical: '#FF0000',
  warning: '#FFB900',
  warningBright: '#FFD230',
  black: '#000000',
} as const;

export const withAlpha = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(value) || alpha < 0 || alpha > 1) {
    throw new Error(`Invalid color or alpha: ${hex}, ${alpha}`);
  }

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};
