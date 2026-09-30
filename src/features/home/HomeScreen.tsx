import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appColors } from '../../theme/colors';
import AppHeader from '../../shared/components/app-header/AppHeader';
import MusicPlayer from '../../shared/components/music-player/MusicPlayer';
import HomeIntroduction from './components/HomeIntroduction';
import ScenarioCarousel from './components/ScenarioCarousel';
import { createScenarios, HOME_DEMO_STATE } from './data/createScenarios';
import type { HomeVisualState } from './types';

export default function HomeScreen({
  onBack,
  onScenarioStart,
  visualState = HOME_DEMO_STATE,
}: {
  onBack: () => void;
  onScenarioStart?: (scenarioId: string) => void;
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
      <AppHeader trailing={<MusicPlayer rightInset={insets.right} />} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <HomeIntroduction leading={leading} trailing={trailing} />
        <ScenarioCarousel
          scenarios={scenarios}
          leading={leading}
          trailing={trailing}
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={setSelectedScenarioId}
          onStartScenario={onScenarioStart}
        />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: appColors.background },
});
