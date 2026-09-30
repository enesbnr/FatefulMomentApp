import type { ImageSourcePropType } from 'react-native';
import type { ReactVideoProps } from 'react-native-video';
import type { ScenarioDecision } from './decisionTypes';

export type ScenarioPreviewMedia = {
  poster: ImageSourcePropType;
  fallback: ImageSourcePropType;
  video?: ReactVideoProps['source'];
};

export type ScenarioSimulationMedia = {
  background: ImageSourcePropType;
  video?: ReactVideoProps['source'];
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  duration: string;
  homePreview: ScenarioPreviewMedia;
  simulation: ScenarioSimulationMedia;
  decisions: ScenarioDecision[];
};
