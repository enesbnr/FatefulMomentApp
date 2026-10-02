import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { scenarioCardLayout } from '../scenarioCard.constants';
import ScenarioCard from './ScenarioCard';
import type { HomeScenario } from '../types';

const MAX_ACTIVE_PREVIEWS = 5;

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
  previewPlaybackEnabled,
  onSelectScenario,
  onStartScenario,
}: {
  scenarios: HomeScenario[];
  leading: number;
  trailing: number;
  selectedScenarioId: string | null;
  previewPlaybackEnabled: boolean;
  onSelectScenario: (id: string) => void;
  onStartScenario?: (id: string) => void;
}) {
  const firstPreviewIds = useMemo(
    () =>
      scenarios
        .filter(item => item.previewEnabled)
        .slice(0, MAX_ACTIVE_PREVIEWS)
        .map(item => item.id),
    [scenarios],
  );
  const [activePreviewIds, setActivePreviewIds] = useState<string[]>(
    firstPreviewIds,
  );
  const previewPositionsRef = useRef(new Map<string, number>());
  const selectedScenarioIdRef = useRef(selectedScenarioId);
  selectedScenarioIdRef.current = selectedScenarioId;

  useEffect(() => {
    const enabledIds = new Set(
      scenarios.filter(item => item.previewEnabled).map(item => item.id),
    );
    setActivePreviewIds(current => {
      const next = current.filter(id => enabledIds.has(id));
      firstPreviewIds.forEach(id => {
        if (next.length < MAX_ACTIVE_PREVIEWS && !next.includes(id)) {
          next.push(id);
        }
      });
      return next.length === current.length &&
        next.every((id, index) => id === current[index])
        ? current
        : next;
    });
  }, [firstPreviewIds, scenarios]);

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ isViewable: boolean; item: HomeScenario }>;
    }) => {
      const visiblePreviewIds = viewableItems
        .filter(
        token => token.isViewable && token.item.previewEnabled,
        )
        .map(token => token.item.id);
      const selectedId = selectedScenarioIdRef.current;
      const nextPreviewIds = selectedId && visiblePreviewIds.includes(selectedId)
        ? [selectedId, ...visiblePreviewIds.filter(id => id !== selectedId)]
        : visiblePreviewIds;
      setActivePreviewIds(nextPreviewIds.slice(0, MAX_ACTIVE_PREVIEWS));
    },
  ).current;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 150,
  }).current;

  const handleSelectScenario = useCallback(
    (id: string) => {
      setActivePreviewIds(current => [
        id,
        ...current.filter(activeId => activeId !== id),
      ].slice(0, MAX_ACTIVE_PREVIEWS));
      onSelectScenario(id);
    },
    [onSelectScenario],
  );

  const handlePreviewPositionChange = useCallback(
    (id: string, positionSeconds: number) => {
      previewPositionsRef.current.set(id, Math.max(0, positionSeconds));
    },
    [],
  );

  const renderItem = useCallback<ListRenderItem<HomeScenario>>(
    ({ item }) => {
      const isSelected = item.id === selectedScenarioId;
      const shouldDim = selectedScenarioId !== null && !isSelected;

      return (
        <ScenarioCard
          scenario={item}
          active={
            previewPlaybackEnabled &&
            item.previewEnabled &&
            activePreviewIds.includes(item.id)
          }
          selected={isSelected}
          dimmed={item.dimmed || shouldDim}
          previewResumeAtSeconds={
            previewPositionsRef.current.get(item.id) ??
            item.previewStartAtSeconds
          }
          onPreviewPositionChange={handlePreviewPositionChange}
          onSelect={handleSelectScenario}
          onStart={onStartScenario}
        />
      );
    },
    [
      activePreviewIds,
      handleSelectScenario,
      handlePreviewPositionChange,
      onStartScenario,
      previewPlaybackEnabled,
      selectedScenarioId,
    ],
  );

  return (
    <FlatList
      horizontal
      data={scenarios}
      extraData={{ activePreviewIds, previewPlaybackEnabled, selectedScenarioId }}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      getItemLayout={getItemLayout}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={3}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
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
