import React, { useEffect } from 'react';
import Renderer, { act } from 'react-test-renderer';
import useDecisionPlayback from '../hooks/useDecisionPlayback';
import { decisionFixture } from '../testing/decisionFixtures';

type PlaybackState = ReturnType<typeof useDecisionPlayback>;

function HookHarness({
  onChange,
  initialAnswers,
  timerRunning = true,
  presentationDelayMs,
}: {
  onChange: (state: PlaybackState) => void;
  initialAnswers?: { decisionId: string; optionId: string | null }[];
  timerRunning?: boolean;
  presentationDelayMs?: number;
}) {
  const state = useDecisionPlayback({
    decisions: [decisionFixture],
    timerRunning,
    initialAnswers,
    presentationDelayMs,
  });

  useEffect(() => onChange(state), [onChange, state]);

  return null;
}

describe('useDecisionPlayback', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('waits for the presentation delay without changing the stored trigger', async () => {
    let latest!: PlaybackState;
    let tree!: Renderer.ReactTestRenderer;

    await act(() => {
      tree = Renderer.create(
        <HookHarness
          presentationDelayMs={250}
          onChange={state => {
            latest = state;
          }}
        />,
      );
    });

    await act(() => latest.handleProgress(0.249));
    expect(latest.activeDecision).toBeUndefined();

    await act(() => latest.handleProgress(0.25));
    expect(latest.activeDecision?.id).toBe(decisionFixture.id);

    await act(() => tree.unmount());
  });

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
          initialAnswers={[{ decisionId: decisionFixture.id, optionId: null }]}
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

  test('pauses the deadline while inactive and enters urgent state at its boundary', async () => {
    let latest!: PlaybackState;
    let tree!: Renderer.ReactTestRenderer;
    const onChange = (state: PlaybackState) => {
      latest = state;
    };

    await act(() => {
      tree = Renderer.create(<HookHarness onChange={onChange} />);
    });
    await act(() => latest.handleProgress(0));
    await act(() => jest.advanceTimersByTime(5_000));

    await act(() => {
      tree.update(<HookHarness onChange={onChange} timerRunning={false} />);
    });
    const progressWhenPaused = latest.progress;
    expect(progressWhenPaused).toBeCloseTo(2 / 3, 1);
    await act(() => jest.advanceTimersByTime(20_000));
    expect(latest.phase).toBe('choosing');
    expect(latest.urgent).toBe(false);
    expect(latest.progress).toBeLessThanOrEqual(progressWhenPaused);

    await act(() => {
      tree.update(<HookHarness onChange={onChange} timerRunning />);
    });
    expect(latest.progress).toBeLessThanOrEqual(progressWhenPaused);
    await act(() => jest.advanceTimersByTime(5_999));
    expect(latest.urgent).toBe(false);

    await act(() => jest.advanceTimersByTime(1));
    expect(latest.urgent).toBe(true);
    expect(latest.progress).toBeCloseTo(
      decisionFixture.urgentAtMs / decisionFixture.durationMs,
    );
    expect(latest.progress).toBeLessThan(progressWhenPaused);

    await act(() => jest.advanceTimersByTime(4_000));
    expect(latest.phase).toBe('revealed');

    await act(() => tree.unmount());
  });

  test('does not restart the timer effect when the urgent boundary updates remaining time', async () => {
    let latest!: PlaybackState;
    let renderCount = 0;
    let tree!: Renderer.ReactTestRenderer;
    let now = 0;
    const nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now++);

    await act(() => {
      tree = Renderer.create(
        <HookHarness
          onChange={state => {
            renderCount += 1;
            latest = state;
          }}
        />,
      );
    });
    await act(() => latest.handleProgress(0));
    const rendersBeforeUrgent = renderCount;

    await act(() =>
      jest.advanceTimersByTime(
        decisionFixture.durationMs - decisionFixture.urgentAtMs,
      ),
    );

    expect(latest.urgent).toBe(true);
    expect(renderCount - rendersBeforeUrgent).toBeLessThanOrEqual(2);

    await act(() => tree.unmount());
    nowSpy.mockRestore();
  });
});
