import type { ScenarioDecision } from '../../../entities/scenario/model/decisionTypes';

export const decisionFixture: ScenarioDecision = {
  id: 'demo-decision-1',
  triggerAtMs: 0,
  durationMs: 15_000,
  urgentAtMs: 4_000,
  revealedOptionId: 'option-1',
  feedbackTiming: {
    lockedMs: 350,
    revealedMs: 1_650,
  },
  options: [
    {
      id: 'option-1',
      label: 'Demo decision option with a longer explanation.',
      effects: { courage: 8, risk: 4 },
    },
    {
      id: 'option-2',
      label: 'Demo decision option',
      effects: { control: 7, ethics: 2 },
    },
    {
      id: 'option-3',
      label: 'Neutral placeholder option for the local demo.',
      effects: { vision: 5 },
    },
    {
      id: 'option-4',
      label: 'Another demo decision option',
      effects: { empathy: 6 },
    },
    {
      id: 'option-5',
      label: 'Final demo option',
      effects: { risk: -2, ethics: 4 },
    },
  ],
};
