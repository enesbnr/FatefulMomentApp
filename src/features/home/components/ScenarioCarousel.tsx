import { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { scenarioCardLayout } from '../scenarioCard.constants';
import ScenarioCard from './ScenarioCard';
import type { HomeScenario } from '../types';

function Separator() {
  return <View style={styles.separator} />;
}

const keyExtractor = (item: HomeScenario) => item.id;

const getItemLayout = (_: ArrayLike<HomeScenario> | null | undefined, index: number) => ({
  length: scenarioCardLayout.width + scenarioCardLayout.gap,
  offset: (scenarioCardLayout.width + scenarioCardLayout.gap) * index,
  index,
});

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
  const renderItem = useCallback<ListRenderItem<HomeScenario>>(
    ({ item }) => {
      const isSelected = item.id === selectedScenarioId;
      const shouldDim = selectedScenarioId !== null && !isSelected;

      return (
        <ScenarioCard
          scenario={item}
          active={isSelected}
          dimmed={item.dimmed || shouldDim}
          onSelect={onSelectScenario}
          onStart={onStartScenario}
        />
      );
    },
    [onSelectScenario, onStartScenario, selectedScenarioId],
  );

  return (
    <FlatList
      horizontal
      data={scenarios}
      extraData={selectedScenarioId}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      getItemLayout={getItemLayout}
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
