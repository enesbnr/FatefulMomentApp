import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScenarioProgress } from '../../model/types';
import AsyncStorageScenarioProgressRepository from '../AsyncStorageScenarioProgressRepository';
import { getScenarioProgressStorageKey } from '../scenarioProgressStorageKeys';

const progress: ScenarioProgress = {
  scenarioId: 'iraq-war',
  positionSeconds: 64,
  durationSeconds: 97,
  completedDecisionIds: ['decision-1'],
  answers: [{ decisionId: 'decision-1', optionId: 'option-2' }],
  status: 'in_progress',
  updatedAt: 1,
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('AsyncStorageScenarioProgressRepository.get', () => {
  const key = getScenarioProgressStorageKey(progress.scenarioId);

  test.each([
    ['malformed JSON', '{invalid-json'],
    ['a null value', 'null'],
    [
      'missing required fields',
      JSON.stringify({ scenarioId: progress.scenarioId }),
    ],
    [
      'an invalid position',
      JSON.stringify({ ...progress, positionSeconds: -1 }),
    ],
    ['invalid answers', JSON.stringify({ ...progress, answers: [null] })],
    [
      'a different scenario ID',
      JSON.stringify({ ...progress, scenarioId: 'other-scenario' }),
    ],
  ])('removes %s and returns no saved progress', async (_, storedValue) => {
    const repository = new AsyncStorageScenarioProgressRepository();
    const otherProgress = { ...progress, scenarioId: 'other-scenario' };
    const otherKey = getScenarioProgressStorageKey(otherProgress.scenarioId);
    await AsyncStorage.setItem(key, storedValue);
    await AsyncStorage.setItem(otherKey, JSON.stringify(otherProgress));

    await expect(repository.get(progress.scenarioId)).resolves.toBeNull();

    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    await expect(AsyncStorage.getItem(key)).resolves.toBeNull();
    await expect(repository.get(otherProgress.scenarioId)).resolves.toEqual(
      otherProgress,
    );

    await expect(repository.get(progress.scenarioId)).resolves.toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);

    await repository.save(progress);
    await expect(repository.get(progress.scenarioId)).resolves.toEqual(
      progress,
    );
  });

  test('preserves valid saved progress', async () => {
    const repository = new AsyncStorageScenarioProgressRepository();
    await AsyncStorage.setItem(key, JSON.stringify(progress));

    await expect(repository.get(progress.scenarioId)).resolves.toEqual(
      progress,
    );

    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });

  test('returns null without removing anything when progress is absent', async () => {
    const repository = new AsyncStorageScenarioProgressRepository();

    await expect(repository.get(progress.scenarioId)).resolves.toBeNull();

    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });
});
