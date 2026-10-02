import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import Video, {
  type OnLoadData,
  type OnProgressData,
  type VideoRef,
} from 'react-native-video';
import ArrowLeft from '../../../../assets/simulation/video/arrow-left.svg';
import { useGameplaySafeArea } from '../../../app/providers/GameplaySafeAreaProvider';
import type { ScenarioProgress } from '../../../entities/scenario-progress/model/types';
import type { Scenario } from '../../../entities/scenario/model/types';
import { getScenarioById } from '../../../entities/scenario/selectors/scenarioSelectors';
import type {
  GameplayDrawerParamList,
  GameplayScreenProps,
} from '../../../navigation/types';
import { appColors } from '../../../theme/colors';
import DecisionOverlay from '../components/decision/DecisionOverlay';
import resolveScenarioResumePosition from '../domain/resolveScenarioResumePosition';
import useDecisionPlayback from '../hooks/useDecisionPlayback';
import useScenarioResume from '../hooks/useScenarioResume';

type ScreenProps = GameplayScreenProps<'ScenarioVideo'>;
type CompletionStatus = 'idle' | 'saving' | 'failed' | 'completed';
const DECISION_PRESENTATION_DELAY_MS = 250;

export default function ScenarioVideoScreen({
  navigation,
  route,
}: ScreenProps) {
  const scenario = getScenarioById(route.params.scenarioId);
  const resume = useScenarioResume(route.params.scenarioId);

  if (resume.loading || !scenario) {
    return (
      <View style={styles.loadingScreen} testID="scenario-video-loading">
        <ActivityIndicator color={appColors.accent} size="large" />
        <Text style={styles.loadingLabel}>Preparing video…</Text>
      </View>
    );
  }

  if (resume.loadError) {
    return (
      <View
        accessibilityRole="alert"
        style={styles.loadingScreen}
        testID="scenario-progress-load-error"
      >
        <Text style={styles.errorTitle}>Progress could not be loaded.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading progress"
          onPress={resume.retryLoad}
          style={styles.retryButton}
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScenarioVideoSession
      navigation={navigation}
      scenario={scenario}
      initialProgress={
        resume.completedProgress ? null : resume.resumableProgress
      }
      preserveCompletedProgress={Boolean(resume.completedProgress)}
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
  preserveCompletedProgress,
  recordProgress,
  flushProgress,
  markCompleted,
}: {
  navigation: ScreenProps['navigation'];
  scenario: Scenario;
  initialProgress: ScenarioProgress | null;
  preserveCompletedProgress: boolean;
  recordProgress: ReturnType<typeof useScenarioResume>['recordProgress'];
  flushProgress: ReturnType<typeof useScenarioResume>['flush'];
  markCompleted: ReturnType<typeof useScenarioResume>['markCompleted'];
}) {
  const { insets } = useGameplaySafeArea();
  const isFocused = useIsFocused();
  const videoRef = useRef<VideoRef>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(initialProgress?.durationSeconds ?? 0);
  const pendingRestorePositionRef = useRef<number | null>(null);
  const isEndingRef = useRef(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [videoError, setVideoError] = useState(false);
  const [videoLoadAttempt, setVideoLoadAttempt] = useState(0);
  const [restoringPlayback, setRestoringPlayback] = useState(true);
  const [completionStatus, setCompletionStatus] =
    useState<CompletionStatus>('idle');
  const recordPlaybackProgress = useCallback(
    (
      positionSeconds: number,
      durationSeconds: number,
      answers: ScenarioProgress['answers'],
    ) => {
      if (!preserveCompletedProgress) {
        recordProgress(positionSeconds, durationSeconds, answers);
      }
    },
    [preserveCompletedProgress, recordProgress],
  );
  const flushPlaybackProgress = useCallback(
    () =>
      preserveCompletedProgress ? Promise.resolve() : flushProgress(),
    [flushProgress, preserveCompletedProgress],
  );
  const screenActive = isFocused && appState === 'active';
  const decisionPlayback = useDecisionPlayback({
    decisions: scenario.decisions,
    timerRunning:
      screenActive &&
      !videoError &&
      !restoringPlayback &&
      completionStatus === 'idle',
    initialAnswers: initialProgress?.answers,
    presentationDelayMs: DECISION_PRESENTATION_DELAY_MS,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      setAppState(nextState);
      if (nextState !== 'active') {
        flushPlaybackProgress().catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [flushPlaybackProgress]);

  useEffect(() => {
    if (durationRef.current <= 0) {
      return;
    }

    recordPlaybackProgress(
      currentTimeRef.current,
      durationRef.current,
      decisionPlayback.answers,
    );
    flushPlaybackProgress().catch(() => undefined);
  }, [
    decisionPlayback.answers,
    flushPlaybackProgress,
    recordPlaybackProgress,
  ]);

  const handleLoad = (data: OnLoadData) => {
    if (data.duration <= 0) {
      return;
    }

    durationRef.current = data.duration;

    const resumePosition = resolveScenarioResumePosition(
      scenario.decisions,
      decisionPlayback.answers,
      data.duration,
    );
    currentTimeRef.current = resumePosition;
    pendingRestorePositionRef.current =
      resumePosition > 0 ? resumePosition : null;

    if (resumePosition > 0) {
      videoRef.current?.seek(resumePosition);
    } else {
      setRestoringPlayback(false);
    }

    recordPlaybackProgress(
      currentTimeRef.current,
      data.duration,
      decisionPlayback.answers,
    );
  };

  const handleProgress = (data: OnProgressData) => {
    if (restoringPlayback) {
      return;
    }
    currentTimeRef.current = data.currentTime;
    decisionPlayback.handleProgress(data.currentTime);
    recordPlaybackProgress(
      data.currentTime,
      durationRef.current,
      decisionPlayback.answers,
    );
  };

  const handleBack = () => {
    flushPlaybackProgress().catch(() => undefined);
    navigation.goBack();
  };

  const handleEnd = async () => {
    if (isEndingRef.current) {
      return;
    }
    isEndingRef.current = true;
    setCompletionStatus('saving');

    try {
      await markCompleted(
        currentTimeRef.current,
        durationRef.current,
        decisionPlayback.answers,
      );
      setCompletionStatus('completed');
      navigation.popToTop();
      navigation
        .getParent<DrawerNavigationProp<GameplayDrawerParamList>>()
        ?.navigate('DNAResult', { scenarioId: scenario.id });
    } catch {
      isEndingRef.current = false;
      setCompletionStatus('failed');
    }
  };

  return (
    <View style={styles.screen} onAccessibilityEscape={handleBack}>
      {scenario.simulation.video ? (
        <Video
          key={videoLoadAttempt}
          ref={videoRef}
          source={scenario.simulation.video}
          style={[styles.video, restoringPlayback && styles.videoRestoring]}
          resizeMode="cover"
          paused={
            videoError ||
            restoringPlayback ||
            completionStatus !== 'idle' ||
            !screenActive ||
            Boolean(decisionPlayback.activeDecision)
          }
          muted={false}
          controls={false}
          repeat={false}
          playInBackground={false}
          playWhenInactive={false}
          progressUpdateInterval={100}
          onLoad={handleLoad}
          onReadyForDisplay={() => {
            const pendingPosition = pendingRestorePositionRef.current;
            if (pendingPosition != null) {
              videoRef.current?.seek(pendingPosition);
            }
          }}
          onSeek={() => {
            pendingRestorePositionRef.current = null;
            setRestoringPlayback(false);
          }}
          onProgress={handleProgress}
          onEnd={handleEnd}
          onError={() => setVideoError(true)}
        />
      ) : null}
      {restoringPlayback && !videoError ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Preparing video"
          style={styles.loadingScreen}
          testID="scenario-video-restoring"
        >
          <ActivityIndicator color={appColors.accent} size="large" />
          <Text style={styles.loadingLabel}>Preparing video…</Text>
        </View>
      ) : null}
      {videoError ? (
        <View
          accessibilityRole="alert"
          style={styles.errorOverlay}
          testID="scenario-video-error"
        >
          <Text style={styles.errorTitle}>Video could not be loaded.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry video"
            onPress={() => {
              decisionPlayback.resetToCompletedAnswers();
              pendingRestorePositionRef.current = null;
              setRestoringPlayback(true);
              setVideoError(false);
              setVideoLoadAttempt(attempt => attempt + 1);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      {completionStatus === 'saving' ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Saving scenario result"
          style={styles.errorOverlay}
          testID="scenario-completion-saving"
        >
          <ActivityIndicator color={appColors.accent} size="large" />
          <Text style={styles.errorTitle}>Saving your result…</Text>
        </View>
      ) : null}
      {completionStatus === 'failed' ? (
        <View
          accessibilityRole="alert"
          style={styles.errorOverlay}
          testID="scenario-completion-error"
        >
          <Text style={styles.errorTitle}>
            Your result could not be saved.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry saving result"
            onPress={handleEnd}
            style={styles.retryButton}
          >
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {decisionPlayback.activeDecision ? (
        <DecisionOverlay
          options={decisionPlayback.activeDecision.options}
          phase={decisionPlayback.phase}
          userChoiceId={decisionPlayback.userChoiceId}
          revealedOptionId={decisionPlayback.activeDecision.revealedOptionId}
          progress={decisionPlayback.progress}
          countdownRemainingMs={decisionPlayback.countdownRemainingMs}
          timerRunning={decisionPlayback.timerRunning}
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
  videoRestoring: {
    opacity: 0,
  },
  loadingScreen: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: appColors.background,
  },
  loadingLabel: {
    color: appColors.textSecondary,
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: appColors.background,
  },
  errorTitle: {
    color: appColors.white,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
    minHeight: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: appColors.accent,
  },
  retryLabel: {
    color: appColors.background,
    fontWeight: '700',
  },
});
