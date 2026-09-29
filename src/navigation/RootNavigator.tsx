import { useCallback, useState, type ReactNode } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Orientation from 'react-native-orientation-locker';
import type { DummyAccount } from '../auth/CreateAccountScreen';
import AuthNavigator from './AuthNavigator';
import GameplayNavigator from './GameplayNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [account, setAccount] = useState<DummyAccount | null>(null);

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
                onAuthenticated={() => navigation.navigate('Gameplay')}
              />
            </AuthOrientationBoundary>
          )}
        </Stack.Screen>
        <Stack.Screen name="Gameplay">
          {({ navigation }) => (
            <GameplayOrientationBoundary>
              <GameplayNavigator
                onExit={() => navigation.goBack()}
              />
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
