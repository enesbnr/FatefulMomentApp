import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { dnaDimensions } from '../../../entities/scenario/model/decisionTypes';
import type { GameplayDrawerScreenProps } from '../../../navigation/types';
import DNAResultScreen from '../screens/DNAResultScreen';

test('renders the DNA result sections and every scored trait', async () => {
  let tree!: Renderer.ReactTestRenderer;
  const screenProps = {
    navigation: { navigate: jest.fn() },
  } as unknown as GameplayDrawerScreenProps<'DNAResult'>;

  await act(() => {
    tree = Renderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 812, height: 375 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}
      >
        <DNAResultScreen {...screenProps} />
      </SafeAreaProvider>,
    );
  });

  expect(tree.root.findByProps({ testID: 'dna-archetype-card' })).toBeTruthy();
  expect(
    tree.root.findByProps({ testID: 'dna-psychological-matrix' }),
  ).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'dna-pattern-detection' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'dna-blind-spot' })).toBeTruthy();

  dnaDimensions.forEach(trait => {
    expect(tree.root.findByProps({ testID: `dna-trait-${trait}` })).toBeTruthy();
  });

  await act(() => tree.unmount());
});
