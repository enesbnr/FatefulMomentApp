import type {
  DecisionFeedbackTiming,
  DecisionOption,
  ScenarioDecision,
} from '../model/decisionTypes';

const defaultFeedbackTiming: DecisionFeedbackTiming = {
  lockedMs: 350,
  revealedMs: 1_650,
};

const createDemoOptions = (
  decisionId: string,
  effects: DecisionOption['effects'][],
): DecisionOption[] =>
  effects.map((optionEffects, index) => ({
    id: `${decisionId}-option-${index + 1}`,
    label: `Demo Option ${index + 1}`,
    effects: optionEffects,
  }));

export const iraqWarDecisions: ScenarioDecision[] = [
  {
    id: 'iraq-war-decision-1',
    triggerAtMs: 26_000,
    durationMs: 15_000,
    urgentAtMs: 4_000,
    revealedOptionId: 'iraq-war-decision-1-option-1',
    feedbackTiming: defaultFeedbackTiming,
    options: createDemoOptions('iraq-war-decision-1', [
      { vision: 14, courage: 12, risk: 10, ethics: -8 },
      { control: 16, ethics: 12, risk: -8 },
      { empathy: 16, ethics: 14, courage: -4 },
      { risk: 18, courage: 12, control: -6 },
      { vision: 10, empathy: 8, control: 6 },
    ]),
  },
  {
    id: 'iraq-war-decision-2',
    triggerAtMs: 53_300,
    durationMs: 13_000,
    urgentAtMs: 4_000,
    revealedOptionId: 'iraq-war-decision-2-option-1',
    feedbackTiming: defaultFeedbackTiming,
    options: createDemoOptions('iraq-war-decision-2', [
      { control: 14, vision: 8, empathy: -8 },
      { empathy: 14, ethics: 12, risk: -6 },
      { courage: 16, risk: 12, ethics: -8 },
      { vision: 12, ethics: 8, control: 6 },
      { empathy: 10, courage: 8, risk: -4 },
    ]),
  },
  {
    id: 'iraq-war-decision-3',
    triggerAtMs: 76_500,
    durationMs: 10_000,
    urgentAtMs: 4_000,
    revealedOptionId: 'iraq-war-decision-3-option-1',
    feedbackTiming: defaultFeedbackTiming,
    options: createDemoOptions('iraq-war-decision-3', [
      { vision: 16, courage: 10, control: 8 },
      { ethics: 16, empathy: 12, risk: -8 },
      { risk: 16, courage: 14, empathy: -6 },
      { control: 14, ethics: 10, vision: 6 },
      { empathy: 16, vision: 8, courage: -4 },
    ]),
  },
];
