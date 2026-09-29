import type { HomeVisualState, Scenario, ScenarioMediaSource } from './types';

// Internal reference switch; no progression or interaction semantics.
export const HOME_DEMO_STATE: HomeVisualState = 'normal';
export const sharedMedia: ScenarioMediaSource = {
  poster: require('../../../../assets/scenarios/home/scenario-image.jpg'),
  fallback: require('../../../../assets/scenarios/home/scenario-placeholder.png'),
  video: require('../../../../assets/scenarios/home/scenario-preview.mp4'),
};
const readableScenarios = [
  {
    title: 'Iraq War',
    description: '2003. The Chemical Weapon Allegations Are On Your Desk. Your Decision Will Determine The Fate Of Millions.',
    duration: '1:37 min',
  },
  {
    title: 'Cuban Missile Crisis (1962)',
    description: "A World On The Brink Of Nuclear Annihilation. You Are In Kennedy's Seat.",
    duration: '1:25 min',
  },
];
export function createScenarios(state: HomeVisualState): Scenario[] {
  return Array.from({ length: 30 }, (_, index) => ({
    id: `scenario-${index + 1}`,
    ...(index < 2 ? readableScenarios[index] : {
      title: `Demo Scenario ${index + 1}`,
      description: 'Placeholder scenario description for this local demo.',
      duration: '0:00 min',
    }),
    dimmed: state === 'dimmed' && index > 0,
    media: sharedMedia,
  }));
}
