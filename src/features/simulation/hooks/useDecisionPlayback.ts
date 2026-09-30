import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DecisionOption,
  ScenarioDecision,
} from '../../../entities/scenario/model/decisionTypes';
import type {
  DecisionAnswer,
  DecisionPhase,
} from '../model/decisionSessionTypes';

const TIMER_INTERVAL_MS = 100;

type Options = {
  decisions: ScenarioDecision[];
  timerRunning: boolean;
};

export default function useDecisionPlayback({
  decisions,
  timerRunning,
}: Options) {
  const completedDecisionIds = useRef(new Set<string>());
  const phaseRemainingMsRef = useRef(0);
  const [activeDecision, setActiveDecision] = useState<ScenarioDecision>();
  const [phase, setPhase] = useState<DecisionPhase>('choosing');
  const [userChoiceId, setUserChoiceId] = useState<DecisionOption['id']>();
  const [phaseRemainingMs, setPhaseRemainingMs] = useState(0);
  const [answers, setAnswers] = useState<DecisionAnswer[]>([]);

  const updatePhaseRemainingMs = useCallback((value: number) => {
    phaseRemainingMsRef.current = value;
    setPhaseRemainingMs(value);
  }, []);

  const completeDecision = useCallback(
    (decision: ScenarioDecision, optionId: DecisionOption['id']) => {
      completedDecisionIds.current.add(decision.id);
      setAnswers(currentAnswers => [
        ...currentAnswers.filter(answer => answer.decisionId !== decision.id),
        { decisionId: decision.id, optionId },
      ]);
      setActiveDecision(undefined);
      setPhase('choosing');
      setUserChoiceId(undefined);
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

    let lastTickAt = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastTickAt;
      lastTickAt = now;
      updatePhaseRemainingMs(
        Math.max(0, phaseRemainingMsRef.current - elapsedMs),
      );
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeDecision, phase, timerRunning, updatePhaseRemainingMs]);

  useEffect(() => {
    if (!activeDecision || phaseRemainingMs !== 0) {
      return;
    }

    if (phase === 'choosing') {
      if (userChoiceId) {
        setPhase('locked');
        updatePhaseRemainingMs(activeDecision.feedbackTiming.lockedMs);
      }
      return;
    }

    if (phase === 'locked') {
      setPhase('revealed');
      updatePhaseRemainingMs(activeDecision.feedbackTiming.revealedMs);
      return;
    }

    if (userChoiceId) {
      completeDecision(activeDecision, userChoiceId);
    }
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
    urgent:
      activeDecision && phase === 'choosing'
        ? phaseRemainingMs <= activeDecision.urgentAtMs
        : false,
    answers,
    handleProgress,
    handleSelectOption,
  };
}
