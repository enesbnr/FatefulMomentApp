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
    scenarioId: 'iraq-war',
    positionSeconds: 64,
    durationSeconds: 97,
    completedDecisionIds: ['decision-1'],
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
    completedDecisionIds: ['decision-1'],
    status: 'in_progress',
  });

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
