jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { AppState, FlatList, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';
import HomeScreen from '../src/features/scenarios/home/HomeScreen';
import { createScenarios } from '../src/features/scenarios/home/scenarios';

test('both visual states contain 30 items without changing media ownership or content', () => {
  const normal = createScenarios('normal');
  const dimmed = createScenarios('dimmed');
  expect(normal).toHaveLength(30);
  expect(new Set(normal.map(item => item.id)).size).toBe(30);
  expect(normal.every(item => !item.dimmed)).toBe(true);
  expect(dimmed[0].dimmed).toBe(false);
  expect(dimmed.slice(1).every(item => item.dimmed)).toBe(true);
  expect(normal.map(item => item.title)).toEqual(dimmed.map(item => item.title));
});

test('selection assigns at most one video and retains dimmed cards', async () => {
  const previousState = AppState.currentState;
  AppState.currentState = 'active';
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(() => { tree = Renderer.create(<HomeScreen onBack={() => {}} visualState="dimmed" />); });
    const list = tree.root.findByType(FlatList);
    const items = list.props.data;
    expect(list.props.horizontal).toBe(true);
    expect(list.props.getItemLayout(items, 2).offset).toBe(472);
    expect(tree.root.findAllByType(Video)).toHaveLength(0);
    const card = (index: number) => list.props.renderItem({ item: items[index] });
    await act(() => card(0).props.onSelect());
    expect(tree.root.findAllByType(Video)).toHaveLength(1);
    await act(() => card(1).props.onSelect());
    expect(tree.root.findAllByType(Video)).toHaveLength(1);
    const dimmedCards = tree.root.findAllByType(View).filter(view => StyleSheet.flatten(view.props.style)?.opacity === 0.35);
    expect(dimmedCards.length).toBeGreaterThan(0);
    expect(StyleSheet.flatten(dimmedCards[0].props.style).width).toBe(220);
  } finally {
    await act(() => tree?.unmount());
    AppState.currentState = previousState;
  }
});
