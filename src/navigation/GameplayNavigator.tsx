import { appColors, withAlpha } from '../theme/colors';
import { useCallback, useState } from 'react';
import { BackHandler, StatusBar } from 'react-native';
import {
  getFocusedRouteNameFromRoute,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import {
  createDrawerNavigator,
  useDrawerStatus,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GameplaySafeAreaProvider,
  useGameplaySafeArea,
} from '../app/providers/GameplaySafeAreaProvider';
import { useScenarioProgressRepository } from '../app/providers/ScenarioProgressProvider';
import { getScenarios } from '../entities/scenario/selectors/scenarioSelectors';
import HomeScreen from '../features/home/HomeScreen';
import DNAResultScreen from '../features/dna-result/screens/DNAResultScreen';
import ScenarioBriefingScreen from '../features/simulation/screens/ScenarioBriefingScreen';
import ScenarioVideoScreen from '../features/simulation/screens/ScenarioVideoScreen';
import AppDrawerContent from './components/AppDrawerContent';
import type {
  GameplayDrawerParamList,
  GameplayScreenProps,
  GameplayStackParamList,
} from './types';

const Stack = createNativeStackNavigator<GameplayStackParamList>();
const Drawer = createDrawerNavigator<GameplayDrawerParamList>();

export default function GameplayNavigator() {
  return (
    <GameplaySafeAreaProvider>
      <GameplayNavigatorContent />
    </GameplaySafeAreaProvider>
  );
}

function GameplayNavigatorContent() {
  const { leftObstruction } = useGameplaySafeArea();

  return (
    <>
      <StatusBar barStyle="light-content" hidden />
      <Drawer.Navigator
        initialRouteName="Scenarios"
        drawerContent={AppDrawerContent}
        screenOptions={{
          headerShown: false,
          drawerPosition: 'left',
          drawerType: 'front',
          drawerStyle: {
            width: 256 + leftObstruction,
            backgroundColor: withAlpha(appColors.background, 0.95),
          },
          overlayColor: withAlpha(appColors.background, 0.52),
          swipeEdgeWidth: Math.max(32, leftObstruction),
        }}
      >
        <Drawer.Screen
          name="Scenarios"
          component={ScenarioNavigator}
          options={({ route }) => ({
            swipeEnabled:
              getFocusedRouteNameFromRoute(route) !== 'ScenarioVideo',
          })}
        />
        <Drawer.Screen name="DNAResult" component={DNAResultScreen} />
      </Drawer.Navigator>
    </>
  );
}

function ScenarioNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <Stack.Screen name="Home" component={HomeRoute} />
      <Stack.Screen
        name="ScenarioBriefing"
        component={ScenarioBriefingScreen}
      />
      <Stack.Screen name="ScenarioVideo" component={ScenarioVideoScreen} />
    </Stack.Navigator>
  );
}

function HomeRoute({ navigation }: GameplayScreenProps<'Home'>) {
  const isFocused = useIsFocused();
  const drawerStatus = useDrawerStatus();
  const repository = useScenarioProgressRepository();
  const [completedScenarioIds, setCompletedScenarioIds] = useState<
    ReadonlySet<string>
  >(new Set());
  const [progressReady, setProgressReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (drawerStatus === 'open') {
        return;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true,
      );

      return () => subscription.remove();
    }, [drawerStatus]),
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setProgressReady(false);
      const playableScenarioIds = getScenarios()
        .slice(0, 15)
        .map(scenario => scenario.id);

      Promise.all(
        playableScenarioIds.map(scenarioId => repository.get(scenarioId)),
      )
        .then(progressRecords => {
          if (!active) {
            return;
          }
          setCompletedScenarioIds(
            new Set(
              progressRecords
                .filter(progress => progress?.status === 'completed')
                .map(progress => progress!.scenarioId),
            ),
          );
          setProgressReady(true);
        })
        .catch(() => {
          // Keep the previous completed set and block starts until a later
          // focus can read every record safely.
        });

      return () => {
        active = false;
      };
    }, [repository]),
  );
  const handleScenarioStart = (scenarioId: string) => {
    navigation.navigate('ScenarioBriefing', { scenarioId });
  };

  return (
    <HomeScreen
      completedScenarioIds={completedScenarioIds}
      progressReady={progressReady}
      previewPlaybackEnabled={isFocused}
      onScenarioStart={handleScenarioStart}
    />
  );
}
