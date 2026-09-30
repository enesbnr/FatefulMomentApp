import React from 'react';
import { StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import DecisionOverlay from '../components/decision/DecisionOverlay';
import { decisionColors } from '../components/decision/decision.constants';
import { decisionFixture } from '../testing/decisionFixtures';

test('renders decision options and reports a changed selection', async () => {
  const onSelectOption = jest.fn();
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <DecisionOverlay
        options={decisionFixture.options}
        phase="choosing"
        userChoiceId="option-2"
        revealedOptionId={decisionFixture.revealedOptionId}
        progress={0.28}
        urgent={false}
        onSelectOption={onSelectOption}
      />,
    );
  });

  const optionCards = decisionFixture.options.map(option =>
    tree.root.findByProps({ testID: `decision-option-${option.id}` }),
  );
  expect(optionCards).toHaveLength(5);
  expect(optionCards[1].props.accessibilityState).toEqual({
    checked: true,
    disabled: false,
  });
  const optionFrames = decisionFixture.options.map(option =>
    tree.root.findByProps({
      testID: `decision-option-frame-${option.id}`,
    }),
  );
  expect(StyleSheet.flatten(optionFrames[0].props.style)).toMatchObject({
    width: '100%',
    height: 66,
  });
  expect(StyleSheet.flatten(optionFrames[1].props.style)).toMatchObject({
    width: '100%',
    height: 66,
  });

  await act(() => optionCards[3].props.onPress());
  expect(onSelectOption).toHaveBeenCalledWith('option-4');

  await act(() => tree.unmount());
});

test('clamps countdown progress and displays the urgent state', async () => {
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <DecisionOverlay
        options={decisionFixture.options}
        phase="choosing"
        progress={2}
        urgent
        onSelectOption={jest.fn()}
      />,
    );
  });

  expect(
    tree.root.findByProps({ testID: 'decision-urgency-overlay' }),
  ).toBeTruthy();
  const countdown = tree.root.findByProps({ testID: 'decision-countdown' });
  expect(countdown.props.accessibilityValue.now).toBe(100);
  const countdownFill = tree.root.findByProps({
    testID: 'decision-countdown-fill',
  });
  expect(StyleSheet.flatten(countdownFill.props.style)).toMatchObject({
    backgroundColor: decisionColors.countdownUrgent,
    width: '100%',
  });

  await act(() => tree.unmount());
});
