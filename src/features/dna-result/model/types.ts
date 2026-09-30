import type { ImageSourcePropType } from 'react-native';
import type { DnaDimension } from '../../../entities/scenario/model/decisionTypes';

export type DnaTraitScores = Record<DnaDimension, number>;

export type DnaResult = {
  archetype: {
    id: string;
    title: string;
    summary: string;
    portrait: ImageSourcePropType;
  };
  traits: DnaTraitScores;
  patterns: string[];
  blindSpot: {
    dimension: DnaDimension;
    title: string;
    question: string;
    description: string;
  };
};
