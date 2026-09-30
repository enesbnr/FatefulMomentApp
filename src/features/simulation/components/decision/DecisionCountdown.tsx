import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { decisionColors, decisionLayout } from './decision.constants';

type Props = {
  progress: number;
  remainingMs: number;
  running: boolean;
  urgent: boolean;
};

const clampProgress = (progress: number) => Math.min(1, Math.max(0, progress));

export default function DecisionCountdown({
  progress,
  remainingMs,
  running,
  urgent,
}: Props) {
  const normalizedProgress = clampProgress(progress);
  const animatedProgress = useSharedValue(normalizedProgress);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: animatedProgress.value }],
  }));

  useEffect(() => {
    if (!running) {
      cancelAnimation(animatedProgress);
      return;
    }

    animatedProgress.value = normalizedProgress;
    animatedProgress.value = withTiming(0, {
      duration: remainingMs,
      easing: Easing.linear,
    });

    return () => cancelAnimation(animatedProgress);
  }, [animatedProgress, normalizedProgress, remainingMs, running]);

  return (
    <View
      accessibilityLabel="Decision time remaining"
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(normalizedProgress * 100),
      }}
      style={styles.track}
      testID="decision-countdown"
    >
      <Animated.View
        testID="decision-countdown-fill"
        style={[
          styles.fill,
          animatedStyle,
          {
            backgroundColor: urgent
              ? decisionColors.countdownUrgent
              : decisionColors.countdownNormal,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    right: decisionLayout.countdownHorizontalInset,
    bottom: decisionLayout.countdownBottom,
    left: decisionLayout.countdownHorizontalInset,
    height: decisionLayout.countdownHeight,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: decisionColors.countdownTrack,
    borderRadius: 999,
  },
  fill: {
    width: '100%',
    height: decisionLayout.countdownHeight,
    borderRadius: 999,
    shadowColor: decisionColors.selectedGradientCenter,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 2,
  },
});
