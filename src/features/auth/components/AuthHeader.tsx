import { Image, StyleSheet, Text, View } from 'react-native';
import { layout, spacing, typography } from '../../../theme/authLanding';

type Props = {
  subtitle?: string;
  textMaxWidth?: number;
  title?: string;
};

export default function AuthHeader({
  subtitle,
  textMaxWidth = layout.contentMaxWidth,
  title = 'Welcome to Fateful Moment',
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/auth/fateful-moment-logo.png')}
        style={styles.logo}
        accessibilityLabel="Fateful Moment"
      />
      <View
        style={[styles.textGroup, { maxWidth: textMaxWidth }]}
        testID="auth-header-text-group"
      >
        <Text style={typography.authLandingTitle}>{title}</Text>
        {subtitle != null && (
          <Text style={typography.authLandingSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: layout.logoSize,
    height: layout.logoSize,
    aspectRatio: 1,
    resizeMode: 'contain',
    flexShrink: 0,
    borderRadius: layout.logoSize / 2,
    alignSelf: 'center',
  },
  textGroup: {
    width: '100%',
    marginTop: spacing.logoToTitle,
    gap: spacing.titleToSubtitle,
  },
});
