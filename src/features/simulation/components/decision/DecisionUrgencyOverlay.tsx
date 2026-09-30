import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { decisionColors } from './decision.constants';

type Props = {
  visible: boolean;
};

export default function DecisionUrgencyOverlay({ visible }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <Svg
      pointerEvents="none"
      style={styles.overlay}
      testID="decision-urgency-overlay"
    >
      <Defs>
        <RadialGradient id="decisionUrgencyGradient" cx="50%" cy="50%" r="50%">
          <Stop
            offset="80.6%"
            stopColor={decisionColors.urgencyEdge}
            stopOpacity={0}
          />
          <Stop
            offset="100%"
            stopColor={decisionColors.urgencyEdge}
            stopOpacity={0.12}
          />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#decisionUrgencyGradient)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});
