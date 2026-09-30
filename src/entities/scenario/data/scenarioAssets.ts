import type {
  ScenarioPreviewMedia,
  ScenarioSimulationMedia,
} from '../model/types';

const iraqWarVideo = require('../../../../assets/scenarios/iraq-war/scenario-video.mp4');

export const sharedHomePreview: ScenarioPreviewMedia = {
  poster: require('../../../../assets/scenarios/iraq-war/poster.jpg'),
  fallback: require('../../../../assets/scenarios/shared/scenario-placeholder.png'),
  video: iraqWarVideo,
};

export const sharedSimulationMedia: ScenarioSimulationMedia = {
  background: require('../../../../assets/scenarios/iraq-war/briefing-background.png'),
  video: iraqWarVideo,
};
