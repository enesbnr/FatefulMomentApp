import { FlatList, StyleSheet, View } from 'react-native';
import { scenarioCardLayout } from '../scenarioCard.constants';
import ScenarioCard from './ScenarioCard';
import type { HomeScenario } from '../types';

function Separator() {
  return <View style={styles.separator} />;
}

export default function ScenarioCarousel({
  scenarios,
  leading,
  trailing,
  selectedScenarioId,
  onSelectScenario,
  onStartScenario,
}: {
  scenarios: HomeScenario[];
  leading: number;
  trailing: number;
  selectedScenarioId: string | null;
  onSelectScenario: (id: string) => void;
  onStartScenario?: (id: string) => void;
}) {
  return (
    <FlatList
      horizontal
      data={scenarios}
      extraData={selectedScenarioId}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
  const isSelected = item.id === selectedScenarioId;
  const shouldDim = selectedScenarioId !== null && !isSelected;

  return (
    <ScenarioCard
      scenario={item}
      active={isSelected}
      dimmed={item.dimmed || shouldDim}
      onSelect={() => onSelectScenario(item.id)}
      onStart={() => onStartScenario?.(item.id)}
    />
  );
}}
      ItemSeparatorComponent={Separator}
      getItemLayout={(_, index) => ({
        length: scenarioCardLayout.width + scenarioCardLayout.gap,
        offset: (scenarioCardLayout.width + scenarioCardLayout.gap) * index,
        index,
      })}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={3}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        {
          paddingLeft: leading,
          paddingRight: trailing,
        },
      ]}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  separator: {
    width: scenarioCardLayout.gap,
  },
  list: {
    flexGrow: 0,
    overflow: 'visible',
  },
});
