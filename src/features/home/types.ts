import type { Scenario } from '../../entities/scenario/model/types';

export type HomeScenario = Scenario & {
  completed: boolean;
  locked: boolean;
  dimmed: boolean;
  disabled: boolean;
  previewEnabled: boolean;
  previewStartAtSeconds: number;
};

export type HomeVisualState = 'normal' | 'dimmed';
