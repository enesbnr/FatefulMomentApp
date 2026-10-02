import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useGameplaySafeArea } from '../../app/providers/GameplaySafeAreaProvider';
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
  previewPlaybackEnabled = true,
  visualState = HOME_DEMO_STATE,
  completedScenarioIds = new Set<string>(),
  progressReady = true,
}: {
  onBack?: () => void;
  onScenarioStart?: (scenarioId: string) => void;
  previewPlaybackEnabled?: boolean;
  visualState?: HomeVisualState;
  completedScenarioIds?: ReadonlySet<string>;
  progressReady?: boolean;
}) {
  const { insets } = useGameplaySafeArea();
  const scenarios = useMemo(
    () => createScenarios(visualState, completedScenarioIds),
    [completedScenarioIds, visualState],
  );
  const leading = Math.max(66, insets.left + 16);
  const trailing = Math.max(24, insets.right + 16);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null,
  );
  const clearCardFocus = () => setSelectedScenarioId(null);

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top }]}
      onAccessibilityEscape={onBack}
    >
      <Pressable onPress={clearCardFocus}>
        <AppHeader trailing={<MusicPlayer rightInset={insets.right} />} />
      </Pressable>
      <View
        style={[styles.content, { paddingBottom: insets.bottom }]}
      >
        <Pressable
          testID="home-clear-card-focus"
          onPress={clearCardFocus}
        >
          <HomeIntroduction leading={leading} trailing={trailing} />
        </Pressable>
        <ScenarioCarousel
          scenarios={scenarios}
          leading={leading}
          trailing={trailing}
          selectedScenarioId={selectedScenarioId}
          previewPlaybackEnabled={previewPlaybackEnabled}
          onSelectScenario={setSelectedScenarioId}
          onStartScenario={scenarioId => {
            const selectedScenario = scenarios.find(
              scenario => scenario.id === scenarioId,
            );
            if (
              progressReady &&
              selectedScenario &&
              !selectedScenario.disabled
            ) {
              onScenarioStart?.(scenarioId);
            }
          }}
        />
        <Pressable style={styles.remainingSpace} onPress={clearCardFocus} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: appColors.background },
  content: { flex: 1 },
  remainingSpace: { flex: 1 },
});
