import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, layout } from '../../theme/authLanding';
import { emailSpacing, getEmailContentTop } from '../../theme/emailSignIn';
import AuthButton from './components/AuthButton';
import BackButton from './components/BackButton';

type Props = {
  email: string;
  onBack: () => void;
  onBackToSignIn: () => void;
};

function SuccessIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Circle
        cx={20}
        cy={20}
        r={16.67}
        stroke={colors.cyan}
        strokeWidth={3.33}
      />
      <Path
        d="M14 20.5L18.2 24.5L26.5 16"
        stroke={colors.cyan}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function CheckYourEmailScreen({
  email,
  onBack,
  onBackToSignIn,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: getEmailContentTop(insets.top) },
        ]}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.width}>
          <BackButton onPress={onBack} />
        </View>
        <View style={[styles.width, styles.main]}>
          <View style={styles.badge}>
            <SuccessIcon />
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.description}>
              We've sent password reset instructions to{' '}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </View>
          <View style={styles.button}>
            <AuthButton
              variant="primaryGlass"
              label="Back to Sign in"
              onPress={onBackToSignIn}
            />
          </View>
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
    paddingBottom: emailSpacing.footerBottom,
  },
  width: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  main: {
    alignItems: 'center',
    marginTop: 107,
    paddingBottom: 24,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 211, 243, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    width: '100%',
    maxWidth: 282,
    height: 88,
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    lineHeight: 32,
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
  description: {
    width: '100%',
    height: 48,
    maxWidth: 282,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.subtitle,
    textAlign: 'center',
    includeFontPadding: false,
  },
  email: { fontFamily: 'Inter-Medium', color: colors.white },
  button: {
    width: '100%',
    marginTop: 32,
  },
});
