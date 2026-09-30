import { StyleSheet, View } from 'react-native';
import type { DecisionOption } from '../../../../entities/scenario/model/decisionTypes';
import type { DecisionPhase } from '../../model/decisionSessionTypes';
import DecisionCountdown from './DecisionCountdown';
import DecisionOptionGrid from './DecisionOptionGrid';
import DecisionUrgencyOverlay from './DecisionUrgencyOverlay';
import { decisionColors } from './decision.constants';

type Props = {
  options: DecisionOption[];
  phase: DecisionPhase;
  userChoiceId?: DecisionOption['id'];
  revealedOptionId?: DecisionOption['id'];
  progress: number;
  urgent: boolean;
  onSelectOption: (optionId: DecisionOption['id']) => void;
};

export default function DecisionOverlay({
  options,
  phase,
  userChoiceId,
  revealedOptionId,
  progress,
  urgent,
  onSelectOption,
}: Props) {
  return (
    <View style={styles.overlay} testID="decision-overlay">
      <View pointerEvents="none" style={styles.scrim} />
      <DecisionUrgencyOverlay visible={urgent} />
      <View style={styles.optionsContainer}>
        <DecisionOptionGrid
          options={options}
          phase={phase}
          userChoiceId={userChoiceId}
          revealedOptionId={revealedOptionId}
          onSelectOption={onSelectOption}
        />
      </View>
      {phase === 'choosing' ? (
        <DecisionCountdown progress={progress} urgent={urgent} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: decisionColors.scrim,
  },
  optionsContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
