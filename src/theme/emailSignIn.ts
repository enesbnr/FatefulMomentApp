import { appColors, withAlpha } from './colors';
import { fontFamilies } from './typography';
import { StyleSheet } from 'react-native';
import { colors } from './authLanding';

export const emailSpacing = {
  backReferenceTop: 64,
  minimumTopGap: 16, // Responsive fallback for screens that only show the back control.
  backToHeaderTop: 18, // 82 - 64; back button overlaps the header's empty left area.
  headerToForm: 32,
  fields: 32,
  passwordToSubmit: 48,
  submitToForgot: 40,
  footerMinimumGap: 24, // Responsive fallback on short/keyboard-open screens.
  footerBottom: 24, // 812 - 34 reference bottom inset - (730 + 24).
};
export const getEmailContentTop = (topInset: number) =>
  Math.max(
    emailSpacing.minimumTopGap,
    emailSpacing.backReferenceTop - topInset,
  );

export const fieldColors = {
  border: withAlpha(appColors.white, 0.05),
  focusedBorder: appColors.link,
  placeholder: appColors.textMuted,
  text: colors.white, // Also used for filled, unfocused fields; not separately specified.
  error: appColors.danger,
};
export const backStyle = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: withAlpha(appColors.white, 0.05),
    borderWidth: 0.750392,
    borderColor: withAlpha(appColors.white, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export const emailTypography = StyleSheet.create({
  input: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
    color: fieldColors.text,
    includeFontPadding: false,
  },
  secondary: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.subtitle,
    includeFontPadding: false,
  },
  forgot: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.cyan,
    includeFontPadding: false,
  },
  switchLink: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.cyan,
    textDecorationLine: 'underline',
    includeFontPadding: false,
  },
});
