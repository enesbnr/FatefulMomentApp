import type { Scenario } from '../../entities/scenario/model/types';

export type HomeScenario = Scenario & {
  dimmed: boolean;
};

export type HomeVisualState = 'normal' | 'dimmed';
