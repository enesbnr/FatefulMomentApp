import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GameplayHeader from './GameplayHeader';
import ScenarioCarousel from './ScenarioCarousel';
import { createScenarios, HOME_DEMO_STATE } from './scenarios';
import type { HomeVisualState } from './types';

export default function HomeScreen({
  onBack,
  visualState = HOME_DEMO_STATE,
}: {
  onBack: () => void;
  visualState?: HomeVisualState;
}) {
  const insets = useSafeAreaInsets();
  const scenarios = useMemo(() => createScenarios(visualState), [visualState]);
  const leading = Math.max(66, insets.left + 16);
  const trailing = Math.max(24, insets.right + 16);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null,
  );
  return (
    <View
      style={[styles.screen, { paddingTop: insets.top }]}
      onAccessibilityEscape={onBack}
    >
      <GameplayHeader rightInset={insets.right} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.introduction,
            { paddingLeft: leading, paddingRight: trailing },
          ]}
        >
          <View style={styles.headingRow}>
            <Text style={styles.heading}>Scenarios</Text>
          </View>
          <Text style={styles.intro}>
            {
              'Choose A Scenario And Ask Yourself, "If You Were In That Situation, What Would You Do?"'
            }
          </Text>
          <Text style={styles.count}>30 Scenarios</Text>
        </View>
        <ScenarioCarousel
          scenarios={scenarios}
          leading={leading}
          trailing={trailing}
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={setSelectedScenarioId}
        />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020618' },
  introduction: { paddingTop: 16 },
  headingRow: { height: 28, justifyContent: 'center' },
  heading: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    lineHeight: 20,
    color: '#E2E8F0',
    includeFontPadding: false,
  },
  intro: {
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    color: '#00D3F3',
    includeFontPadding: false,
  },
  count: {
    marginTop: 14,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    lineHeight: 16,
    color: '#62748E',
    includeFontPadding: false,
  },
});
