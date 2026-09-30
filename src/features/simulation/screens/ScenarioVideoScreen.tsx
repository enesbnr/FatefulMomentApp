import { useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video, { type OnProgressData } from 'react-native-video';
import ArrowLeft from '../../../../assets/simulation/video/arrow-left.svg';
import { getScenarioById } from '../../../entities/scenario/selectors/scenarioSelectors';
import type { GameplayScreenProps } from '../../../navigation/types';
import { appColors } from '../../../theme/colors';
import DecisionOverlay from '../components/decision/DecisionOverlay';
import useDecisionPlayback from '../hooks/useDecisionPlayback';

export default function ScenarioVideoScreen({
  navigation,
  route,
}: GameplayScreenProps<'ScenarioVideo'>) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);
  const scenario = getScenarioById(route.params.scenarioId);
  const screenActive = isFocused && appState === 'active';
  const decisionPlayback = useDecisionPlayback({
    decisions: scenario?.decisions ?? [],
    timerRunning: screenActive,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.screen} onAccessibilityEscape={navigation.goBack}>
      {scenario?.simulation.video ? (
        <Video
          source={scenario.simulation.video}
          style={styles.video}
          resizeMode="cover"
          paused={!screenActive || Boolean(decisionPlayback.activeDecision)}
          muted={false}
          controls={false}
          repeat={false}
          playInBackground={false}
          playWhenInactive={false}
          progressUpdateInterval={100}
          onProgress={(data: OnProgressData) =>
            decisionPlayback.handleProgress(data.currentTime)
          }
        />
      ) : null}
      {decisionPlayback.activeDecision ? (
        <DecisionOverlay
          options={decisionPlayback.activeDecision.options}
          phase={decisionPlayback.phase}
          userChoiceId={decisionPlayback.userChoiceId}
          revealedOptionId={decisionPlayback.activeDecision.revealedOptionId}
          progress={decisionPlayback.progress}
          urgent={decisionPlayback.urgent}
          onSelectOption={decisionPlayback.handleSelectOption}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        onPress={navigation.goBack}
        style={[
          styles.backButton,
          {
            left: Math.max(32, insets.left + 16),
            top: Math.max(12, insets.top + 12),
          },
        ]}
      >
        <ArrowLeft width={16} height={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  video: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
