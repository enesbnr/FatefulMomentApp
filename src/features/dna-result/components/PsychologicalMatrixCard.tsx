import { appColors, withAlpha } from '../../../theme/colors';
import { StyleSheet, View } from 'react-native';
import type { DnaTraitScores } from '../model/types';
import { dnaResultColors } from './dnaResult.constants';
import SectionLabel from './SectionLabel';
import TraitRadarChart from './TraitRadarChart';
import TraitScoreGrid from './TraitScoreGrid';

type Props = {
  scores: DnaTraitScores;
};

export default function PsychologicalMatrixCard({ scores }: Props) {
  return (
    <View style={styles.card} testID="dna-psychological-matrix">
      <SectionLabel icon="dna" label="Psychological Matrix" />
      <View style={styles.visualization}>
        <View style={styles.topCorner} />
        <View style={styles.bottomCorner} />
        <View style={styles.radar}>
          <TraitRadarChart scores={scores} />
        </View>
        <View style={styles.scoreGrid}>
          <TraitScoreGrid scores={scores} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 174,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: dnaResultColors.panelBorder,
    borderRadius: 16,
    backgroundColor: dnaResultColors.matrixPanel,
  },
  visualization: {
    width: 338,
    height: 141,
  },
  radar: {
    position: 'absolute',
    left: 22,
    top: 9,
  },
  scoreGrid: {
    position: 'absolute',
    left: 201,
    top: 9,
  },
  topCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderTopWidth: 0.8,
    borderRightWidth: 0.8,
    borderColor: withAlpha(appColors.cardBorder, 0.4),
    borderTopRightRadius: 10,
  },
  bottomCorner: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderLeftWidth: 0.8,
    borderBottomWidth: 0.8,
    borderColor: withAlpha(appColors.cardBorder, 0.4),
    borderBottomLeftRadius: 10,
  },
});
