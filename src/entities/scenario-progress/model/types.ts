import type {
  DecisionOption,
  ScenarioDecision,
} from '../../scenario/model/decisionTypes';

export type DecisionAnswer = {
  decisionId: ScenarioDecision['id'];
  optionId: DecisionOption['id'] | null;
};

export type ScenarioProgressStatus = 'in_progress' | 'completed';
export const SCENARIO_PROGRESS_SCHEMA_VERSION = 2 as const;

export type ScenarioProgress = {
  schemaVersion: typeof SCENARIO_PROGRESS_SCHEMA_VERSION;
  scenarioId: string;
  positionSeconds: number;
  durationSeconds: number;
  answers: DecisionAnswer[];
  status: ScenarioProgressStatus;
  updatedAt: number;
};
