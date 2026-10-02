jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  AppState,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Video from 'react-native-video';
import { GameplaySafeAreaProvider } from '../../../app/providers/GameplaySafeAreaProvider';
import HomeScreen from '../HomeScreen';
import ScenarioCard from '../components/ScenarioCard';
import { createScenarios } from '../data/createScenarios';

test('enables fifteen independent preview cards and disables the remaining demo cards', () => {
  const normal = createScenarios('normal');
  const dimmed = createScenarios('dimmed');
  expect(normal).toHaveLength(30);
  expect(new Set(normal.map(item => item.id)).size).toBe(30);
  expect(normal.slice(0, 15).every(item => item.previewEnabled)).toBe(true);
  expect(normal.slice(0, 15).every(item => !item.disabled)).toBe(true);
  expect(normal.slice(0, 15).every(item => !item.dimmed)).toBe(true);
  expect(normal.slice(15).every(item => item.disabled && item.dimmed)).toBe(
    true,
  );
  expect(new Set(normal.slice(0, 15).map(item => item.homePreview)).size).toBe(
    15,
  );
  expect(
    normal.slice(0, 15).map(item => item.previewStartAtSeconds),
  ).toEqual(Array(15).fill(0));
  expect(
    normal
      .slice(0, 15)
      .every(item => item.homePreview.video === normal[0].homePreview.video),
  ).toBe(true);
  expect(normal.slice(0, 15).every(item => item.decisions.length === 3)).toBe(
    true,
  );
  expect(normal[0].decisions.map(decision => decision.triggerAtMs)).toEqual([
    26_000,
    53_300,
    76_500,
  ]);
  expect(normal.slice(15).every(item => item.decisions.length === 0)).toBe(
    true,
  );
  expect(dimmed[0].dimmed).toBe(false);
  expect(dimmed.slice(1).every(item => item.dimmed)).toBe(true);
  expect(normal.map(item => item.title)).toEqual(dimmed.map(item => item.title));
});

test('locks completed scenarios and moves them to the end of the carousel', () => {
  const scenarios = createScenarios(
    'normal',
    new Set(['scenario-1', 'scenario-5']),
  );

  expect(scenarios.slice(-2).map(scenario => scenario.id)).toEqual([
    'scenario-1',
    'scenario-5',
  ]);
  expect(
    scenarios.slice(-2).every(
      scenario =>
        scenario.completed &&
        scenario.disabled &&
        scenario.dimmed &&
        !scenario.previewEnabled &&
        !scenario.homePreview.video,
    ),
  ).toBe(true);
});

test('renders a completed card without touch responders so FlatList can swipe over it', async () => {
  const completedScenario = createScenarios(
    'normal',
    new Set(['scenario-1']),
  ).at(-1)!;
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <ScenarioCard
        scenario={completedScenario}
        active={false}
        selected={false}
        dimmed
        onSelect={() => {}}
        onStart={() => {}}
      />,
    );
  });

  expect(tree.root.findAllByType(Pressable)).toHaveLength(0);
  expect(
    tree.root
      .findAllByType(View)
      .some(view => view.props.accessibilityState?.disabled === true),
  ).toBe(true);

  await act(() => tree.unmount());
});

test('limits native preview players to five and transfers them between visible cards', async () => {
  const previousState = AppState.currentState;
  AppState.currentState = 'active';
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(() => {
      tree = Renderer.create(
        <GameplaySafeAreaProvider>
          <HomeScreen onBack={() => {}} visualState="dimmed" />
        </GameplaySafeAreaProvider>,
      );
    });
    const list = tree.root.findByType(FlatList);
    const items = list.props.data;
    expect(list.props.horizontal).toBe(true);
    expect(list.props.getItemLayout(items, 2).offset).toBe(472);
    expect(tree.root.findAllByType(Video)).toHaveLength(5);
    const card = (index: number) => list.props.renderItem({ item: items[index] });
    await act(() =>
      card(0).props.onPreviewPositionChange(items[0].id, 12.5),
    );
    await act(() =>
      list.props.onViewableItemsChanged({
        viewableItems: items.slice(5, 10).map((item: typeof items[number], index: number) => ({
          isViewable: true,
          item,
          index: index + 5,
          key: item.id,
        })),
        changed: [],
      }),
    );
    expect(card(0).props.active).toBe(false);
    await act(() =>
      list.props.onViewableItemsChanged({
        viewableItems: items.slice(0, 5).map((item: typeof items[number], index: number) => ({
          isViewable: true,
          item,
          index,
          key: item.id,
        })),
        changed: [],
      }),
    );
    expect(card(0).props.active).toBe(true);
    expect(card(0).props.previewResumeAtSeconds).toBe(12.5);
    await act(() => card(0).props.onSelect(items[0].id));
    expect(tree.root.findAllByType(Video)).toHaveLength(5);
    expect(
      tree.root.findAllByType(Video).filter(video => !video.props.muted),
    ).toHaveLength(1);
    await act(() => card(1).props.onSelect(items[1].id));
    expect(tree.root.findAllByType(Video)).toHaveLength(5);
    expect(
      tree.root.findAllByType(Video).filter(video => !video.props.muted),
    ).toHaveLength(1);
    await act(() =>
      tree.root.findByProps({ testID: 'home-clear-card-focus' }).props.onPress(),
    );
    expect(tree.root.findAllByType(Video).every(video => video.props.muted)).toBe(
      true,
    );
    await act(() =>
      list.props.onViewableItemsChanged({
        viewableItems: [
          { isViewable: true, item: items[0], index: 0, key: items[0].id },
          { isViewable: true, item: items[1], index: 1, key: items[1].id },
          { isViewable: true, item: items[2], index: 2, key: items[2].id },
          { isViewable: true, item: items[3], index: 3, key: items[3].id },
          { isViewable: true, item: items[4], index: 4, key: items[4].id },
        ],
        changed: [],
      }),
    );
    expect(tree.root.findAllByType(Video)).toHaveLength(5);
    const dimmedCards = tree.root.findAllByType(View).filter(view => StyleSheet.flatten(view.props.style)?.opacity === 0.35);
    expect(dimmedCards.length).toBeGreaterThan(0);
    expect(StyleSheet.flatten(dimmedCards[0].props.style).width).toBe(220);

    await act(() => {
      tree.update(
        <GameplaySafeAreaProvider>
          <HomeScreen
            onBack={() => {}}
            previewPlaybackEnabled={false}
            visualState="dimmed"
          />
        </GameplaySafeAreaProvider>,
      );
    });
    expect(tree.root.findAllByType(Video)).toHaveLength(0);
  } finally {
    await act(() => tree?.unmount());
    AppState.currentState = previousState;
  }
});

test('only the card Start button requests Simulation navigation', async () => {
  const onScenarioStart = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <GameplaySafeAreaProvider>
        <HomeScreen onBack={() => {}} onScenarioStart={onScenarioStart} />
      </GameplaySafeAreaProvider>,
    );
  });

  const list = tree.root.findByType(FlatList);
  const firstCard = list.props.renderItem({ item: list.props.data[0] });
  await act(() => firstCard.props.onSelect(list.props.data[0].id));
  expect(onScenarioStart).not.toHaveBeenCalled();

  await act(() => firstCard.props.onStart(list.props.data[0].id));
  expect(onScenarioStart).toHaveBeenCalledWith('scenario-1');

  await act(() => tree.unmount());
});

test('has no vertical scroll container and keeps the horizontal carousel enabled', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <GameplaySafeAreaProvider>
        <HomeScreen />
      </GameplaySafeAreaProvider>,
    );
  });

  expect(tree.root.findByType(FlatList).props.horizontal).toBe(true);

  await act(() => tree.unmount());
});
