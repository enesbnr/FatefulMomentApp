import { StyleSheet, View } from 'react-native';
import { decisionColors, decisionLayout } from './decision.constants';

type Props = {
  progress: number;
  urgent: boolean;
};

const clampProgress = (progress: number) => Math.min(1, Math.max(0, progress));

export default function DecisionCountdown({ progress, urgent }: Props) {
  const normalizedProgress = clampProgress(progress);

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
      <View
        testID="decision-countdown-fill"
        style={[
          styles.fill,
          {
            backgroundColor: urgent
              ? decisionColors.countdownUrgent
              : decisionColors.countdownNormal,
            width: `${normalizedProgress * 100}%`,
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
    height: decisionLayout.countdownHeight,
    borderRadius: 999,
    shadowColor: decisionColors.selectedGradientCenter,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 2,
  },
});
