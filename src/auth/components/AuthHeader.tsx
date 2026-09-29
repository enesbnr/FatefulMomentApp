import { Image, StyleSheet, Text, View } from 'react-native';
import { layout, spacing, typography } from '../../theme/authLanding';

type Props = {
  subtitle?: string;
  title?: string;
};

export default function AuthHeader({
  subtitle,
  title = 'Welcome to Fateful Moment',
}: Props) {
  return (
    <View>
      <Image
        source={require('../../../assets/auth/fateful-moment-logo.png')}
        style={styles.logo}
        accessibilityLabel="Fateful Moment"
      />
      <View style={styles.textGroup}>
        <Text style={typography.authLandingTitle}>{title}</Text>
        {subtitle != null && (
          <Text style={typography.authLandingSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  logo: {
    width: layout.logoSize,
    height: layout.logoSize,
    aspectRatio: 1,
    resizeMode: 'contain',
    flexShrink: 0,
    borderRadius: layout.logoSize / 2,
    alignSelf: 'center',
  },
  textGroup: { marginTop: spacing.logoToTitle, gap: spacing.titleToSubtitle },
});
