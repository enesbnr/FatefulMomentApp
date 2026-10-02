import { type ComponentType } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DnaIcon from '../../../../assets/dna-result/icons/dna.svg';
import PatternIcon from '../../../../assets/dna-result/icons/pattern.svg';
import TargetIcon from '../../../../assets/dna-result/icons/target.svg';
import { dnaResultColors, monoFont } from './dnaResult.constants';

type Props = {
  icon: 'dna' | 'pattern' | 'target';
  label: string;
  danger?: boolean;
};

const sectionIcons: Record<
  Props['icon'],
  ComponentType<{ width: number; height: number; testID?: string }>
> = {
  dna: DnaIcon,
  pattern: PatternIcon,
  target: TargetIcon,
};

export default function SectionLabel({ icon, label, danger = false }: Props) {
  const Icon = sectionIcons[icon];
  const iconSize = icon === 'dna' ? 10 : 12;

  return (
    <View style={styles.container}>
      <Icon
        width={iconSize}
        height={iconSize}
        testID={`dna-section-${icon}-icon`}
      />
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
