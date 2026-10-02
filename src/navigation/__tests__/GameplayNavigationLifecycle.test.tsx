jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

import React from 'react';
import { BackHandler, FlatList } from 'react-native';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import Renderer, { act } from 'react-test-renderer';
import Video from 'react-native-video';
import { ScenarioProgressProvider } from '../../app/providers/ScenarioProgressProvider';
import type { ScenarioProgressRepository } from '../../entities/scenario-progress/repository/ScenarioProgressRepository';
import MemoryScenarioProgressRepository from '../../entities/scenario-progress/testing/MemoryScenarioProgressRepository';
import DNAResultScreen from '../../features/dna-result/screens/DNAResultScreen';
import HomeScreen from '../../features/home/HomeScreen';
import SimulationBriefing from '../../features/simulation/components/SimulationBriefing';
import type { GameplayDrawerParamList } from '../types';
import GameplayNavigator from '../GameplayNavigator';

test('consumes Android system back while Home is the focused root screen', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const navigationRef = createNavigationContainerRef<GameplayDrawerParamList>();
  const addBackHandler = jest.spyOn(BackHandler, 'addEventListener');
  let tree!: Renderer.ReactTestRenderer;

  try {
    await act(async () => {
      tree = Renderer.create(
        <ScenarioProgressProvider repository={repository}>
          <NavigationContainer ref={navigationRef}>
            <GameplayNavigator />
          </NavigationContainer>
        </ScenarioProgressProvider>,
      );
    });

    const handlers = addBackHandler.mock.calls
      .filter(([eventName]) => eventName === 'hardwareBackPress')
      .map(([, handler]) => handler);

    expect(handlers.some(handler => handler({} as never))).toBe(true);
    expect(tree.root.findByType(HomeScreen)).toBeDefined();
    expect(navigationRef.canGoBack()).toBe(false);
  } finally {
    await act(() => tree?.unmount());
    addBackHandler.mockRestore();
  }
});

test('unmounts completed video and returns Scenarios to Home', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const saveProgress = jest.spyOn(repository, 'save');
  const navigationRef = createNavigationContainerRef<GameplayDrawerParamList>();
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
  expect(tree.root.findAllByType(Video)).toHaveLength(0);
  await act(() => tree.root.findByType(SimulationBriefing).props.onStart());

  const video = tree.root.findByType(Video);
  expect(saveProgress).not.toHaveBeenCalled();

  await act(() => video.props.onLoad({ duration: 97 }));
  expect(saveProgress).toHaveBeenCalledWith(
    expect.objectContaining({
      durationSeconds: 97,
      positionSeconds: 0,
    }),
  );
  expect(
    saveProgress.mock.calls.some(
      ([progress]) => progress.durationSeconds === 0,
    ),
  ).toBe(false);

  await act(async () => {
    await video.props.onEnd();
  });

  expect(tree.root.findByType(DNAResultScreen)).toBeDefined();
  expect(tree.root.findAllByType(Video)).toHaveLength(0);

  await act(() => navigationRef.navigate('Scenarios', { screen: 'Home' }));
  expect(tree.root.findByType(HomeScreen)).toBeDefined();
  expect(tree.root.findAllByType(Video)).toHaveLength(0);
  const homeScenarios = tree.root.findByType(FlatList).props.data;
  expect(homeScenarios[0]).toMatchObject({
    id: 'scenario-1',
    completed: true,
    disabled: false,
  });
  expect(homeScenarios[1]).toMatchObject({
    id: 'scenario-2',
    disabled: false,
    locked: false,
  });
  expect(navigationRef.canGoBack()).toBe(false);

  await act(() => tree.unmount());
});

test('goes back through Video and Briefing without leaving stale screens mounted', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const navigationRef = createNavigationContainerRef<GameplayDrawerParamList>();
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
  expect(tree.root.findByType(SimulationBriefing)).toBeDefined();

  await act(() => navigationRef.goBack());
  expect(tree.root.findByType(HomeScreen)).toBeDefined();
  expect(navigationRef.canGoBack()).toBe(false);

  await act(() => {
    tree.root.findByType(HomeScreen).props.onScenarioStart('scenario-1');
  });
  await act(() => tree.root.findByType(SimulationBriefing).props.onStart());
  expect(tree.root.findByType(Video)).toBeDefined();

  await act(() => navigationRef.goBack());
  expect(tree.root.findByType(SimulationBriefing)).toBeDefined();
  expect(tree.root.findAllByType(Video)).toHaveLength(0);

  await act(() => navigationRef.goBack());
  expect(tree.root.findByType(HomeScreen)).toBeDefined();
  expect(navigationRef.canGoBack()).toBe(false);

  await act(() => tree.unmount());
});

test('shows a recoverable error when the main scenario video fails to load', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const navigationRef = createNavigationContainerRef<GameplayDrawerParamList>();
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

  const failedVideo = tree.root.findByType(Video);
  await act(() => failedVideo.props.onError({}));
  expect(
    tree.root.findByProps({ testID: 'scenario-video-error' }).props
      .accessibilityRole,
  ).toBe('alert');
  expect(tree.root.findByType(Video).props.paused).toBe(true);

  await act(() => {
    tree.root
      .findByProps({ accessibilityLabel: 'Retry video' })
      .props.onPress();
  });
  expect(
    tree.root.findAllByProps({ testID: 'scenario-video-error' }),
  ).toHaveLength(0);
  expect(tree.root.findByType(Video)).not.toBe(failedVideo);

  await act(() => tree.unmount());
});

test('does not start or overwrite progress when storage read temporarily fails', async () => {
  const getProgress = jest
    .fn<ReturnType<ScenarioProgressRepository['get']>, [string]>()
    .mockResolvedValue(null);
  const repository: ScenarioProgressRepository = {
    get: getProgress,
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  const navigationRef = createNavigationContainerRef<GameplayDrawerParamList>();
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
  getProgress.mockReset();
  getProgress
    .mockRejectedValueOnce(new Error('storage temporarily unavailable'))
    .mockResolvedValue(null);
  await act(() => {
    tree.root.findByType(HomeScreen).props.onScenarioStart('scenario-1');
  });
  await act(async () => tree.root.findByType(SimulationBriefing).props.onStart());

  expect(
    tree.root.findByProps({ testID: 'scenario-progress-load-error' }),
  ).toBeDefined();
  expect(tree.root.findAllByType(Video)).toHaveLength(0);
  expect(repository.save).not.toHaveBeenCalled();

  await act(async () => {
    tree.root
      .findByProps({ accessibilityLabel: 'Retry loading progress' })
      .props.onPress();
  });

  expect(getProgress).toHaveBeenCalledTimes(2);
  expect(
    tree.root.findAllByProps({ testID: 'scenario-progress-load-error' }),
  ).toHaveLength(0);
  expect(tree.root.findAllByType(Video)).toHaveLength(1);
  expect(repository.save).not.toHaveBeenCalled();

  await act(() => tree.unmount());
});

test('replays a completed scenario without overwriting its saved result before completion', async () => {
  const repository = new MemoryScenarioProgressRepository();
  await repository.save({
    schemaVersion: 2,
    scenarioId: 'scenario-1',
    positionSeconds: 97,
    durationSeconds: 97,
    answers: [
      {
        decisionId: 'iraq-war-decision-1',
        optionId: 'iraq-war-decision-1-option-1',
      },
    ],
    status: 'completed',
    updatedAt: 1,
  });
  const saveProgress = jest.spyOn(repository, 'save');
  const navigationRef = createNavigationContainerRef<GameplayDrawerParamList>();
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

  const homeItems = tree.root.findByType(FlatList).props.data;
  const completedCard = homeItems.find(
    (scenario: { id: string }) => scenario.id === 'scenario-1',
  );
  expect(completedCard.disabled).toBe(false);
  expect(completedCard.dimmed).toBe(false);
  expect(homeItems[0].id).toBe('scenario-1');
  expect(homeItems[1]).toMatchObject({
    id: 'scenario-2',
    disabled: false,
    locked: false,
  });

  await act(() => {
    tree.root.findByType(HomeScreen).props.onScenarioStart('scenario-1');
  });
  await act(async () => tree.root.findByType(SimulationBriefing).props.onStart());

  const replayVideo = tree.root.findByType(Video);
  await act(() => replayVideo.props.onLoad({ duration: 97 }));
  await act(() => replayVideo.props.onProgress({ currentTime: 12 }));
  expect(saveProgress).not.toHaveBeenCalled();

  await act(() => navigationRef.goBack());
  expect(tree.root.findByType(SimulationBriefing)).toBeDefined();
  expect((await repository.get('scenario-1'))?.status).toBe('completed');
  expect(saveProgress).not.toHaveBeenCalled();

  await act(() => tree.unmount());
});

test('restores the last answered decision checkpoint on entry and video retry', async () => {
  const repository = new MemoryScenarioProgressRepository();
  await repository.save({
    schemaVersion: 2,
    scenarioId: 'scenario-1',
    positionSeconds: 50,
    durationSeconds: 97,
    answers: [
      {
        decisionId: 'iraq-war-decision-1',
        optionId: 'iraq-war-decision-1-option-1',
      },
    ],
    status: 'in_progress',
    updatedAt: 1,
  });
  const seek = jest.fn();
  const navigationRef = createNavigationContainerRef<GameplayDrawerParamList>();
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <NavigationContainer ref={navigationRef}>
          <GameplayNavigator />
        </NavigationContainer>
      </ScenarioProgressProvider>,
      {
        createNodeMock: element =>
          element.type === Video ? { seek } : {},
      },
    );
  });
  await act(() => {
    tree.root.findByType(HomeScreen).props.onScenarioStart('scenario-1');
  });
  await act(async () => tree.root.findByType(SimulationBriefing).props.onStart());

  const initialVideo = tree.root.findByType(Video);
  expect(
    tree.root.findByProps({ testID: 'scenario-video-restoring' }),
  ).toBeDefined();
  await act(() => initialVideo.props.onLoad({ duration: 97 }));
  expect(seek).toHaveBeenLastCalledWith(26.25);
  expect(tree.root.findByType(Video).props.paused).toBe(true);
  await act(() => tree.root.findByType(Video).props.onSeek({ seekTime: 26.25 }));
  expect(
    tree.root.findAllByProps({ testID: 'scenario-video-restoring' }),
  ).toHaveLength(0);

  await act(() => tree.root.findByType(Video).props.onError({}));
  await act(() => {
    tree.root
      .findByProps({ accessibilityLabel: 'Retry video' })
      .props.onPress();
  });
  seek.mockClear();
  const retriedVideo = tree.root.findByType(Video);
  expect(
    tree.root.findByProps({ testID: 'scenario-video-restoring' }),
  ).toBeDefined();
  await act(() => retriedVideo.props.onLoad({ duration: 97 }));
  expect(seek).toHaveBeenLastCalledWith(26.25);
  expect(tree.root.findByType(Video).props.paused).toBe(true);

  await act(() => tree.unmount());
});

test('shows a retryable error when completion cannot be persisted', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const saveProgress = jest
    .spyOn(repository, 'save')
    .mockRejectedValue(new Error('storage unavailable'));
  const navigationRef = createNavigationContainerRef<GameplayDrawerParamList>();
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

  await act(async () => {
    await tree.root.findByType(Video).props.onEnd();
  });

  expect(saveProgress).toHaveBeenCalledTimes(2);
  expect(
    tree.root.findByProps({ testID: 'scenario-completion-error' }).props
      .accessibilityRole,
  ).toBe('alert');
  expect(tree.root.findAllByType(DNAResultScreen)).toHaveLength(0);

  saveProgress.mockResolvedValue(undefined);
  await act(async () => {
    await tree.root
      .findByProps({ accessibilityLabel: 'Retry saving result' })
      .props.onPress();
  });

  expect(saveProgress).toHaveBeenCalledTimes(3);
  expect(tree.root.findByType(DNAResultScreen)).toBeDefined();
  expect(
    tree.root.findAllByProps({ testID: 'scenario-completion-error' }),
  ).toHaveLength(0);

  await act(() => tree.unmount());
});
