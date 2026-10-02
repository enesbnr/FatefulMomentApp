import { StyleSheet, View } from 'react-native';
import type { DnaResult } from '../model/types';
import ArchetypeCard from './ArchetypeCard';
import BlindSpotCard from './BlindSpotCard';
import { dnaResultLayout } from './dnaResult.constants';
import PatternDetectionCard from './PatternDetectionCard';
import PsychologicalMatrixCard from './PsychologicalMatrixCard';

type Props = {
  result: DnaResult;
};

export default function DNAResultContent({ result }: Props) {
  return (
    <View style={styles.content}>
      <View style={styles.leftColumn}>
        <ArchetypeCard archetype={result.archetype} />
        <PsychologicalMatrixCard scores={result.traits} />
      </View>
      <View style={styles.rightColumn}>
        <PatternDetectionCard patterns={result.patterns} />
        <BlindSpotCard blindSpot={result.blindSpot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: dnaResultLayout.contentWidth,
    minHeight: dnaResultLayout.contentHeight,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: dnaResultLayout.columnGap,
  },
  leftColumn: {
    width: dnaResultLayout.columnWidth,
    gap: 16,
  },
  rightColumn: {
    width: dnaResultLayout.columnWidth,
    gap: 16,
  },
});
