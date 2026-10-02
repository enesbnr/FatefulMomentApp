import { appColors, withAlpha } from '../../../theme/colors';
import { fontFamilies } from '../../../theme/typography';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { DnaResult } from '../model/types';
import { dnaResultColors } from './dnaResult.constants';

type Props = {
  archetype: DnaResult['archetype'];
};

export default function ArchetypeCard({ archetype }: Props) {
  return (
    <View style={styles.card} testID="dna-archetype-card">
      <Image source={archetype.portrait} resizeMode="cover" style={styles.portrait} />
      <View style={styles.copy}>
        <Text style={styles.title}>{archetype.title}</Text>
        <View style={styles.summaryFrame}>
          <Text style={styles.summary}>{archetype.summary}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: dnaResultColors.panelBorder,
    borderRadius: 16,
    backgroundColor: dnaResultColors.panel,
  },
  portrait: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: withAlpha(appColors.link, 0.2),
    borderRadius: 16,
    backgroundColor: dnaResultColors.background,
  },
  copy: {
    flex: 1,
    alignSelf: 'stretch',
    gap: 8,
  },
  title: {
    minHeight: 24,
    fontFamily: fontFamilies.bold,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    textTransform: 'uppercase',
    color: dnaResultColors.title,
    includeFontPadding: false,
  },
  summaryFrame: {
    minHeight: 33,
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: withAlpha(appColors.link, 0.4),
  },
  summary: {
    fontFamily: fontFamilies.regular,
    fontSize: 8,
    lineHeight: 11,
    color: dnaResultColors.muted,
    includeFontPadding: false,
  },
});
