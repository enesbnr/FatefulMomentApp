import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DecisionOption,
  ScenarioDecision,
} from '../../../entities/scenario/model/decisionTypes';
import type {
  DecisionAnswer,
  DecisionPhase,
} from '../model/decisionSessionTypes';

type Options = {
  decisions: ScenarioDecision[];
  timerRunning: boolean;
  initialAnswers?: DecisionAnswer[];
};

export default function useDecisionPlayback({
  decisions,
  timerRunning,
  initialAnswers = [],
}: Options) {
  const initialAnswersRef = useRef(initialAnswers);
  const completedDecisionIds = useRef(
    new Set(initialAnswersRef.current.map(answer => answer.decisionId)),
  );
  const phaseRemainingMsRef = useRef(0);
  const [activeDecision, setActiveDecision] = useState<ScenarioDecision>();
  const [phase, setPhase] = useState<DecisionPhase>('choosing');
  const [userChoiceId, setUserChoiceId] = useState<DecisionOption['id']>();
  const [phaseRemainingMs, setPhaseRemainingMs] = useState(0);
  const [urgent, setUrgent] = useState(false);
  const [answers, setAnswers] = useState<DecisionAnswer[]>(
    initialAnswersRef.current,
  );

  const updatePhaseRemainingMs = useCallback((value: number) => {
    phaseRemainingMsRef.current = value;
    setPhaseRemainingMs(value);
  }, []);

  const completeDecision = useCallback(
    (
      decision: ScenarioDecision,
      optionId: DecisionOption['id'] | null,
    ) => {
      completedDecisionIds.current.add(decision.id);
      setAnswers(currentAnswers => [
        ...currentAnswers.filter(answer => answer.decisionId !== decision.id),
        { decisionId: decision.id, optionId },
      ]);
      setActiveDecision(undefined);
      setPhase('choosing');
      setUserChoiceId(undefined);
      setUrgent(false);
      updatePhaseRemainingMs(0);
    },
    [updatePhaseRemainingMs],
  );

  const handleProgress = useCallback(
    (currentTimeSeconds: number) => {
      if (activeDecision) {
        return;
      }

      const currentTimeMs = currentTimeSeconds * 1_000;
      const nextDecision = decisions.find(
        decision =>
          !completedDecisionIds.current.has(decision.id) &&
          currentTimeMs >= decision.triggerAtMs,
      );

      if (!nextDecision) {
        return;
      }

      setPhase('choosing');
      setUserChoiceId(undefined);
      setUrgent(nextDecision.durationMs <= nextDecision.urgentAtMs);
      updatePhaseRemainingMs(nextDecision.durationMs);
      setActiveDecision(nextDecision);
    },
    [activeDecision, decisions, updatePhaseRemainingMs],
  );

  const handleSelectOption = useCallback(
    (optionId: DecisionOption['id']) => {
      if (!activeDecision || phase !== 'choosing') {
        return;
      }

      if (!activeDecision.options.some(option => option.id === optionId)) {
        return;
      }

      setUserChoiceId(optionId);

      if (phaseRemainingMsRef.current === 0) {
        setPhase('locked');
        updatePhaseRemainingMs(activeDecision.feedbackTiming.lockedMs);
      }
    },
    [activeDecision, phase, updatePhaseRemainingMs],
  );

  useEffect(() => {
    if (!activeDecision || !timerRunning || phaseRemainingMsRef.current === 0) {
      return;
    }

    const startedAt = Date.now();
    const startingRemainingMs = phaseRemainingMsRef.current;
    const completionTimeout = setTimeout(
      () => updatePhaseRemainingMs(0),
      startingRemainingMs,
    );
    const urgentDelayMs =
      phase === 'choosing'
        ? startingRemainingMs - activeDecision.urgentAtMs
        : -1;
    const urgentTimeout =
      urgentDelayMs > 0
        ? setTimeout(() => {
            phaseRemainingMsRef.current = activeDecision.urgentAtMs;
            setUrgent(true);
          }, urgentDelayMs)
        : undefined;

    return () => {
      clearTimeout(completionTimeout);
      if (urgentTimeout) {
        clearTimeout(urgentTimeout);
      }
      phaseRemainingMsRef.current = Math.max(
        0,
        startingRemainingMs - (Date.now() - startedAt),
      );
    };
  }, [
    activeDecision,
    phase,
    phaseRemainingMs,
    timerRunning,
    updatePhaseRemainingMs,
  ]);

  useEffect(() => {
    if (!activeDecision || phaseRemainingMs !== 0) {
      return;
    }

    if (phase === 'choosing') {
      if (userChoiceId) {
        setPhase('locked');
        updatePhaseRemainingMs(activeDecision.feedbackTiming.lockedMs);
      } else {
        setPhase('revealed');
        updatePhaseRemainingMs(activeDecision.feedbackTiming.revealedMs);
      }
      return;
    }

    if (phase === 'locked') {
      setPhase('revealed');
      updatePhaseRemainingMs(activeDecision.feedbackTiming.revealedMs);
      return;
    }

    completeDecision(activeDecision, userChoiceId ?? null);
  }, [
    activeDecision,
    completeDecision,
    phase,
    phaseRemainingMs,
    updatePhaseRemainingMs,
    userChoiceId,
  ]);

  const progress =
    activeDecision && phase === 'choosing'
      ? phaseRemainingMs / activeDecision.durationMs
      : 0;

  return {
    activeDecision,
    phase,
    userChoiceId,
    progress,
    countdownRemainingMs: phaseRemainingMsRef.current,
    timerRunning,
    urgent: Boolean(activeDecision && phase === 'choosing' && urgent),
    answers,
    handleProgress,
    handleSelectOption,
  };
}
