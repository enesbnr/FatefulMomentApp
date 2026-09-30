jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

import React from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import Renderer, { act } from 'react-test-renderer';
import Video from 'react-native-video';
import { ScenarioProgressProvider } from '../../app/providers/ScenarioProgressProvider';
import MemoryScenarioProgressRepository from '../../entities/scenario-progress/testing/MemoryScenarioProgressRepository';
import DNAResultScreen from '../../features/dna-result/screens/DNAResultScreen';
import HomeScreen from '../../features/home/HomeScreen';
import SimulationBriefing from '../../features/simulation/components/SimulationBriefing';
import type { GameplayDrawerParamList } from '../types';
import GameplayNavigator from '../GameplayNavigator';

test('unmounts completed video and returns Scenarios to Home', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const navigationRef =
    createNavigationContainerRef<GameplayDrawerParamList>();
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <NavigationContainer ref={navigationRef}>
          <GameplayNavigator />
        </NavigationContainer>
      </ScenarioProgressProvider>,
    );
  });

  await act(() => {
    tree.root.findByType(HomeScreen).props.onScenarioStart('scenario-1');
  });
  await act(() => tree.root.findByType(SimulationBriefing).props.onStart());

  const video = tree.root.findByType(Video);
  await act(async () => {
    video.props.onLoad({ duration: 97 });
    await video.props.onEnd();
  });

  expect(tree.root.findByType(DNAResultScreen)).toBeDefined();
  expect(tree.root.findAllByType(Video)).toHaveLength(0);

  await act(() =>
    navigationRef.navigate('Scenarios', { screen: 'Home' }),
  );
  expect(tree.root.findByType(HomeScreen)).toBeDefined();
  expect(tree.root.findAllByType(Video)).toHaveLength(0);
  expect(navigationRef.canGoBack()).toBe(false);

  await act(() => tree.unmount());
});
