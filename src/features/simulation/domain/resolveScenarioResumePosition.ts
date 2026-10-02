import type {
  ScenarioDecision,
} from '../../../entities/scenario/model/decisionTypes';
import type { DecisionAnswer } from '../../../entities/scenario-progress/model/types';

export const RESUME_AFTER_DECISION_SECONDS = 0.25;

export default function resolveScenarioResumePosition(
  decisions: ScenarioDecision[],
  answers: DecisionAnswer[],
  durationSeconds: number,
) {
  const completedDecisionIds = new Set(
    answers.map(answer => answer.decisionId),
  );
  const lastCompletedDecision = decisions.reduce<ScenarioDecision | null>(
    (latest, decision) =>
      completedDecisionIds.has(decision.id) &&
      (!latest || decision.triggerAtMs > latest.triggerAtMs)
        ? decision
        : latest,
    null,
  );

  if (!lastCompletedDecision) {
    return 0;
  }

  const checkpointSeconds =
    lastCompletedDecision.triggerAtMs / 1_000 +
    RESUME_AFTER_DECISION_SECONDS;
  return Math.min(checkpointSeconds, Math.max(0, durationSeconds - 1));
}
