import { StyleSheet } from 'react-native';
import { appColors } from './colors';

export const colors = {
  background: appColors.background,
  white: appColors.white,
  cyan: appColors.accent,
  subtitle: '#90A1B9',
  dividerText: appColors.textMuted,
  dividerLine: 'rgba(255, 255, 255, 0.1)',
  emailBackground: 'rgba(0, 211, 243, 0.14)',
  socialBackground: 'rgba(17, 24, 39, 0.8)',
  legalLink: '#00B8DB',
  legalBody: '#6A7282',
};

// Confirmed Figma spacing; header bottom is derived from 248 - (184 + 57).
export const spacing = {
  logoToTitle: 36,
  titleToSubtitle: 8,
  headerBottom: 7,
  headerToButtons: 40,
  buttonToDivider: 24,
  dividerToSocial: 24,
  socialButtons: 16,
  // Responsive fallback, not a measured Figma gap on short screens.
  legalMinimumGap: 24,
  // 812 - (724 + 40) - 34-point reference home safe area.
  legalBottom: 14,
};

// Minimum is a responsive fallback for unusually large native top insets.
export const referencePosition = { headerTop: 82, minimumTopGap: 16 };
export const getContentTopSpacing = (topInset: number) =>
  Math.max(
    referencePosition.minimumTopGap,
    referencePosition.headerTop - topInset,
  );

// Exact Figma wrapper shadow; intentionally isolated from individual buttons.
export const effects = StyleSheet.create({
  socialWrapper: {
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 20,
        blurRadius: 25,
        spreadDistance: -5,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      {
        offsetX: 0,
        offsetY: 8,
        blurRadius: 10,
        spreadDistance: -6,
        color: 'rgba(0, 0, 0, 0.1)',
      },
    ],
  },
});

export const layout = {
  horizontalPadding: 24,
  contentMaxWidth: 327,
  logoSize: 148,
  buttonHeight: 56,
  buttonRadius: 16,
  dividerTextSize: 20,
  dividerGap: 16,
  socialWrapperRadius: 32,
};

export const typography = StyleSheet.create({
  authLandingTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: 0,
    textAlign: 'center',
    color: colors.white,
    includeFontPadding: false,
  },
  authLandingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    textAlign: 'center',
    color: colors.subtitle,
    includeFontPadding: false,
  },
  authButtonLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
    includeFontPadding: false,
  },
  authDividerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.65,
    textAlign: 'center',
    color: colors.dividerText,
    includeFontPadding: false,
  },
  authLegalText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: colors.legalBody,
    includeFontPadding: false,
  },
});
