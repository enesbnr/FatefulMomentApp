import { Platform, StyleSheet, Text, View } from 'react-native';
import { appColors } from '../../../theme/colors';

type HomeIntroductionProps = {
  leading: number;
  trailing: number;
};

export default function HomeIntroduction({
  leading,
  trailing,
}: HomeIntroductionProps) {
  return (
    <View
      style={[
        styles.container,
        { paddingLeft: leading, paddingRight: trailing },
      ]}
    >
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Scenarios</Text>
      </View>
      <Text style={styles.description}>
        {
          'Choose A Scenario And Ask Yourself, "If You Were In That Situation, What Would You Do?"'
        }
      </Text>
      <Text style={styles.count}>30 Scenarios</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16 },
  headingRow: { height: 28, justifyContent: 'center' },
  heading: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    lineHeight: 20,
    color: appColors.textPrimary,
    includeFontPadding: false,
  },
  description: {
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    color: appColors.accent,
    includeFontPadding: false,
  },
  count: {
    marginTop: 14,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    lineHeight: 16,
    color: appColors.textMuted,
    includeFontPadding: false,
  },
});
