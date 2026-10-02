import { StyleSheet, View } from 'react-native';
import { useGameplaySafeArea } from '../../../app/providers/GameplaySafeAreaProvider';
import { appColors } from '../../../theme/colors';
import type { GameplayScreenProps } from '../../../navigation/types';
import AppHeader from '../../../shared/components/app-header/AppHeader';
import MusicPlayer from '../../../shared/components/music-player/MusicPlayer';
import { getScenarioById } from '../../../entities/scenario/selectors/scenarioSelectors';
import SimulationBriefing from '../components/SimulationBriefing';
import SimulationStage from '../components/SimulationStage';

export default function ScenarioBriefingScreen({
  navigation,
  route,
}: GameplayScreenProps<'ScenarioBriefing'>) {
  const { insets } = useGameplaySafeArea();
  const scenario = getScenarioById(route.params.scenarioId);

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top }]}
      onAccessibilityEscape={navigation.goBack}
    >
      <AppHeader trailing={<MusicPlayer rightInset={insets.right} />} />
      <View
        style={[
          styles.content,
          {
            paddingLeft: Math.max(16, insets.left),
            paddingRight: Math.max(16, insets.right),
            paddingBottom: Math.max(19, insets.bottom),
          },
        ]}
      >
        {scenario ? (
          <SimulationStage background={scenario.simulation.background}>
            <SimulationBriefing
              title={scenario.title}
              description={scenario.description}
              onStart={() =>
                navigation.navigate('ScenarioVideo', {
                  scenarioId: scenario.id,
                })
              }
            />
          </SimulationStage>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
});
