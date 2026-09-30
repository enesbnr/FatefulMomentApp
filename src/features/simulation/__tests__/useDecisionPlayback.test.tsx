import React, { useEffect } from 'react';
import Renderer, { act } from 'react-test-renderer';
import useDecisionPlayback from '../hooks/useDecisionPlayback';
import { decisionFixture } from '../testing/decisionFixtures';

type PlaybackState = ReturnType<typeof useDecisionPlayback>;

function HookHarness({
  onChange,
}: {
  onChange: (state: PlaybackState) => void;
}) {
  const state = useDecisionPlayback({
    decisions: [decisionFixture],
    timerRunning: true,
  });

  useEffect(() => onChange(state), [onChange, state]);

  return null;
}

describe('useDecisionPlayback', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('completes a selected decision when its timer expires', async () => {
    let latest!: PlaybackState;
    let tree!: Renderer.ReactTestRenderer;

    await act(() => {
      tree = Renderer.create(
        <HookHarness
          onChange={state => {
            latest = state;
          }}
        />,
      );
    });

    await act(() => latest.handleProgress(0));
    expect(latest.activeDecision?.id).toBe(decisionFixture.id);

    await act(() => latest.handleSelectOption('option-2'));
    await act(() => jest.advanceTimersByTime(decisionFixture.durationMs));

    expect(latest.phase).toBe('locked');
    expect(latest.userChoiceId).toBe('option-2');

    await act(() =>
      jest.advanceTimersByTime(decisionFixture.feedbackTiming.lockedMs + 100),
    );
    expect(latest.phase).toBe('revealed');

    await act(() =>
      jest.advanceTimersByTime(decisionFixture.feedbackTiming.revealedMs + 100),
    );

    expect(latest.activeDecision).toBeUndefined();
    expect(latest.answers).toEqual([
      { decisionId: decisionFixture.id, optionId: 'option-2' },
    ]);

    await act(() => tree.unmount());
  });

  test('keeps the decision open at zero until the user selects', async () => {
    let latest!: PlaybackState;
    let tree!: Renderer.ReactTestRenderer;

    await act(() => {
      tree = Renderer.create(
        <HookHarness
          onChange={state => {
            latest = state;
          }}
        />,
      );
    });

    await act(() => latest.handleProgress(0));
    await act(() => jest.advanceTimersByTime(decisionFixture.durationMs));

    expect(latest.activeDecision?.id).toBe(decisionFixture.id);
    expect(latest.progress).toBe(0);
    expect(latest.urgent).toBe(true);

    await act(() => latest.handleSelectOption('option-3'));
    expect(latest.phase).toBe('locked');

    await act(() =>
      jest.advanceTimersByTime(decisionFixture.feedbackTiming.lockedMs + 100),
    );
    expect(latest.phase).toBe('revealed');

    await act(() =>
      jest.advanceTimersByTime(decisionFixture.feedbackTiming.revealedMs + 100),
    );
    expect(latest.activeDecision).toBeUndefined();
    expect(latest.answers[0].optionId).toBe('option-3');

    await act(() => tree.unmount());
  });
});
