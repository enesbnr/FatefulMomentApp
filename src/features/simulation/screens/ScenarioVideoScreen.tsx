import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video, {
  type OnLoadData,
  type OnProgressData,
  type VideoRef,
} from 'react-native-video';
import ArrowLeft from '../../../../assets/simulation/video/arrow-left.svg';
import type { ScenarioProgress } from '../../../entities/scenario-progress/model/types';
import type { Scenario } from '../../../entities/scenario/model/types';
import { getScenarioById } from '../../../entities/scenario/selectors/scenarioSelectors';
import type {
  GameplayDrawerParamList,
  GameplayScreenProps,
} from '../../../navigation/types';
import { appColors } from '../../../theme/colors';
import DecisionOverlay from '../components/decision/DecisionOverlay';
import useDecisionPlayback from '../hooks/useDecisionPlayback';
import useScenarioResume from '../hooks/useScenarioResume';

type ScreenProps = GameplayScreenProps<'ScenarioVideo'>;

export default function ScenarioVideoScreen({ navigation, route }: ScreenProps) {
  const scenario = getScenarioById(route.params.scenarioId);
  const resume = useScenarioResume(route.params.scenarioId);

  if (resume.loading || !scenario) {
    return <View style={styles.screen} testID="scenario-video-loading" />;
  }

  return (
    <ScenarioVideoSession
      navigation={navigation}
      scenario={scenario}
      initialProgress={resume.resumableProgress}
      recordProgress={resume.recordProgress}
      flushProgress={resume.flush}
      markCompleted={resume.markCompleted}
    />
  );
}

function ScenarioVideoSession({
  navigation,
  scenario,
  initialProgress,
  recordProgress,
  flushProgress,
  markCompleted,
}: {
  navigation: ScreenProps['navigation'];
  scenario: Scenario;
  initialProgress: ScenarioProgress | null;
  recordProgress: ReturnType<typeof useScenarioResume>['recordProgress'];
  flushProgress: ReturnType<typeof useScenarioResume>['flush'];
  markCompleted: ReturnType<typeof useScenarioResume>['markCompleted'];
}) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const videoRef = useRef<VideoRef>(null);
  const currentTimeRef = useRef(initialProgress?.positionSeconds ?? 0);
  const durationRef = useRef(initialProgress?.durationSeconds ?? 0);
  const hasRestoredPositionRef = useRef(false);
  const isEndingRef = useRef(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const screenActive = isFocused && appState === 'active';
  const decisionPlayback = useDecisionPlayback({
    decisions: scenario.decisions,
    timerRunning: screenActive,
    initialAnswers: initialProgress?.answers,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      setAppState(nextState);
      if (nextState !== 'active') {
        flushProgress().catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [flushProgress]);

  useEffect(() => {
    if (durationRef.current <= 0) {
      return;
    }

    recordProgress(
      currentTimeRef.current,
      durationRef.current,
      decisionPlayback.answers,
    );
    flushProgress().catch(() => undefined);
  }, [decisionPlayback.answers, flushProgress, recordProgress]);

  const handleLoad = (data: OnLoadData) => {
    if (data.duration <= 0) {
      return;
    }

    durationRef.current = data.duration;

    if (!hasRestoredPositionRef.current && initialProgress) {
      hasRestoredPositionRef.current = true;
      const latestSafePosition = Math.max(0, data.duration - 1);
      const resumePosition = Math.min(
        initialProgress.positionSeconds,
        latestSafePosition,
      );
      currentTimeRef.current = resumePosition;

      if (resumePosition > 0) {
        videoRef.current?.seek(resumePosition);
      }
    }

    recordProgress(
      currentTimeRef.current,
      data.duration,
      decisionPlayback.answers,
    );
  };

  const handleProgress = (data: OnProgressData) => {
    currentTimeRef.current = data.currentTime;
    decisionPlayback.handleProgress(data.currentTime);
    recordProgress(
      data.currentTime,
      durationRef.current,
      decisionPlayback.answers,
    );
  };

  const handleBack = () => {
    flushProgress().catch(() => undefined);
    navigation.goBack();
  };

  const handleEnd = async () => {
    if (isEndingRef.current) {
      return;
    }
    isEndingRef.current = true;

    await markCompleted(
      currentTimeRef.current,
      durationRef.current,
      decisionPlayback.answers,
    );
    navigation
      .getParent<DrawerNavigationProp<GameplayDrawerParamList>>()
      ?.navigate('DNAResult', { scenarioId: scenario.id });
  };

  return (
    <View style={styles.screen} onAccessibilityEscape={handleBack}>
      {scenario.simulation.video ? (
        <Video
          ref={videoRef}
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
          onLoad={handleLoad}
          onProgress={handleProgress}
          onEnd={handleEnd}
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
        onPress={handleBack}
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
