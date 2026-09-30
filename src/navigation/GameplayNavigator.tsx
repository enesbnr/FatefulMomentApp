import { StatusBar } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../features/home/HomeScreen';
import DNAResultScreen from '../features/dna-result/screens/DNAResultScreen';
import ScenarioBriefingScreen from '../features/simulation/screens/ScenarioBriefingScreen';
import ScenarioVideoScreen from '../features/simulation/screens/ScenarioVideoScreen';
import AppDrawerContent from './components/AppDrawerContent';
import useLeftDrawerInset from './hooks/useLeftDrawerInset';
import type {
  GameplayDrawerParamList,
  GameplayStackParamList,
} from './types';

const Stack = createNativeStackNavigator<GameplayStackParamList>();
const Drawer = createDrawerNavigator<GameplayDrawerParamList>();

export default function GameplayNavigator() {
  const leftDrawerInset = useLeftDrawerInset();

  return (
    <>
      <StatusBar barStyle="light-content" hidden />
      <Drawer.Navigator
        initialRouteName="Scenarios"
        drawerContent={props => <AppDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerPosition: 'left',
          drawerType: 'front',
          drawerStyle: {
            width: 256 + leftDrawerInset,
            backgroundColor: 'rgba(2, 6, 24, 0.95)',
          },
          overlayColor: 'rgba(2, 6, 24, 0.52)',
          swipeEdgeWidth: Math.max(32, leftDrawerInset),
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
        <Stack.Screen name="Home">
          {({ navigation }) => (
            <HomeScreen
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
  );
}
