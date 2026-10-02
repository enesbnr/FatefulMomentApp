import React, { useEffect } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScenarioProgressProvider } from '../../../app/providers/ScenarioProgressProvider';
import type { ScenarioProgress } from '../../../entities/scenario-progress/model/types';
import type { ScenarioProgressRepository } from '../../../entities/scenario-progress/repository/ScenarioProgressRepository';
import MemoryScenarioProgressRepository from '../../../entities/scenario-progress/testing/MemoryScenarioProgressRepository';
import useScenarioResume from '../hooks/useScenarioResume';

type ResumeState = ReturnType<typeof useScenarioResume>;

function HookHarness({ onChange }: { onChange: (state: ResumeState) => void }) {
  const state = useScenarioResume('iraq-war');
  useEffect(() => {
    onChange(state);
  }, [onChange, state]);
  return null;
}

test('hydrates and updates progress through the repository boundary', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const savedProgress: ScenarioProgress = {
    schemaVersion: 2,
    scenarioId: 'iraq-war',
    positionSeconds: 64,
    durationSeconds: 97,
    answers: [{ decisionId: 'decision-1', optionId: 'option-2' }],
    status: 'in_progress',
    updatedAt: 1,
  };
  await repository.save(savedProgress);

  let latest!: ResumeState;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <HookHarness
          onChange={state => {
            latest = state;
          }}
        />
      </ScenarioProgressProvider>,
    );
  });

  expect(latest.loading).toBe(false);
  expect(latest.resumableProgress).toEqual(savedProgress);

  await act(async () => {
    latest.recordProgress(70, 97, savedProgress.answers);
    await latest.flush();
  });

  expect(await repository.get('iraq-war')).toMatchObject({
    positionSeconds: 70,
    answers: [{ decisionId: 'decision-1', optionId: 'option-2' }],
    status: 'in_progress',
  });

  await act(() => tree.unmount());
});

test('keeps a read failure separate from missing progress and retries safely', async () => {
  const savedProgress: ScenarioProgress = {
    schemaVersion: 2,
    scenarioId: 'iraq-war',
    positionSeconds: 64,
    durationSeconds: 97,
    answers: [{ decisionId: 'decision-1', optionId: 'option-2' }],
    status: 'in_progress',
    updatedAt: 1,
  };
  const repository: ScenarioProgressRepository = {
    get: jest
      .fn<ReturnType<ScenarioProgressRepository['get']>, [string]>()
      .mockRejectedValueOnce(new Error('storage temporarily unavailable'))
      .mockResolvedValue(savedProgress),
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  let latest!: ResumeState;
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <HookHarness
          onChange={state => {
            latest = state;
          }}
        />
      </ScenarioProgressProvider>,
    );
  });

  expect(latest.loading).toBe(false);
  expect(latest.loadError).toBe(true);
  expect(latest.resumableProgress).toBeNull();
  expect(repository.save).not.toHaveBeenCalled();

  await act(async () => latest.retryLoad());

  expect(repository.get).toHaveBeenCalledTimes(2);
  expect(latest.loading).toBe(false);
  expect(latest.loadError).toBe(false);
  expect(latest.resumableProgress).toEqual(savedProgress);
  expect(repository.save).not.toHaveBeenCalled();

  await act(() => tree.unmount());
});

test('keeps only the latest pending progress while a save is in flight', async () => {
  const pendingSaves: Array<() => void> = [];
  const savedPositions: number[] = [];
  const repository: ScenarioProgressRepository = {
    get: async () => null,
    remove: async () => undefined,
    save: progress => {
      savedPositions.push(progress.positionSeconds);
      return new Promise<void>(resolve => {
        pendingSaves.push(resolve);
      });
    },
  };

  let latest!: ResumeState;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <HookHarness
          onChange={state => {
            latest = state;
          }}
        />
      </ScenarioProgressProvider>,
    );
  });

  latest.recordProgress(10, 97, []);
  expect(savedPositions).toEqual([10]);

  latest.recordProgress(20, 97, []);
  const firstFlush = latest.flush();
  latest.recordProgress(30, 97, []);
  const finalFlush = latest.flush();

  expect(savedPositions).toEqual([10]);

  await act(async () => {
    pendingSaves.shift()?.();
    await Promise.resolve();
  });

  expect(savedPositions).toEqual([10, 30]);

  await act(async () => {
    pendingSaves.shift()?.();
    await Promise.all([firstFlush, finalFlush]);
  });

  await act(() => tree.unmount());
});

test('retries a rejected completion write', async () => {
  const repository: ScenarioProgressRepository = {
    get: async () => null,
    remove: async () => undefined,
    save: jest
      .fn<ReturnType<ScenarioProgressRepository['save']>, [ScenarioProgress]>()
      .mockRejectedValueOnce(new Error('storage unavailable'))
      .mockResolvedValue(undefined),
  };
  let latest!: ResumeState;
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <HookHarness
          onChange={state => {
            latest = state;
          }}
        />
      </ScenarioProgressProvider>,
    );
  });

  await act(async () => {
    await latest.markCompleted(97, 97, []);
  });

  expect(repository.save).toHaveBeenCalledTimes(2);
  expect(repository.save).toHaveBeenLastCalledWith(
    expect.objectContaining({
      scenarioId: 'iraq-war',
      positionSeconds: 97,
      status: 'completed',
    }),
  );

  await act(() => tree.unmount());
});

test('does not mark progress completed in memory when every completion write fails', async () => {
  const inProgress: ScenarioProgress = {
    schemaVersion: 2,
    scenarioId: 'iraq-war',
    positionSeconds: 40,
    durationSeconds: 97,
    answers: [],
    status: 'in_progress',
    updatedAt: 1,
  };
  const repository: ScenarioProgressRepository = {
    get: async () => inProgress,
    remove: async () => undefined,
    save: jest.fn().mockRejectedValue(new Error('storage unavailable')),
  };
  let latest!: ResumeState;
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <HookHarness
          onChange={state => {
            latest = state;
          }}
        />
      </ScenarioProgressProvider>,
    );
  });

  await act(async () => {
    await expect(latest.markCompleted(97, 97, [])).rejects.toThrow(
      'storage unavailable',
    );
  });

  expect(repository.save).toHaveBeenCalledTimes(2);
  expect(latest.resumableProgress).toEqual(inProgress);

  await act(() => tree.unmount());
});

test('persists the latest progress after unmount while a write is in flight', async () => {
  const pendingSaves: Array<() => void> = [];
  const savedPositions: number[] = [];
  const repository: ScenarioProgressRepository = {
    get: async () => null,
    remove: async () => undefined,
    save: progress => {
      savedPositions.push(progress.positionSeconds);
      return new Promise<void>(resolve => pendingSaves.push(resolve));
    },
  };
  let latest!: ResumeState;
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <HookHarness
          onChange={state => {
            latest = state;
          }}
        />
      </ScenarioProgressProvider>,
    );
  });

  latest.recordProgress(10, 97, []);
  latest.recordProgress(30, 97, []);
  expect(savedPositions).toEqual([10]);

  await act(() => tree.unmount());
  pendingSaves.shift()?.();
  await Promise.resolve();
  await Promise.resolve();

  expect(savedPositions).toEqual([10, 30]);

  pendingSaves.shift()?.();
  await Promise.resolve();
});
