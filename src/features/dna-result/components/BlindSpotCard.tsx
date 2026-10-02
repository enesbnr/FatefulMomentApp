import { appColors, withAlpha } from '../../../theme/colors';
import { fontFamilies } from '../../../theme/typography';
import { StyleSheet, Text, View } from 'react-native';
import type { DnaResult } from '../model/types';
import { dnaResultColors } from './dnaResult.constants';
import SectionLabel from './SectionLabel';

type Props = {
  blindSpot: DnaResult['blindSpot'];
};

export default function BlindSpotCard({ blindSpot }: Props) {
  return (
    <View style={styles.card} testID="dna-blind-spot">
      <SectionLabel icon="target" label={blindSpot.title} danger />
      <Text style={styles.question}>{blindSpot.question}</Text>
      <Text style={styles.description}>{blindSpot.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 123,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: withAlpha(appColors.dangerStrong, 0.2),
    borderRadius: 16,
    backgroundColor: withAlpha(appColors.dangerStrong, 0.05),
  },
  question: {
    minHeight: 11,
    fontFamily: fontFamilies.regular,
    fontSize: 8,
    lineHeight: 11,
    color: dnaResultColors.white,
    includeFontPadding: false,
  },
  description: {
    fontFamily: fontFamilies.regular,
    fontSize: 8,
    lineHeight: 11,
    color: dnaResultColors.muted,
    includeFontPadding: false,
  },
});
