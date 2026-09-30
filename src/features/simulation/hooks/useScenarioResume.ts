import { useCallback, useEffect, useRef, useState } from 'react';
import { useScenarioProgressRepository } from '../../../app/providers/ScenarioProgressProvider';
import type {
  DecisionAnswer,
  ScenarioProgress,
} from '../../../entities/scenario-progress/model/types';

const SAVE_INTERVAL_MS = 2_000;

export default function useScenarioResume(scenarioId: string) {
  const repository = useScenarioProgressRepository();
  const [loading, setLoading] = useState(true);
  const [savedProgress, setSavedProgress] = useState<ScenarioProgress | null>(
    null,
  );
  const latestProgressRef = useRef<ScenarioProgress | null>(null);
  const lastPersistedAtRef = useRef(0);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  const persist = useCallback(
    (progress: ScenarioProgress) => {
      lastPersistedAtRef.current = Date.now();
      writeQueueRef.current = writeQueueRef.current
        .catch(() => undefined)
        .then(() => repository.save(progress));
      return writeQueueRef.current;
    },
    [repository],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

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
  }, [persist, repository, scenarioId]);

  const recordProgress = useCallback(
    (
      positionSeconds: number,
      durationSeconds: number,
      answers: DecisionAnswer[],
    ) => {
      const progress: ScenarioProgress = {
        scenarioId,
        positionSeconds: Math.max(0, positionSeconds),
        durationSeconds: Math.max(0, durationSeconds),
        completedDecisionIds: answers.map(answer => answer.decisionId),
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
      : writeQueueRef.current;
  }, [persist]);

  const markCompleted = useCallback(
    (
      positionSeconds: number,
      durationSeconds: number,
      answers: DecisionAnswer[],
    ) => {
      const progress: ScenarioProgress = {
        scenarioId,
        positionSeconds: Math.max(positionSeconds, durationSeconds),
        durationSeconds: Math.max(0, durationSeconds),
        completedDecisionIds: answers.map(answer => answer.decisionId),
        answers,
        status: 'completed',
        updatedAt: Date.now(),
      };

      latestProgressRef.current = progress;
      setSavedProgress(progress);
      return persist(progress);
    },
    [persist, scenarioId],
  );

  const resumableProgress =
    savedProgress?.status === 'in_progress' ? savedProgress : null;

  return {
    loading,
    resumableProgress,
    recordProgress,
    flush,
    markCompleted,
  };
}
