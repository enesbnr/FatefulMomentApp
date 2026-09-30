import type {
  DecisionOption,
  ScenarioDecision,
} from '../../scenario/model/decisionTypes';

export type DecisionAnswer = {
  decisionId: ScenarioDecision['id'];
  optionId: DecisionOption['id'] | null;
};

export type ScenarioProgressStatus = 'in_progress' | 'completed';

export type ScenarioProgress = {
  scenarioId: string;
  positionSeconds: number;
  durationSeconds: number;
  completedDecisionIds: string[];
  answers: DecisionAnswer[];
  status: ScenarioProgressStatus;
  updatedAt: number;
};
