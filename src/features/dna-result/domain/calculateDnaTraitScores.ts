import {
  dnaDimensions,
  type DnaDimension,
} from '../../../entities/scenario/model/decisionTypes';
import type { Scenario } from '../../../entities/scenario/model/types';
import type { DecisionAnswer } from '../../../entities/scenario-progress/model/types';
import type { DnaTraitScores } from '../model/types';

export const BASE_DNA_SCORE = 50;

const clampScore = (score: number) => Math.min(100, Math.max(0, score));

export default function calculateDnaTraitScores(
  scenario: Scenario,
  answers: DecisionAnswer[],
): DnaTraitScores {
  const scores = Object.fromEntries(
    dnaDimensions.map(dimension => [dimension, BASE_DNA_SCORE]),
  ) as DnaTraitScores;
  const answerByDecisionId = new Map(
    answers.map(answer => [answer.decisionId, answer]),
  );

  scenario.decisions.forEach(decision => {
    const optionId = answerByDecisionId.get(decision.id)?.optionId;
    if (!optionId) {
      return;
    }

    const option = decision.options.find(
      candidate => candidate.id === optionId,
    );
    if (!option) {
      return;
    }

    Object.entries(option.effects).forEach(([dimension, effect]) => {
      const trait = dimension as DnaDimension;
      scores[trait] = clampScore(scores[trait] + effect);
    });
  });

  return scores;
}
