import { getScenarioById } from '../../../../entities/scenario/selectors/scenarioSelectors';
import calculateDnaTraitScores from '../calculateDnaTraitScores';

const scenario = getScenarioById('scenario-1')!;

test('applies selected option effects to the neutral baseline', () => {
  expect(
    calculateDnaTraitScores(scenario, [
      {
        decisionId: 'iraq-war-decision-1',
        optionId: 'iraq-war-decision-1-option-1',
      },
      {
        decisionId: 'iraq-war-decision-2',
        optionId: 'iraq-war-decision-2-option-2',
      },
      {
        decisionId: 'iraq-war-decision-3',
        optionId: 'iraq-war-decision-3-option-2',
      },
    ]),
  ).toEqual({
    vision: 64,
    courage: 62,
    risk: 46,
    control: 50,
    empathy: 76,
    ethics: 70,
  });
});

test('ignores unanswered, unknown and duplicate persisted answers', () => {
  expect(
    calculateDnaTraitScores(scenario, [
      { decisionId: 'iraq-war-decision-1', optionId: null },
      { decisionId: 'unknown-decision', optionId: 'unknown-option' },
      {
        decisionId: 'iraq-war-decision-2',
        optionId: 'iraq-war-decision-2-option-3',
      },
      {
        decisionId: 'iraq-war-decision-2',
        optionId: 'iraq-war-decision-2-option-4',
      },
    ]),
  ).toEqual({
    vision: 62,
    courage: 50,
    risk: 50,
    control: 56,
    empathy: 50,
    ethics: 58,
  });
});
