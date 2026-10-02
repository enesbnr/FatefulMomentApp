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
import { demoAccount } from '../features/auth/data/demoAccount';
import type { DummyAccount } from '../features/auth/model/types';
import AuthNavigator from './AuthNavigator';
import GameplayNavigator from './GameplayNavigator';
import type { RootScreenProps, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type DummyAccountContextValue = {
  account: DummyAccount;
  setAccount: Dispatch<SetStateAction<DummyAccount>>;
};

const DummyAccountContext = createContext<DummyAccountContextValue | null>(
  null,
);

export default function RootNavigator() {
  const [account, setAccount] = useState<DummyAccount>(demoAccount);
  const dummyAccount = useMemo(() => ({ account, setAccount }), [account]);

  return (
    <DummyAccountContext.Provider value={dummyAccount}>
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
    </DummyAccountContext.Provider>
  );
}

function AuthRoute({ navigation }: RootScreenProps<'Auth'>) {
  const { account, setAccount } = useDummyAccount();

  const handleAuthenticated = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Gameplay' }],
    });
    return Promise.resolve();
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

function useDummyAccount() {
  const context = useContext(DummyAccountContext);
  if (!context) {
    throw new Error('useDummyAccount must be used within DummyAccountContext');
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

function GameplayOrientationBoundary({ children }: { children: ReactNode }) {
  useFocusEffect(
    useCallback(() => {
      Orientation.lockToLandscape();
      return () => Orientation.lockToPortrait();
    }, []),
  );
  return children;
}
