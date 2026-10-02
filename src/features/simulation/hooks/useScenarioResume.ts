import { useCallback, useEffect, useRef, useState } from 'react';
import { useScenarioProgressRepository } from '../../../app/providers/ScenarioProgressProvider';
import type {
  DecisionAnswer,
  ScenarioProgress,
} from '../../../entities/scenario-progress/model/types';
import { SCENARIO_PROGRESS_SCHEMA_VERSION } from '../../../entities/scenario-progress/model/types';

const SAVE_INTERVAL_MS = 2_000;
const COMPLETION_SAVE_ATTEMPTS = 2;

export default function useScenarioResume(scenarioId: string) {
  const repository = useScenarioProgressRepository();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [savedProgress, setSavedProgress] = useState<ScenarioProgress | null>(
    null,
  );
  const latestProgressRef = useRef<ScenarioProgress | null>(null);
  const lastPersistedAtRef = useRef(0);
  const activeProgressRef = useRef<ScenarioProgress | null>(null);
  const pendingProgressRef = useRef<ScenarioProgress | null>(null);
  const writeInFlightRef = useRef<Promise<void> | null>(null);

  const persist = useCallback(
    (progress: ScenarioProgress) => {
      lastPersistedAtRef.current = Date.now();

      if (
        activeProgressRef.current === progress ||
        pendingProgressRef.current === progress
      ) {
        return writeInFlightRef.current ?? Promise.resolve();
      }

      pendingProgressRef.current = progress;

      if (writeInFlightRef.current) {
        return writeInFlightRef.current;
      }

      const drainWrites = async () => {
        let lastError: unknown;

        while (pendingProgressRef.current) {
          const nextProgress = pendingProgressRef.current;
          pendingProgressRef.current = null;
          activeProgressRef.current = nextProgress;

          try {
            await repository.save(nextProgress);
            lastError = undefined;
          } catch (error) {
            lastError = error;
          } finally {
            activeProgressRef.current = null;
          }
        }

        if (lastError) {
          throw lastError;
        }
      };

      writeInFlightRef.current = drainWrites().finally(() => {
        writeInFlightRef.current = null;
      });

      return writeInFlightRef.current;
    },
    [repository],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    latestProgressRef.current = null;
    setSavedProgress(null);

    repository
      .get(scenarioId)
      .then(progress => {
        if (cancelled) {
          return;
        }

        latestProgressRef.current = progress;
        setSavedProgress(progress);
      })
      .catch(() => {
        if (!cancelled) {
          latestProgressRef.current = null;
          setSavedProgress(null);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      const latestProgress = latestProgressRef.current;
      if (latestProgress?.status === 'in_progress') {
        persist(latestProgress).catch(() => undefined);
      }
    };
  }, [loadAttempt, persist, repository, scenarioId]);

  const retryLoad = useCallback(() => {
    setLoadAttempt(attempt => attempt + 1);
  }, []);

  const recordProgress = useCallback(
    (
      positionSeconds: number,
      durationSeconds: number,
      answers: DecisionAnswer[],
    ) => {
      const progress: ScenarioProgress = {
        schemaVersion: SCENARIO_PROGRESS_SCHEMA_VERSION,
        scenarioId,
        positionSeconds: Math.max(0, positionSeconds),
        durationSeconds: Math.max(0, durationSeconds),
        answers,
        status: 'in_progress',
        updatedAt: Date.now(),
      };

      latestProgressRef.current = progress;

      if (Date.now() - lastPersistedAtRef.current >= SAVE_INTERVAL_MS) {
        persist(progress).catch(() => undefined);
      }
    },
    [persist, scenarioId],
  );

  const flush = useCallback(() => {
    const latestProgress = latestProgressRef.current;
    return latestProgress?.status === 'in_progress'
      ? persist(latestProgress)
      : writeInFlightRef.current ?? Promise.resolve();
  }, [persist]);

  const markCompleted = useCallback(
    (
      positionSeconds: number,
      durationSeconds: number,
      answers: DecisionAnswer[],
    ) => {
      const progress: ScenarioProgress = {
        schemaVersion: SCENARIO_PROGRESS_SCHEMA_VERSION,
        scenarioId,
        positionSeconds: Math.max(positionSeconds, durationSeconds),
        durationSeconds: Math.max(0, durationSeconds),
        answers,
        status: 'completed',
        updatedAt: Date.now(),
      };

      const saveCompletion = async () => {
        let lastError: unknown;

        for (
          let attempt = 0;
          attempt < COMPLETION_SAVE_ATTEMPTS;
          attempt += 1
        ) {
          try {
            await persist(progress);
            latestProgressRef.current = progress;
            setSavedProgress(progress);
            return;
          } catch (error) {
            lastError = error;
          }
        }

        throw lastError;
      };

      return saveCompletion();
    },
    [persist, scenarioId],
  );

  const resumableProgress =
    savedProgress?.status === 'in_progress' ? savedProgress : null;
  const completedProgress =
    savedProgress?.status === 'completed' ? savedProgress : null;

  return {
    loading,
    loadError,
    retryLoad,
    resumableProgress,
    completedProgress,
    recordProgress,
    flush,
    markCompleted,
  };
}
