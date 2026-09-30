import type {
  DecisionFeedbackTiming,
  DecisionOption,
  ScenarioDecision,
} from '../model/decisionTypes';

const defaultFeedbackTiming: DecisionFeedbackTiming = {
  lockedMs: 350,
  revealedMs: 1_650,
};

const createDemoOptions = (decisionId: string): DecisionOption[] =>
  Array.from({ length: 5 }, (_, index) => ({
    id: `${decisionId}-option-${index + 1}`,
    label: `Demo Option ${index + 1}`,
    effects: {},
  }));

export const iraqWarDecisions: ScenarioDecision[] = [
  {
    id: 'iraq-war-decision-1',
    triggerAtMs: 28_000,
    durationMs: 15_000,
    urgentAtMs: 4_000,
    revealedOptionId: 'iraq-war-decision-1-option-1',
    feedbackTiming: defaultFeedbackTiming,
    options: createDemoOptions('iraq-war-decision-1'),
  },
  {
    id: 'iraq-war-decision-2',
    triggerAtMs: 64_000,
    durationMs: 13_000,
    urgentAtMs: 4_000,
    revealedOptionId: 'iraq-war-decision-2-option-1',
    feedbackTiming: defaultFeedbackTiming,
    options: createDemoOptions('iraq-war-decision-2'),
  },
  {
    id: 'iraq-war-decision-3',
    triggerAtMs: 77_000,
    durationMs: 10_000,
    urgentAtMs: 4_000,
    revealedOptionId: 'iraq-war-decision-3-option-1',
    feedbackTiming: defaultFeedbackTiming,
    options: createDemoOptions('iraq-war-decision-3'),
  },
];
