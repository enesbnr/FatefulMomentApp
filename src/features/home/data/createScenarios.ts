import { getScenarios } from '../../../entities/scenario/selectors/scenarioSelectors';
import type { HomeScenario, HomeVisualState } from '../types';

// Internal reference switch; no progression or interaction semantics.
export const HOME_DEMO_STATE: HomeVisualState = 'normal';

export function createScenarios(
  state: HomeVisualState,
  completedScenarioIds: ReadonlySet<string> = new Set(),
): HomeScenario[] {
  const homeScenarios = getScenarios().map((scenario, index) => {
    const enabled = index < 15;
    const completed = completedScenarioIds.has(scenario.id);

    return {
      ...scenario,
      // Demo: the first fifteen cards share one bundled asset, but each owns a
      // separate player. Every preview starts at zero, matching the expected
      // behavior when the API later supplies a different URL for each card.
      homePreview: {
        ...scenario.homePreview,
        video:
          enabled && !completed ? scenario.homePreview.video : undefined,
      },
      completed,
      disabled: !enabled || completed,
      previewEnabled: enabled && !completed,
      previewStartAtSeconds: 0,
      dimmed: completed || !enabled || (state === 'dimmed' && index > 0),
    };
  });

  return homeScenarios.sort(
    (first, second) => Number(first.completed) - Number(second.completed),
  );
}
