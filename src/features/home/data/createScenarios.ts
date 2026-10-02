import { getScenarios } from '../../../entities/scenario/selectors/scenarioSelectors';
import type { HomeScenario, HomeVisualState } from '../types';

const PLAYABLE_SCENARIO_COUNT = 15;

// Internal reference switch for comparing the supplied visual states.
export const HOME_DEMO_STATE: HomeVisualState = 'normal';

export function createScenarios(
  state: HomeVisualState,
  completedScenarioIds: ReadonlySet<string> = new Set(),
): HomeScenario[] {
  const scenarios = getScenarios();
  const nextAvailableIndex = scenarios
    .slice(0, PLAYABLE_SCENARIO_COUNT)
    .findIndex(scenario => !completedScenarioIds.has(scenario.id));

  return scenarios.map((scenario, index) => {
    const previewAvailable = index < PLAYABLE_SCENARIO_COUNT;
    const completed = completedScenarioIds.has(scenario.id);
    const available = completed || index === nextAvailableIndex;
    const locked = !available;

    return {
      ...scenario,
      // Demo: the first fifteen cards share one bundled asset, but each owns a
      // separate player. Every preview starts at zero, matching the expected
      // behavior when the API later supplies a different URL for each card.
      homePreview: {
        ...scenario.homePreview,
        video:
          previewAvailable ? scenario.homePreview.video : undefined,
      },
      completed,
      locked,
      disabled: !available,
      previewEnabled: previewAvailable,
      previewStartAtSeconds: 0,
      dimmed:
        locked || (state === 'dimmed' && index > 0),
    };
  });
}
