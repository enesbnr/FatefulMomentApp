import { useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { colors, layout } from '../../theme/authLanding';
import EyeNotIcon from '../../../assets/auth/eye-not.svg';
import EyeIcon from '../../../assets/auth/eye.svg';
import {
  emailSpacing as spacing,
  emailTypography,
  getEmailContentTop,
} from '../../theme/emailSignIn';
import AuthHeader from './components/AuthHeader';
import BackButton from './components/BackButton';
import FormField from './components/FormField';
import AuthButton from './components/AuthButton';
import {
  canSubmitSignIn,
  credentialsMatch,
  getEmailError,
  validationMessages,
} from './validation/authValidation';

const noop = () => {};
type Props = {
  onBack: () => void;
  onSignInSuccess?: () => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  account?: { email: string; password: string } | null;
};

export default function EmailSignInScreen({
  onBack,
  onSignInSuccess = noop,
  onForgotPassword = noop,
  onSignUp = noop,
  account = null,
}: Props) {
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const canSubmit = canSubmitSignIn(email, password);
  const emailError = getEmailError(email);
  const showPasswordControl = passwordFocused || password.length > 0;
  const submit = () => {
    const accountMatches = credentialsMatch(account, email, password);
    setPasswordError(
      accountMatches
        ? undefined
        : validationMessages.invalidCredentials,
    );
    if (accountMatches) {
      onSignInSuccess();
    }
  };
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: getEmailContentTop(insets.top) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.width}>
            <View style={styles.header}>
              <AuthHeader subtitle="Sign in with Email" />
              <View style={styles.back}>
                <BackButton onPress={onBack} />
              </View>
            </View>
            <View style={styles.form}>
              <FormField
                accessibilityLabel="Email"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                inputMode="email"
                keyboardType="email-address"
                showSoftInputOnFocus
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                errorMessage={emailError}
                helperFontFamily="Nunito"
              />
              <View
                style={[
                  styles.password,
                  emailError && styles.fieldAfterError,
                ]}
              >
                <FormField
                  ref={passwordRef}
                  accessibilityLabel="Password"
                  placeholder="Password"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    setPasswordError(undefined);
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (canSubmit) {
                      submit();
                    }
                  }}
                  errorMessage={passwordError}
                  helperFontFamily="Nunito"
                  trailing={
                    showPasswordControl ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          passwordVisible ? 'Hide password' : 'Show password'
                        }
                        onPress={() => setPasswordVisible(visible => !visible)}
                        style={styles.eyeButton}
                      >
                        {passwordVisible ? (
                          <EyeNotIcon
                            width={18}
                            height={18}
                            preserveAspectRatio="xMidYMid meet"
                          />
                        ) : (
                          <EyeIcon
                            width={18}
                            height={18}
                            preserveAspectRatio="xMidYMid meet"
                          />
                        )}
                      </Pressable>
                    ) : null
                  }
                />
              </View>
              <View
                style={[
                  styles.submit,
                  passwordError && styles.submitAfterError,
                ]}
              >
                <AuthButton
                  variant="primaryGlass"
                  label="Sign in"
                  disabled={!canSubmit}
                  onPress={submit}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={onForgotPassword}
                style={styles.forgot}
              >
                <Text style={emailTypography.forgot}>Forgot password?</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.spacer} />
          <View style={[styles.width, styles.footer]}>
            <Text style={emailTypography.secondary}>
              Don't have an account?
            </Text>
            <Pressable accessibilityRole="link" onPress={onSignUp}>
              <Text style={emailTypography.switchLink}>Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.horizontalPadding,
    paddingBottom: spacing.footerBottom,
  },
  width: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    flexShrink: 0,
  },
  header: { paddingTop: spacing.backToHeaderTop },
  // Figma's back control overlaps the empty left side of the logo group.
  back: { position: 'absolute', top: 0, left: 0 },
  form: { marginTop: spacing.headerToForm },
  password: { marginTop: spacing.fields },
  fieldAfterError: { marginTop: 12 },
  submit: { marginTop: spacing.passwordToSubmit },
  submitAfterError: { marginTop: 28 },
  eyeButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgot: { marginTop: spacing.submitToForgot, alignSelf: 'center' },
  spacer: { flexGrow: 1, minHeight: spacing.footerMinimumGap },
  footer: {
    minHeight: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
