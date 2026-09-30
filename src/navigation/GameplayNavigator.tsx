import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../features/home/HomeScreen';
import ScenarioBriefingScreen from '../features/simulation/screens/ScenarioBriefingScreen';
import ScenarioVideoScreen from '../features/simulation/screens/ScenarioVideoScreen';
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
          {({ navigation }) => (
            <HomeScreen
              onBack={onExit}
              onScenarioStart={scenarioId =>
                navigation.navigate('ScenarioBriefing', { scenarioId })
              }
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="ScenarioBriefing"
          component={ScenarioBriefingScreen}
        />
        <Stack.Screen name="ScenarioVideo" component={ScenarioVideoScreen} />
      </Stack.Navigator>
    </>
  );
}
