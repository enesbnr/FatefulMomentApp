import { StyleSheet, View } from 'react-native';
import type { DnaResult } from '../model/types';
import ArchetypeCard from './ArchetypeCard';
import BlindSpotCard from './BlindSpotCard';
import { dnaResultLayout } from './dnaResult.constants';
import PatternDetectionCard from './PatternDetectionCard';
import PsychologicalMatrixCard from './PsychologicalMatrixCard';

type Props = {
  result: DnaResult;
  left: number;
};

export default function DNAResultContent({ result, left }: Props) {
  return (
    <View style={[styles.content, { left }]}>
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
    position: 'absolute',
    top: 77,
    width: dnaResultLayout.contentWidth,
    height: dnaResultLayout.contentHeight,
    flexDirection: 'row',
    gap: dnaResultLayout.columnGap,
  },
  leftColumn: {
    width: dnaResultLayout.columnWidth,
    height: '100%',
    gap: 16,
  },
  rightColumn: {
    width: dnaResultLayout.columnWidth,
    height: '100%',
    gap: 16,
  },
});
