import type { ImageSourcePropType } from 'react-native';
import type { ReactVideoProps } from 'react-native-video';

export type ScenarioMediaSource = {
  poster: ImageSourcePropType;
  fallback: ImageSourcePropType;
  video?: ReactVideoProps['source'];
};
export type Scenario = {
  id: string;
  title: string;
  description: string;
  duration: string;
  dimmed: boolean;
  media: ScenarioMediaSource;
};
export type HomeVisualState = 'normal' | 'dimmed';
