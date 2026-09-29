import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import EmailIcon from '../../../assets/auth/email-icon.svg';
import AppleIcon from '../../../assets/auth/apple-icon.svg';
import AuthButton from './components/AuthButton';
import AuthHeader from './components/AuthHeader';
import {
  colors,
  spacing,
  effects,
  getContentTopSpacing,
  layout,
  typography,
} from '../../theme/authLanding';

const noop = () => {};

export default function AuthLandingScreen({
  onContinueWithEmail = noop,
}: {
  onContinueWithEmail?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: getContentTopSpacing(insets.top) },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
      >
        <View style={[styles.contentWidth, styles.upperContent]}>
          <View style={styles.header}>
            <AuthHeader subtitle="Sign in to continue your journey" />
          </View>
          <View style={styles.buttons}>
            <AuthButton
              variant="primaryGlass"
              label="Continue with Email"
              onPress={onContinueWithEmail}
              icon={
                <EmailIcon
                  width={24}
                  height={24}
                  preserveAspectRatio="xMidYMid meet"
                />
              }
            />
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={[typography.authDividerText, styles.dividerText]}>
                OR
              </Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={[styles.socialButtons, effects.socialWrapper]}>
              <AuthButton
                variant="social"
                label="Continue with Apple"
                onPress={noop}
                icon={
                  <AppleIcon
                    width={22}
                    height={22}
                    preserveAspectRatio="xMidYMid meet"
                  />
                }
              />
              <AuthButton
                variant="social"
                label="Continue with Google"
                onPress={noop}
                icon={
                  <Image
                    source={require('../../../assets/auth/google-icon.png')}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                }
              />
            </View>
          </View>
        </View>
        <View style={styles.spacer} />
        <View style={[styles.contentWidth, styles.legal]}>
          <Text style={typography.authLegalText}>
            By continuing you agree to the{' '}
            <Text style={styles.legalLink}>Terms of Use</Text> and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.horizontalPadding,
    paddingBottom: spacing.legalBottom,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: layout.contentMaxWidth,
  },
  upperContent: { flexShrink: 0 },
  spacer: { flexGrow: 1, minHeight: spacing.legalMinimumGap },
  header: { paddingBottom: spacing.headerBottom },
  buttons: { marginTop: spacing.headerToButtons },
  divider: {
    height: layout.dividerTextSize,
    gap: layout.dividerGap,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.buttonToDivider,
    marginBottom: spacing.dividerToSocial,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.dividerLine },
  dividerText: {
    width: layout.dividerTextSize,
    height: layout.dividerTextSize,
  },
  socialButtons: {
    gap: spacing.socialButtons,
    borderRadius: layout.socialWrapperRadius,
  },
  googleIcon: { width: 22, height: 22 },
  legal: { flexShrink: 0 },
  legalLink: { color: colors.legalLink },
});
