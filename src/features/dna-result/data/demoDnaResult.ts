import type { DnaResult } from '../model/types';

export const demoDnaResult: DnaResult = {
  archetype: {
    id: 'brave-visionary',
    title: 'Brave Visionary',
    summary:
      "You see the big picture and walk towards it - no matter the cost. This sometimes takes a back seat, but few surpass you in the courage to take action.",
    portrait: require('../../../../assets/dna-result/portraits/brave-visionary.png'),
  },
  traits: {
    vision: 88,
    courage: 82,
    risk: 79,
    control: 55,
    empathy: 38,
    ethics: 31,
  },
  patterns: [
    'You are not afraid to take action under pressure. While others hesitate, you have already taken a step. This positions you as a natural leader in crisis moments.',
    'You prioritize long-term impact over short-term costs. You see the big picture — but this sometimes makes it difficult for you to see the people in front of you.',
    'When ethics conflict with interests, your tendency is clear: you choose the interest. This pattern repeated in 5 out of 8 scenarios. It works in the short term — but creates erosion of trust in the long term.',
  ],
  blindSpot: {
    dimension: 'ethics',
    title: 'Blind Spot - Ethics',
    question: 'How much will you pay to win?',
    description:
      'Your vision and courage are strong — but your ethics score is your lowest dimension. While reaching big goals, you often overlook how those around you feel and what they sacrifice. Your leadership capacity is high, but the mark you leave is not always positive.',
  },
};
