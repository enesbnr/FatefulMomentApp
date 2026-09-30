import { useCallback, useState, type ReactNode } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Orientation from 'react-native-orientation-locker';
import type { DummyAccount } from '../features/auth/CreateAccountScreen';
import { demoAccount } from '../features/auth/data/demoAccount';
import AuthNavigator from './AuthNavigator';
import GameplayNavigator from './GameplayNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [account, setAccount] = useState<DummyAccount>(demoAccount);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen name="Auth">
          {({ navigation }) => (
            <AuthOrientationBoundary>
              <AuthNavigator
                account={account}
                onAccountCreated={setAccount}
                onAuthenticated={() =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Gameplay' }],
                  })
                }
              />
            </AuthOrientationBoundary>
          )}
        </Stack.Screen>
        <Stack.Screen name="Gameplay" options={{ gestureEnabled: false }}>
          {() => (
            <GameplayOrientationBoundary>
              <GameplayNavigator />
            </GameplayOrientationBoundary>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
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
