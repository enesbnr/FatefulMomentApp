import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  colors,
  getContentTopSpacing,
  layout,
} from '../../theme/authLanding';
import { emailSpacing } from '../../theme/emailSignIn';
import AuthButton from './components/AuthButton';
import AuthHeader from './components/AuthHeader';
import BackButton from './components/BackButton';
import FormField from './components/FormField';
import { isValidEmail } from './validation/authValidation';

type Props = {
  initialEmail?: string;
  onBack: () => void;
  onSubmit: (email: string) => void;
};

export default function ResetPasswordScreen({
  initialEmail = '',
  onBack,
  onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(initialEmail);
  const canSubmit = isValidEmail(email);

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: getContentTopSpacing(insets.top) },
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
              <AuthHeader
                title="Reset your password"
                subtitle="Enter your email to receive a reset link"
              />
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
                returnKeyType="done"
              />
              <View style={styles.submit}>
                <AuthButton
                  variant="primaryGlass"
                  label="Sign In"
                  disabled={!canSubmit}
                  onPress={() => onSubmit(email.trim())}
                />
              </View>
            </View>
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
    paddingBottom: emailSpacing.footerBottom,
  },
  width: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    flexShrink: 0,
  },
  header: { position: 'relative' },
  back: {
    position: 'absolute',
    top: -emailSpacing.backToHeaderTop,
    left: 0,
  },
  form: { marginTop: emailSpacing.headerToForm },
  submit: { marginTop: 24 },
});
