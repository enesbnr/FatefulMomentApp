import { getScenarios } from '../../../entities/scenario/selectors/scenarioSelectors';
import type { HomeScenario, HomeVisualState } from '../types';

// Internal reference switch; no progression or interaction semantics.
export const HOME_DEMO_STATE: HomeVisualState = 'normal';

export function createScenarios(state: HomeVisualState): HomeScenario[] {
  return getScenarios().map((scenario, index) => ({
    ...scenario,
    dimmed: state === 'dimmed' && index > 0,
  }));
}
