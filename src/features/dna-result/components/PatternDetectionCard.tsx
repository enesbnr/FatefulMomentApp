import { StyleSheet, Text, View } from 'react-native';
import { dnaResultColors, monoFont } from './dnaResult.constants';
import SectionLabel from './SectionLabel';

type Props = {
  patterns: string[];
};

export default function PatternDetectionCard({ patterns }: Props) {
  return (
    <View style={styles.card} testID="dna-pattern-detection">
      <SectionLabel icon="pattern" label="Pattern Detection" />
      <View style={styles.patterns}>
        {patterns.slice(0, 3).map((pattern, index) => (
          <View key={`${index}-${pattern}`} style={styles.row}>
            <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.pattern}>{pattern}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 133,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: dnaResultColors.panelBorder,
    borderRadius: 16,
    backgroundColor: dnaResultColors.panel,
  },
  patterns: {
    flex: 1,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  index: {
    width: 13,
    fontFamily: monoFont,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 15,
    color: dnaResultColors.accentSecondary,
    includeFontPadding: false,
  },
  pattern: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 8,
    lineHeight: 11,
    color: dnaResultColors.subdued,
    includeFontPadding: false,
  },
});
