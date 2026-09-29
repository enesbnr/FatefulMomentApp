import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../features/scenarios/home/HomeScreen';
import type { GameplayStackParamList } from './types';

const Stack = createNativeStackNavigator<GameplayStackParamList>();

export default function GameplayNavigator({ onExit }: { onExit: () => void }) {
  return (
    <>
      <StatusBar barStyle="light-content" hidden />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen name="Home">
          {() => <HomeScreen onBack={onExit} />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
}
