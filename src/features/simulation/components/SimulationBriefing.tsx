import { fontFamilies } from '../../../theme/typography';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appColors, withAlpha } from '../../../theme/colors';

type SimulationBriefingProps = {
  title: string;
  description: string;
  onStart: () => void;
};

export default function SimulationBriefing({
  title,
  description,
  onStart,
}: SimulationBriefingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.eyebrow}>SCENARIO BRIEFING</Text>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>
        <Text numberOfLines={2} style={styles.description}>
          {description}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start Simulation"
        onPress={onStart}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Start Simulation</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 230,
    padding: 24,
    gap: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    width: '100%',
    maxWidth: 497,
    height: 110,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    minHeight: 54,
    gap: 4,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: fontFamilies.mono,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textAlign: 'center',
    color: appColors.accent,
    includeFontPadding: false,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontStyle: 'italic',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: appColors.textStrong,
    includeFontPadding: false,
  },
  description: {
    width: '100%',
    height: 40,
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: appColors.textPrimary,
    opacity: 0.8,
    includeFontPadding: false,
  },
  button: {
    width: 179,
    height: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: withAlpha(appColors.link, 0.14),
  },
  buttonLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: appColors.accent,
    includeFontPadding: false,
  },
});
