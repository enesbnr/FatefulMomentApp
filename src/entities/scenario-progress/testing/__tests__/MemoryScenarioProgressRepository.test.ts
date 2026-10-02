import type { ScenarioProgress } from '../../model/types';
import MemoryScenarioProgressRepository from '../MemoryScenarioProgressRepository';

const createProgress = (): ScenarioProgress => ({
  schemaVersion: 2,
  scenarioId: 'iraq-war',
  positionSeconds: 30,
  durationSeconds: 97,
  answers: [{ decisionId: 'decision-1', optionId: 'option-2' }],
  status: 'in_progress',
  updatedAt: 1,
});

test('does not retain mutable references passed to save', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const progress = createProgress();

  await repository.save(progress);
  progress.positionSeconds = 80;
  progress.answers[0].optionId = 'changed-option';
  progress.answers.push({ decisionId: 'decision-2', optionId: null });

  await expect(repository.get(progress.scenarioId)).resolves.toEqual(
    createProgress(),
  );
});

test('returns an isolated copy on every get', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const progress = createProgress();
  await repository.save(progress);

  const firstRead = await repository.get(progress.scenarioId);
  const secondRead = await repository.get(progress.scenarioId);

  expect(firstRead).not.toBe(secondRead);
  expect(firstRead?.answers).not.toBe(secondRead?.answers);
  expect(firstRead?.answers[0]).not.toBe(secondRead?.answers[0]);

  firstRead!.positionSeconds = 80;
  firstRead!.answers[0].optionId = 'changed-option';
  firstRead!.answers.push({ decisionId: 'decision-2', optionId: null });

  await expect(repository.get(progress.scenarioId)).resolves.toEqual(progress);
});

test('removes only the requested scenario', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const firstProgress = createProgress();
  const secondProgress = {
    ...createProgress(),
    scenarioId: 'cuban-missile-crisis',
  };
  await repository.save(firstProgress);
  await repository.save(secondProgress);

  await repository.remove(firstProgress.scenarioId);

  await expect(repository.get(firstProgress.scenarioId)).resolves.toBeNull();
  await expect(repository.get(secondProgress.scenarioId)).resolves.toEqual(
    secondProgress,
  );
});
