import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScenarioProgress } from '../model/types';
import type { ScenarioProgressRepository } from '../repository/ScenarioProgressRepository';
import { getScenarioProgressStorageKey } from './scenarioProgressStorageKeys';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

const isScenarioProgress = (value: unknown): value is ScenarioProgress => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const progress = value as Partial<ScenarioProgress>;

  return (
    typeof progress.scenarioId === 'string' &&
    typeof progress.positionSeconds === 'number' &&
    Number.isFinite(progress.positionSeconds) &&
    progress.positionSeconds >= 0 &&
    typeof progress.durationSeconds === 'number' &&
    Number.isFinite(progress.durationSeconds) &&
    progress.durationSeconds >= 0 &&
    isStringArray(progress.completedDecisionIds) &&
    Array.isArray(progress.answers) &&
    progress.answers.every(
      answer =>
        Boolean(answer) &&
        typeof answer === 'object' &&
        typeof answer.decisionId === 'string' &&
        typeof answer.optionId === 'string',
    ) &&
    (progress.status === 'in_progress' || progress.status === 'completed') &&
    typeof progress.updatedAt === 'number'
  );
};

export default class AsyncStorageScenarioProgressRepository
  implements ScenarioProgressRepository
{
  async get(scenarioId: string): Promise<ScenarioProgress | null> {
    const key = getScenarioProgressStorageKey(scenarioId);
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return null;
    }

    try {
      const parsedValue: unknown = JSON.parse(storedValue);

      if (isScenarioProgress(parsedValue) && parsedValue.scenarioId === scenarioId) {
        return parsedValue;
      }
    } catch {
      // Invalid local data is removed below and treated as no saved progress.
    }

    await AsyncStorage.removeItem(key);
    return null;
  }

  save(progress: ScenarioProgress): Promise<void> {
    return AsyncStorage.setItem(
      getScenarioProgressStorageKey(progress.scenarioId),
      JSON.stringify(progress),
    );
  }

  remove(scenarioId: string): Promise<void> {
    return AsyncStorage.removeItem(getScenarioProgressStorageKey(scenarioId));
  }
}
