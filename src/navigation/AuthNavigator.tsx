import { createContext, useContext } from 'react';
import { Keyboard, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthLandingScreen from '../features/auth/AuthLandingScreen';
import CheckYourEmailScreen from '../features/auth/CheckYourEmailScreen';
import CreateAccountScreen, {
  type DummyAccount,
} from '../features/auth/CreateAccountScreen';
import EmailSignInScreen from '../features/auth/EmailSignInScreen';
import ResetPasswordScreen from '../features/auth/ResetPasswordScreen';
import type { AuthScreenProps, AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type Props = {
  account: DummyAccount | null;
  onAccountCreated: (account: DummyAccount) => void;
  onAuthenticated: () => void;
};

export default function AuthNavigator(props: Props) {
  return (
    <AuthNavigatorContext.Provider value={props}>
      <StatusBar barStyle="light-content" hidden={false} />
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen name="Landing" component={LandingRoute} />
        <Stack.Screen name="EmailSignIn" component={EmailSignInRoute} />
        <Stack.Screen name="CreateAccount" component={CreateAccountRoute} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordRoute} />
        <Stack.Screen name="CheckEmail" component={CheckEmailRoute} />
      </Stack.Navigator>
    </AuthNavigatorContext.Provider>
  );
}

const AuthNavigatorContext = createContext<Props | null>(null);

function useAuthNavigatorContext() {
  const context = useContext(AuthNavigatorContext);
  if (!context) {
    throw new Error(
      'useAuthNavigatorContext must be used within AuthNavigator',
    );
  }
  return context;
}

function LandingRoute({ navigation }: AuthScreenProps<'Landing'>) {
  return (
    <AuthLandingScreen
      onContinueWithEmail={() => navigation.navigate('EmailSignIn')}
    />
  );
}

function EmailSignInRoute({ navigation }: AuthScreenProps<'EmailSignIn'>) {
  const { account, onAuthenticated } = useAuthNavigatorContext();
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

function CreateAccountRoute({ navigation }: AuthScreenProps<'CreateAccount'>) {
  const { onAccountCreated } = useAuthNavigatorContext();
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
