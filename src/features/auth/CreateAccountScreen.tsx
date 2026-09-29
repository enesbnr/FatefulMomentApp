import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CheckNotIcon from '../../../assets/auth/check-not.svg';
import CheckYesIcon from '../../../assets/auth/check-yes.svg';
import EyeNotIcon from '../../../assets/auth/eye-not.svg';
import EyeIcon from '../../../assets/auth/eye.svg';
import { colors, layout } from '../../theme/authLanding';
import {
  emailSpacing,
  emailTypography,
  getEmailContentTop,
} from '../../theme/emailSignIn';
import AuthButton from './components/AuthButton';
import AuthHeader from './components/AuthHeader';
import BackButton from './components/BackButton';
import FormField from './components/FormField';
import {
  canSubmitCreateAccount,
  getEmailError,
  getFullNameError,
  getPasswordRequirements,
} from './validation/authValidation';

export type DummyAccount = {
  fullName: string;
  email: string;
  password: string;
};

type Props = {
  onBack: () => void;
  onSignIn: () => void;
  onSubmit: (account: DummyAccount) => void;
};

export default function CreateAccountScreen({
  onBack,
  onSignIn,
  onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const requirementsRef = useRef<ComponentRef<typeof View>>(null);
  const passwordFocusedRef = useRef(false);
  const keyboardTopRef = useRef<number | null>(null);
  const scrollYRef = useRef(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const requirements = getPasswordRequirements(password);
  const fullNameError = getFullNameError(fullName);
  const emailError = getEmailError(email);
  const canSubmit = canSubmitCreateAccount(fullName, email, password);
  const showPasswordControl = passwordFocused || password.length > 0;
  const showPasswordRequirements = passwordFocused;
  const keepRequirementsAboveKeyboard = useCallback(() => {
    requestAnimationFrame(() => {
      const requirementsView = requirementsRef.current;
      const keyboardTop = keyboardTopRef.current;
      if (requirementsView == null) {
        return;
      }

      if (keyboardTop == null) {
        return;
      }

      requirementsView.measureInWindow((_x, y, _width, height) => {
        const requiredClearance = 46;
        const hiddenHeight = y + height + requiredClearance - keyboardTop;
        if (hiddenHeight > 0) {
          scrollRef.current?.scrollTo({
            y: scrollYRef.current + hiddenHeight,
            animated: true,
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }
    const keyboardShown = Keyboard.addListener('keyboardDidShow', event => {
      keyboardTopRef.current = event.endCoordinates.screenY;
      setKeyboardHeight(event.endCoordinates.height);
      if (passwordRef.current?.isFocused()) {
        passwordFocusedRef.current = true;
        setPasswordFocused(true);
        keepRequirementsAboveKeyboard();
      }
    });
    const keyboardHidden = Keyboard.addListener('keyboardDidHide', () => {
      if (!passwordFocusedRef.current) {
        setPasswordFocused(false);
      }
    });

    return () => {
      keyboardShown.remove();
      keyboardHidden.remove();
    };
  }, [keepRequirementsAboveKeyboard]);

  useEffect(() => {
    if (Platform.OS === 'ios' && passwordFocused && keyboardHeight > 0) {
      keepRequirementsAboveKeyboard();
    }
  }, [keyboardHeight, keepRequirementsAboveKeyboard, passwordFocused]);

  const renderFormContent = () => (
    <>
      <View style={styles.width}>
            <View style={styles.header}>
              <AuthHeader title="Create your Fateful Moment Account" />
              <View style={styles.back}>
                <BackButton onPress={onBack} />
              </View>
            </View>
            <View style={styles.form}>
              <FormField
                accessibilityLabel="Full Name"
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => emailRef.current?.focus()}
                errorMessage={fullNameError}
              />
              <View
                style={[
                  styles.fieldGap,
                  fullNameError && styles.fieldGapAfterError,
                ]}
              >
                <FormField
                  ref={emailRef}
                  accessibilityLabel="Email"
                  placeholder="Your email address"
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
              </View>
              <View
                style={[
                  styles.fieldGap,
                  emailError && styles.fieldGapAfterError,
                ]}
              >
                <FormField
                  ref={passwordRef}
                  accessibilityLabel="Password"
                  placeholder="Your password"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => {
                    passwordFocusedRef.current = true;
                    setPasswordFocused(true);
                    if (Platform.OS === 'ios') {
                      const keyboardMetrics = Keyboard.metrics();
                      if (keyboardMetrics != null) {
                        keyboardTopRef.current = keyboardMetrics.screenY;
                        setKeyboardHeight(keyboardMetrics.height);
                      }
                      keepRequirementsAboveKeyboard();
                    }
                  }}
                  onBlur={() => {
                    requestAnimationFrame(() => {
                      if (!passwordRef.current?.isFocused()) {
                        passwordFocusedRef.current = false;
                        setPasswordFocused(false);
                      }
                    });
                  }}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  returnKeyType="done"
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
                {showPasswordRequirements && (
                  <View
                    ref={requirementsRef}
                    style={styles.requirements}
                    onLayout={keepRequirementsAboveKeyboard}
                  >
                    {requirements.map(requirement => {
                      const CheckIcon = requirement.met
                        ? CheckYesIcon
                        : CheckNotIcon;
                      return (
                        <View style={styles.requirement} key={requirement.id}>
                          <CheckIcon
                            width={16}
                            height={16}
                            preserveAspectRatio="xMidYMid meet"
                          />
                          <Text
                            style={[
                              styles.requirementText,
                              requirement.met && styles.requirementTextMet,
                            ]}
                          >
                            {requirement.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
              <View style={styles.submit}>
                <AuthButton
                  variant="primaryGlass"
                  label="Sign up"
                  disabled={!canSubmit}
                  onPress={() =>
                    onSubmit({
                      fullName: fullName.trim(),
                      email: email.trim(),
                      password,
                    })
                  }
                />
              </View>
            </View>
          </View>
          <View style={styles.spacer} />
          <View style={[styles.width, styles.footer]}>
            <Text style={emailTypography.secondary}>
              Already have an account?
            </Text>
            <Pressable accessibilityRole="link" onPress={onSignIn}>
              <Text style={emailTypography.switchLink}>Sign in</Text>
            </Pressable>
          </View>
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior="padding"
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.content,
              { paddingTop: getEmailContentTop(insets.top) },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="never"
            automaticallyAdjustContentInsets={false}
            onScroll={event => {
              scrollYRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {renderFormContent()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAwareScrollView
        bottomOffset={passwordFocused ? 168 : 24}
        contentContainerStyle={[
          styles.content,
          { paddingTop: getEmailContentTop(insets.top) },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {renderFormContent()}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.horizontalPadding,
    paddingBottom: emailSpacing.footerBottom,
  },
  width: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    flexShrink: 0,
  },
  header: { paddingTop: emailSpacing.backToHeaderTop },
  back: { position: 'absolute', top: 0, left: 0 },
  form: { marginTop: 32 },
  fieldGap: { marginTop: 32 },
  fieldGapAfterError: { marginTop: 12 },
  eyeButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirements: { marginTop: 16, gap: 4 },
  requirement: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    lineHeight: 16,
    color: colors.subtitle,
    includeFontPadding: false,
  },
  requirementTextMet: { color: colors.white },
  submit: { marginTop: 48 },
  spacer: { flexGrow: 1, minHeight: 46 },
  footer: {
    minHeight: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
