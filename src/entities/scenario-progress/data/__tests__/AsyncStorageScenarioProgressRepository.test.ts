import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScenarioProgress } from '../../model/types';
import AsyncStorageScenarioProgressRepository from '../AsyncStorageScenarioProgressRepository';
import { getScenarioProgressStorageKey } from '../scenarioProgressStorageKeys';

const progress: ScenarioProgress = {
  schemaVersion: 2,
  scenarioId: 'iraq-war',
  positionSeconds: 64,
  durationSeconds: 97,
  answers: [{ decisionId: 'decision-1', optionId: 'option-2' }],
  status: 'in_progress',
  updatedAt: 1,
};
const legacyProgress = {
  scenarioId: progress.scenarioId,
  positionSeconds: progress.positionSeconds,
  durationSeconds: progress.durationSeconds,
  answers: progress.answers,
  status: progress.status,
  updatedAt: progress.updatedAt,
  completedDecisionIds: ['conflicting-decision'],
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

  test('migrates a V1 record and treats answers as the source of truth', async () => {
    const repository = new AsyncStorageScenarioProgressRepository();
    await AsyncStorage.setItem(key, JSON.stringify(legacyProgress));
    jest.clearAllMocks();

    await expect(repository.get(progress.scenarioId)).resolves.toEqual(
      progress,
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify(progress),
    );
    await expect(AsyncStorage.getItem(key)).resolves.toBe(
      JSON.stringify(progress),
    );
    expect(progress.answers.map(answer => answer.decisionId)).toEqual([
      'decision-1',
    ]);
  });

  test('returns migrated progress when the best-effort rewrite fails', async () => {
    const repository = new AsyncStorageScenarioProgressRepository();
    const legacyValue = JSON.stringify(legacyProgress);
    await AsyncStorage.setItem(key, legacyValue);
    jest.clearAllMocks();
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(
      new Error('storage unavailable'),
    );

    await expect(repository.get(progress.scenarioId)).resolves.toEqual(
      progress,
    );
    await expect(AsyncStorage.getItem(key)).resolves.toBe(legacyValue);
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });

  test('writes only the V2 source-of-truth fields', async () => {
    const repository = new AsyncStorageScenarioProgressRepository();

    await repository.save(progress);

    const storedValue = await AsyncStorage.getItem(key);
    expect(JSON.parse(storedValue!)).toEqual(progress);
    expect(JSON.parse(storedValue!)).not.toHaveProperty(
      'completedDecisionIds',
    );
  });

  test('returns null without removing anything when progress is absent', async () => {
    const repository = new AsyncStorageScenarioProgressRepository();

    await expect(repository.get(progress.scenarioId)).resolves.toBeNull();

    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });
});
