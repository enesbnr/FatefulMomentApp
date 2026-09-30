import { StyleSheet, Text, View } from 'react-native';
import type { DnaDimension } from '../../../entities/scenario/model/decisionTypes';
import type { DnaTraitScores } from '../model/types';
import {
  dnaResultColors,
  dnaTraitLabels,
  dnaTraitOrder,
  monoFont,
} from './dnaResult.constants';

type Props = {
  scores: DnaTraitScores;
};

function TraitGlyph({ trait }: { trait: DnaDimension }) {
  return <View style={styles.glyph} testID={`dna-trait-${trait}-icon-slot`} />;
}

export default function TraitScoreGrid({ scores }: Props) {
  return (
    <View style={styles.grid}>
      {dnaTraitOrder.map(trait => (
        <View key={trait} style={styles.card} testID={`dna-trait-${trait}`}>
          <View style={styles.valueRow}>
            <TraitGlyph trait={trait} />
            <Text style={styles.value}>{scores[trait]}</Text>
          </View>
          <Text style={styles.label}>{dnaTraitLabels[trait]}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${scores[trait]}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: 133,
    height: 126,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  card: {
    width: 62.5,
    height: 37.2,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderWidth: 0.35,
    borderColor: dnaResultColors.panelBorder,
    borderRadius: 7,
    backgroundColor: 'rgba(2, 6, 24, 0.6)',
  },
  valueRow: {
    height: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glyph: {
    width: 6.73,
    height: 6.73,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontStyle: 'italic',
    fontSize: 5,
    lineHeight: 7,
    color: dnaResultColors.accent,
    includeFontPadding: false,
  },
  label: {
    marginTop: 3,
    fontFamily: monoFont,
    fontSize: 4.2,
    lineHeight: 6,
    letterSpacing: 0.42,
    textTransform: 'uppercase',
    color: dnaResultColors.subdued,
    includeFontPadding: false,
  },
  track: {
    height: 1.7,
    marginTop: 4,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: dnaResultColors.panelBorder,
  },
  fill: {
    height: '100%',
    backgroundColor: dnaResultColors.accentSecondary,
  },
});
