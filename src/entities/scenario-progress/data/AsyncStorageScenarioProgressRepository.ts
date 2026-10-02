import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SCENARIO_PROGRESS_SCHEMA_VERSION,
  type DecisionAnswer,
  type ScenarioProgress,
  type ScenarioProgressStatus,
} from '../model/types';
import type { ScenarioProgressRepository } from '../repository/ScenarioProgressRepository';
import { getScenarioProgressStorageKey } from './scenarioProgressStorageKeys';

type LegacyScenarioProgressV1 = Omit<ScenarioProgress, 'schemaVersion'> & {
  completedDecisionIds: string[];
  schemaVersion?: 1;
};

const isAnswers = (value: unknown): value is DecisionAnswer[] =>
  Array.isArray(value) &&
  value.every(
    answer =>
      Boolean(answer) &&
      typeof answer === 'object' &&
      typeof answer.decisionId === 'string' &&
      (typeof answer.optionId === 'string' || answer.optionId === null),
  );

const isStatus = (value: unknown): value is ScenarioProgressStatus =>
  value === 'in_progress' || value === 'completed';

const hasValidProgressFields = (
  value: unknown,
): value is Omit<ScenarioProgress, 'schemaVersion'> => {
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
    isAnswers(progress.answers) &&
    isStatus(progress.status) &&
    typeof progress.updatedAt === 'number' &&
    Number.isFinite(progress.updatedAt)
  );
};

const isScenarioProgressV2 = (value: unknown): value is ScenarioProgress =>
  hasValidProgressFields(value) &&
  (value as Partial<ScenarioProgress>).schemaVersion ===
    SCENARIO_PROGRESS_SCHEMA_VERSION;

const isLegacyScenarioProgressV1 = (
  value: unknown,
): value is LegacyScenarioProgressV1 => {
  if (!hasValidProgressFields(value)) {
    return false;
  }

  const legacy = value as Partial<LegacyScenarioProgressV1>;
  return (
    (legacy.schemaVersion === undefined || legacy.schemaVersion === 1) &&
    Array.isArray(legacy.completedDecisionIds) &&
    legacy.completedDecisionIds.every(id => typeof id === 'string')
  );
};

const normalizeProgress = (
  progress: Omit<ScenarioProgress, 'schemaVersion'>,
): ScenarioProgress => ({
  schemaVersion: SCENARIO_PROGRESS_SCHEMA_VERSION,
  scenarioId: progress.scenarioId,
  positionSeconds: progress.positionSeconds,
  durationSeconds: progress.durationSeconds,
  answers: progress.answers.map(answer => ({ ...answer })),
  status: progress.status,
  updatedAt: progress.updatedAt,
});

export default class AsyncStorageScenarioProgressRepository
  implements ScenarioProgressRepository
{
  async get(scenarioId: string): Promise<ScenarioProgress | null> {
    const key = getScenarioProgressStorageKey(scenarioId);
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return null;
    }

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(storedValue);
    } catch {
      await AsyncStorage.removeItem(key);
      return null;
    }

    if (isScenarioProgressV2(parsedValue)) {
      if (parsedValue.scenarioId !== scenarioId) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      return normalizeProgress(parsedValue);
    }

    if (
      isLegacyScenarioProgressV1(parsedValue) &&
      parsedValue.scenarioId === scenarioId
    ) {
      const migrated = normalizeProgress(parsedValue);

      try {
        await AsyncStorage.setItem(key, JSON.stringify(migrated));
      } catch {
        // The valid V1 record remains intact and migration can retry next load.
      }

      return migrated;
    }

    await AsyncStorage.removeItem(key);
    return null;
  }

  save(progress: ScenarioProgress): Promise<void> {
    return AsyncStorage.setItem(
      getScenarioProgressStorageKey(progress.scenarioId),
      JSON.stringify(normalizeProgress(progress)),
    );
  }

  remove(scenarioId: string): Promise<void> {
    return AsyncStorage.removeItem(getScenarioProgressStorageKey(scenarioId));
  }
}
