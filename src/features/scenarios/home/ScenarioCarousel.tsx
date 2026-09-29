import { FlatList, StyleSheet, View } from 'react-native';
import ScenarioCard, { CARD_GAP, CARD_WIDTH } from './ScenarioCard';
import type { Scenario } from './types';

function Separator() {
  return <View style={styles.separator} />;
}

export default function ScenarioCarousel({
  scenarios,
  leading,
  trailing,
  selectedScenarioId,
  onSelectScenario,
}: {
  scenarios: Scenario[];
  leading: number;
  trailing: number;
  selectedScenarioId: string | null;
  onSelectScenario: (id: string) => void;
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
    />
  );
}}
      ItemSeparatorComponent={Separator}
      getItemLayout={(_, index) => ({
        length: CARD_WIDTH + CARD_GAP,
        offset: (CARD_WIDTH + CARD_GAP) * index,
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
    width: CARD_GAP,
  },
  list: {
    flexGrow: 0,
    overflow: 'visible',
  },
});
