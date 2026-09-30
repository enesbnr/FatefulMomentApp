import type {
  DecisionOption,
  ScenarioDecision,
} from '../../../entities/scenario/model/decisionTypes';

export type DecisionAnswer = {
  decisionId: ScenarioDecision['id'];
  optionId: DecisionOption['id'];
};

export type DecisionPhase = 'choosing' | 'locked' | 'revealed';
