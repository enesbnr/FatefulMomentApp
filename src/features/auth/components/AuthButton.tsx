import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, typography } from '../../../theme/authLanding';

type AuthButtonProps = {
  variant: 'primaryGlass' | 'social';
  icon?: ReactNode;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

export default function AuthButton({
  variant,
  icon,
  label,
  onPress,
  disabled = false,
}: AuthButtonProps) {
  const primary = variant === 'primaryGlass';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={[styles.button, styles[variant], disabled && styles.disabled]}
    >
      {icon != null && (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.iconBox,
            primary ? styles.emailIconBox : styles.socialIconBox,
          ]}
        >
          {icon}
        </View>
      )}
      <Text
        style={[
          typography.authButtonLabel,
          styles.label,
          primary && styles.primaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    height: layout.buttonHeight,
    borderRadius: layout.buttonRadius,
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    opacity: 1,
  },
  disabled: { opacity: 0.35 },
  primaryGlass: {
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: colors.emailBackground,
    borderWidth: 1,
    borderColor: 'rgba(150, 220, 235, 0.45)',
  },
  social: {
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: colors.socialBackground,
  },
  iconBox: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIconBox: { width: 24, height: 24 },
  socialIconBox: { width: 22, height: 22 },
  label: { flexShrink: 1, fontWeight: '500' },
  primaryLabel: { color: colors.cyan },
});
