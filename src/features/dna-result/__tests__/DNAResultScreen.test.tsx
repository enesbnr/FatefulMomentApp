import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { GameplaySafeAreaProvider } from '../../../app/providers/GameplaySafeAreaProvider';
import { ScenarioProgressProvider } from '../../../app/providers/ScenarioProgressProvider';
import { dnaDimensions } from '../../../entities/scenario/model/decisionTypes';
import MemoryScenarioProgressRepository from '../../../entities/scenario-progress/testing/MemoryScenarioProgressRepository';
import type { GameplayDrawerScreenProps } from '../../../navigation/types';
import DNAResultScreen from '../screens/DNAResultScreen';

const createScreenProps = (
  scenarioId?: string,
  onFocusListener?: (listener: () => void) => void,
) =>
  ({
    navigation: {
      navigate: jest.fn(),
      addListener: jest.fn((event, listener) => {
        if (event === 'focus') {
          onFocusListener?.(listener);
        }
        return jest.fn();
      }),
    },
    route: { params: scenarioId ? { scenarioId } : undefined },
  } as unknown as GameplayDrawerScreenProps<'DNAResult'>);

test('renders the DNA result sections and every scored trait', async () => {
  let tree!: Renderer.ReactTestRenderer;
  const screenProps = createScreenProps();
  const repository = new MemoryScenarioProgressRepository();

  await act(() => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 812, height: 375 },
            insets: { top: 0, right: 0, bottom: 0, left: 0 },
          }}
        >
          <GameplaySafeAreaProvider>
            <DNAResultScreen {...screenProps} />
          </GameplaySafeAreaProvider>
        </SafeAreaProvider>
      </ScenarioProgressProvider>,
    );
  });

  expect(tree.root.findByProps({ testID: 'dna-archetype-card' })).toBeTruthy();
  expect(
    tree.root.findByProps({ testID: 'dna-psychological-matrix' }),
  ).toBeTruthy();
  expect(
    tree.root.findByProps({ testID: 'dna-pattern-detection' }),
  ).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'dna-blind-spot' })).toBeTruthy();
  expect(
    tree.root.findByProps({ testID: 'dna-section-dna-icon' }),
  ).toBeTruthy();
  expect(
    tree.root.findByProps({ testID: 'dna-section-pattern-icon' }),
  ).toBeTruthy();
  expect(
    tree.root.findByProps({ testID: 'dna-section-target-icon' }),
  ).toBeTruthy();

  dnaDimensions.forEach(trait => {
    expect(
      tree.root.findByProps({ testID: `dna-trait-${trait}` }),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({ testID: `dna-trait-${trait}-icon` }),
    ).toBeTruthy();
  });

  const resultScroll = tree.root.findByType(ScrollView);
  expect(resultScroll.props.scrollEnabled).toBe(false);
  await act(() =>
    resultScroll.props.onContentSizeChange(727, 274),
  );
  expect(tree.root.findByType(ScrollView).props.scrollEnabled).toBe(true);
  await act(() =>
    tree.root.findByType(ScrollView).props.onContentSizeChange(727, 272),
  );
  expect(tree.root.findByType(ScrollView).props.scrollEnabled).toBe(false);

  await act(() => tree.unmount());
});

test('renders stored decision effects in the score grid and radar chart', async () => {
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
      {
        decisionId: 'iraq-war-decision-2',
        optionId: 'iraq-war-decision-2-option-2',
      },
      {
        decisionId: 'iraq-war-decision-3',
        optionId: 'iraq-war-decision-3-option-2',
      },
    ],
    status: 'completed',
    updatedAt: 1,
  });
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 812, height: 375 },
            insets: { top: 0, right: 0, bottom: 0, left: 0 },
          }}
        >
          <GameplaySafeAreaProvider>
            <DNAResultScreen {...createScreenProps('scenario-1')} />
          </GameplaySafeAreaProvider>
        </SafeAreaProvider>
      </ScenarioProgressProvider>,
    );
  });

  expect(
    tree.root.findByProps({ testID: 'dna-trait-vision-value' }).props.children,
  ).toBe(64);
  expect(
    tree.root.findByProps({ testID: 'dna-trait-empathy-value' }).props.children,
  ).toBe(76);
  expect(
    tree.root.findByProps({ testID: 'dna-trait-ethics-value' }).props.children,
  ).toBe(70);

  const dynamicPoints = tree.root.findByProps({
    testID: 'dna-radar-score-polygon',
  }).props.points;
  expect(dynamicPoints).not.toContain('NaN');

  await act(() => tree.unmount());
});

test('reloads the same scenario result whenever the screen regains focus', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const createProgress = (optionSuffix: number) => ({
    schemaVersion: 2 as const,
    scenarioId: 'scenario-1',
    positionSeconds: 97,
    durationSeconds: 97,
    answers: [1, 2, 3].map(decisionNumber => ({
      decisionId: `iraq-war-decision-${decisionNumber}`,
      optionId: `iraq-war-decision-${decisionNumber}-option-${optionSuffix}`,
    })),
    status: 'completed' as const,
    updatedAt: optionSuffix,
  });
  await repository.save(createProgress(1));
  let focusListener!: () => void;
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 812, height: 375 },
            insets: { top: 0, right: 0, bottom: 0, left: 0 },
          }}
        >
          <GameplaySafeAreaProvider>
            <DNAResultScreen
              {...createScreenProps('scenario-1', listener => {
                focusListener = listener;
              })}
            />
          </GameplaySafeAreaProvider>
        </SafeAreaProvider>
      </ScenarioProgressProvider>,
    );
  });

  const initialEthics = tree.root.findByProps({
    testID: 'dna-trait-ethics-value',
  }).props.children;

  await repository.save(createProgress(3));
  await act(async () => focusListener());

  expect(
    tree.root.findByProps({ testID: 'dna-trait-ethics-value' }).props.children,
  ).not.toBe(initialEthics);

  await act(() => tree.unmount());
});
