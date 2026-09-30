import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Orientation from 'react-native-orientation-locker';
import type { DummyAccount } from '../features/auth/CreateAccountScreen';
import { demoAccount } from '../features/auth/data/demoAccount';
import AuthNavigator from './AuthNavigator';
import GameplayNavigator from './GameplayNavigator';
import type { RootScreenProps, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type AuthSessionContextValue = {
  account: DummyAccount;
  setAccount: Dispatch<SetStateAction<DummyAccount>>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export default function RootNavigator() {
  const [account, setAccount] = useState<DummyAccount>(demoAccount);
  const authSession = useMemo(() => ({ account, setAccount }), [account]);

  return (
    <AuthSessionContext.Provider value={authSession}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{ headerShown: false, animation: 'none' }}
        >
          <Stack.Screen name="Auth" component={AuthRoute} />
          <Stack.Screen
            name="Gameplay"
            component={GameplayRoute}
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthSessionContext.Provider>
  );
}

function AuthRoute({ navigation }: RootScreenProps<'Auth'>) {
  const { account, setAccount } = useAuthSession();

  const handleAuthenticated = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Gameplay' }],
    });
  }, [navigation]);

  return (
    <AuthOrientationBoundary>
      <AuthNavigator
        account={account}
        onAccountCreated={setAccount}
        onAuthenticated={handleAuthenticated}
      />
    </AuthOrientationBoundary>
  );
}

function GameplayRoute() {
  return (
    <GameplayOrientationBoundary>
      <GameplayNavigator />
    </GameplayOrientationBoundary>
  );
}

function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionContext');
  }
  return context;
}

function AuthOrientationBoundary({ children }: { children: ReactNode }) {
  useFocusEffect(
    useCallback(() => {
      Orientation.lockToPortrait();
    }, []),
  );
  return children;
}

function GameplayOrientationBoundary({
  children,
}: {
  children: ReactNode;
}) {
  useFocusEffect(
    useCallback(() => {
      Orientation.lockToLandscape();
      return () => Orientation.lockToPortrait();
    }, []),
  );
  return children;
}
