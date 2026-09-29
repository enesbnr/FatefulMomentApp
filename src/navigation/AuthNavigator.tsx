import { Keyboard, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthLandingScreen from '../auth/AuthLandingScreen';
import CheckYourEmailScreen from '../auth/CheckYourEmailScreen';
import CreateAccountScreen, {
  type DummyAccount,
} from '../auth/CreateAccountScreen';
import EmailSignInScreen from '../auth/EmailSignInScreen';
import ResetPasswordScreen from '../auth/ResetPasswordScreen';
import type { AuthScreenProps, AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type Props = {
  account: DummyAccount | null;
  onAccountCreated: (account: DummyAccount) => void;
  onAuthenticated: () => void;
};

export default function AuthNavigator(props: Props) {
  return (
    <>
      <StatusBar barStyle="light-content" hidden={false} />
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen name="Landing" component={LandingRoute} />
        <Stack.Screen name="EmailSignIn">
          {screenProps => <EmailSignInRoute {...screenProps} {...props} />}
        </Stack.Screen>
        <Stack.Screen name="CreateAccount">
          {screenProps => <CreateAccountRoute {...screenProps} {...props} />}
        </Stack.Screen>
        <Stack.Screen name="ResetPassword" component={ResetPasswordRoute} />
        <Stack.Screen name="CheckEmail" component={CheckEmailRoute} />
      </Stack.Navigator>
    </>
  );
}

function LandingRoute({
  navigation,
}: AuthScreenProps<'Landing'>) {
  return (
    <AuthLandingScreen
      onContinueWithEmail={() => navigation.navigate('EmailSignIn')}
    />
  );
}

function EmailSignInRoute({
  navigation,
  account,
  onAuthenticated,
}: AuthScreenProps<'EmailSignIn'> & Props) {
  return (
    <EmailSignInScreen
      onBack={() => navigation.goBack()}
      onForgotPassword={() =>
        navigation.navigate('ResetPassword', { initialEmail: '' })
      }
      onSignUp={() => navigation.navigate('CreateAccount')}
      onSignInSuccess={() => {
        Keyboard.dismiss();
        onAuthenticated();
      }}
      account={account}
    />
  );
}

function CreateAccountRoute({
  navigation,
  onAccountCreated,
}: AuthScreenProps<'CreateAccount'> & Props) {
  const returnToSignIn = () => navigation.popTo('EmailSignIn');
  return (
    <CreateAccountScreen
      onBack={() => navigation.goBack()}
      onSignIn={returnToSignIn}
      onSubmit={account => {
        onAccountCreated(account);
        returnToSignIn();
      }}
    />
  );
}

function ResetPasswordRoute({
  navigation,
  route,
}: AuthScreenProps<'ResetPassword'>) {
  return (
    <ResetPasswordScreen
      initialEmail={route.params?.initialEmail ?? ''}
      onBack={() => navigation.goBack()}
      onSubmit={email => navigation.navigate('CheckEmail', { email })}
    />
  );
}

function CheckEmailRoute({
  navigation,
  route,
}: AuthScreenProps<'CheckEmail'>) {
  return (
    <CheckYourEmailScreen
      email={route.params.email}
      onBack={() => navigation.goBack()}
      onBackToSignIn={() => navigation.popTo('EmailSignIn')}
    />
  );
}
