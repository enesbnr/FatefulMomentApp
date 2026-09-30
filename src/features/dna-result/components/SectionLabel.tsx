import { StyleSheet, Text, View } from 'react-native';
import { dnaResultColors, monoFont } from './dnaResult.constants';

type Props = {
  icon: 'dna' | 'pattern' | 'target';
  label: string;
  danger?: boolean;
};

export default function SectionLabel({ icon, label, danger = false }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconSlot} testID={`dna-section-${icon}-icon-slot`} />
      <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconSlot: {
    width: 12,
    height: 12,
    flexShrink: 0,
  },
  label: {
    fontFamily: monoFont,
    fontSize: 8,
    lineHeight: 11,
    textTransform: 'uppercase',
    color: dnaResultColors.muted,
    includeFontPadding: false,
  },
  danger: {
    color: dnaResultColors.danger,
  },
});
