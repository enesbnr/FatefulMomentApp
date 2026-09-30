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
        <Text numberOfLines={1} style={styles.title}>{archetype.title}</Text>
        <View style={styles.summaryFrame}>
          <Text numberOfLines={3} style={styles.summary}>{archetype.summary}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 82,
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
    borderColor: 'rgba(0, 184, 219, 0.2)',
    borderRadius: 16,
    backgroundColor: dnaResultColors.background,
  },
  copy: {
    flex: 1,
    alignSelf: 'stretch',
    gap: 8,
  },
  title: {
    height: 24,
    fontFamily: 'Inter-Bold',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    textTransform: 'uppercase',
    color: dnaResultColors.title,
    includeFontPadding: false,
  },
  summaryFrame: {
    height: 33,
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0, 184, 219, 0.4)',
  },
  summary: {
    fontFamily: 'Inter-Regular',
    fontSize: 8,
    lineHeight: 11,
    color: dnaResultColors.muted,
    includeFontPadding: false,
  },
});
