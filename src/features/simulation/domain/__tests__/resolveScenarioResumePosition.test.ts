import { iraqWarDecisions } from '../../../../entities/scenario/data/iraqWarDecisions';
import resolveScenarioResumePosition from '../resolveScenarioResumePosition';

test('starts at zero when no decision has been completed', () => {
  expect(resolveScenarioResumePosition(iraqWarDecisions, [], 97)).toBe(0);
});

test('resumes just after the latest completed decision', () => {
  expect(
    resolveScenarioResumePosition(
      iraqWarDecisions,
      [
        {
          decisionId: iraqWarDecisions[0].id,
          optionId: iraqWarDecisions[0].options[0].id,
        },
        {
          decisionId: iraqWarDecisions[1].id,
          optionId: null,
        },
      ],
      97,
    ),
  ).toBe(53.55);
});

test('ignores unknown answers and clamps the checkpoint inside the video', () => {
  expect(
    resolveScenarioResumePosition(
      iraqWarDecisions,
      [
        { decisionId: 'unknown', optionId: null },
        {
          decisionId: iraqWarDecisions[2].id,
          optionId: iraqWarDecisions[2].options[0].id,
        },
      ],
      70,
    ),
  ).toBe(69);
});
