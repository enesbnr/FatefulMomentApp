export const dnaDimensions = [
  'vision',
  'courage',
  'risk',
  'control',
  'empathy',
  'ethics',
] as const;

export type DnaDimension = (typeof dnaDimensions)[number];

export type DnaEffects = Partial<Record<DnaDimension, number>>;

export type DecisionOption = {
  id: string;
  label: string;
  effects: DnaEffects;
};

export type DecisionFeedbackTiming = {
  lockedMs: number;
  revealedMs: number;
};

export type ScenarioDecision = {
  id: string;
  triggerAtMs: number;
  durationMs: number;
  urgentAtMs: number;
  revealedOptionId?: DecisionOption['id'];
  feedbackTiming: DecisionFeedbackTiming;
  options: DecisionOption[];
};
