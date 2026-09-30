import React, { useEffect } from 'react';
import Renderer, { act } from 'react-test-renderer';
import useDecisionPlayback from '../hooks/useDecisionPlayback';
import { decisionFixture } from '../testing/decisionFixtures';

type PlaybackState = ReturnType<typeof useDecisionPlayback>;

function HookHarness({
  onChange,
  initialAnswers,
}: {
  onChange: (state: PlaybackState) => void;
  initialAnswers?: { decisionId: string; optionId: string | null }[];
}) {
  const state = useDecisionPlayback({
    decisions: [decisionFixture],
    timerRunning: true,
    initialAnswers,
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

  test('reveals the historical choice and completes with zero effects on timeout', async () => {
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
    expect(latest.phase).toBe('revealed');
    expect(latest.userChoiceId).toBeUndefined();
    expect(latest.progress).toBe(0);
    expect(latest.urgent).toBe(false);

    await act(() =>
      jest.advanceTimersByTime(decisionFixture.feedbackTiming.revealedMs + 100),
    );
    expect(latest.activeDecision).toBeUndefined();
    expect(latest.answers).toEqual([
      { decisionId: decisionFixture.id, optionId: null },
    ]);

    await act(() => tree.unmount());
  });

  test('does not reopen a restored unanswered decision', async () => {
    let latest!: PlaybackState;
    let tree!: Renderer.ReactTestRenderer;

    await act(() => {
      tree = Renderer.create(
        <HookHarness
          initialAnswers={[
            { decisionId: decisionFixture.id, optionId: null },
          ]}
          onChange={state => {
            latest = state;
          }}
        />,
      );
    });

    await act(() => latest.handleProgress(30));
    expect(latest.activeDecision).toBeUndefined();
    expect(latest.answers[0].optionId).toBeNull();

    await act(() => tree.unmount());
  });

  test('does not reopen a decision restored as completed', async () => {
    let latest!: PlaybackState;
    let tree!: Renderer.ReactTestRenderer;

    await act(() => {
      tree = Renderer.create(
        <HookHarness
          initialAnswers={[
            { decisionId: decisionFixture.id, optionId: 'option-2' },
          ]}
          onChange={state => {
            latest = state;
          }}
        />,
      );
    });

    await act(() => latest.handleProgress(30));
    expect(latest.activeDecision).toBeUndefined();
    expect(latest.answers[0].optionId).toBe('option-2');

    await act(() => tree.unmount());
  });
});
