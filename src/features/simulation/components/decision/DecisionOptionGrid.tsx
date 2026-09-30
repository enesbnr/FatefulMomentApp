import { StyleSheet, View } from 'react-native';
import type { DecisionOption } from '../../../../entities/scenario/model/decisionTypes';
import type { DecisionPhase } from '../../model/decisionSessionTypes';
import DecisionOptionCard, {
  type DecisionOptionVisualState,
} from './DecisionOptionCard';
import { decisionLayout } from './decision.constants';

type Props = {
  options: DecisionOption[];
  phase: DecisionPhase;
  userChoiceId?: DecisionOption['id'];
  revealedOptionId?: DecisionOption['id'];
  onSelectOption: (optionId: DecisionOption['id']) => void;
};

const groupIntoRows = (options: DecisionOption[]) => {
  const rows: DecisionOption[][] = [];
  for (let index = 0; index < options.length; index += 2) {
    rows.push(options.slice(index, index + 2));
  }
  return rows;
};

const getVisualState = (
  optionId: DecisionOption['id'],
  phase: DecisionPhase,
  userChoiceId?: DecisionOption['id'],
  revealedOptionId?: DecisionOption['id'],
): DecisionOptionVisualState => {
  const isUserChoice = optionId === userChoiceId;
  const isRevealedChoice = optionId === revealedOptionId;

  if (phase === 'choosing') {
    return isUserChoice ? 'active-selection' : 'default';
  }
  if (phase === 'locked') {
    return isUserChoice ? 'matching-choice' : 'default';
  }
  if (isUserChoice && isRevealedChoice) {
    return 'matching-choice';
  }
  if (isUserChoice) {
    return 'user-choice';
  }
  return isRevealedChoice ? 'revealed-choice' : 'default';
};

export default function DecisionOptionGrid({
  options,
  phase,
  userChoiceId,
  revealedOptionId,
  onSelectOption,
}: Props) {
  return (
    <View accessibilityRole="radiogroup" style={styles.grid}>
      {groupIntoRows(options).map(row => (
        <View
          key={row.map(option => option.id).join('-')}
          style={[styles.row, row.length === 1 && styles.singleOptionRow]}
        >
          {row.map(option => (
            <View
              key={option.id}
              style={row.length === 1 ? styles.singleOption : styles.option}
            >
              <DecisionOptionCard
                option={option}
                phase={phase}
                visualState={getVisualState(
                  option.id,
                  phase,
                  userChoiceId,
                  revealedOptionId,
                )}
                onPress={onSelectOption}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '86.45%',
    maxWidth: decisionLayout.optionsWidth,
    gap: decisionLayout.optionGap,
  },
  row: {
    width: '100%',
    height: decisionLayout.optionHeight,
    flexDirection: 'row',
    gap: decisionLayout.optionGap,
  },
  singleOptionRow: {
    justifyContent: 'center',
  },
  option: {
    flex: 1,
    minWidth: 0,
  },
  singleOption: {
    width: '49.15%',
  },
});
