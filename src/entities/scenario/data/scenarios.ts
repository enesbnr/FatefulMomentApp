import type { Scenario } from '../model/types';
import { iraqWarDecisions } from './iraqWarDecisions';
import { sharedHomePreview, sharedSimulationMedia } from './scenarioAssets';

const readableScenarios = [
  {
    title: 'Iraq War',
    description:
      '2003. The Chemical Weapon Allegations Are On Your Desk. Your Decision Will Determine The Fate Of Millions.',
    duration: '1:37 min',
  },
  {
    title: 'Cuban Missile Crisis (1962)',
    description:
      "A World On The Brink Of Nuclear Annihilation. You Are In Kennedy's Seat.",
    duration: '1:25 min',
  },
];

export const scenarios: Scenario[] = Array.from({ length: 30 }, (_, index) => ({
  id: `scenario-${index + 1}`,
  ...(index < readableScenarios.length
    ? readableScenarios[index]
    : {
        title: `Demo Scenario ${index + 1}`,
        description: 'Placeholder scenario description for this local demo.',
        duration: '0:00 min',
      }),
  homePreview: sharedHomePreview,
  simulation: sharedSimulationMedia,
  decisions: index < 15 ? iraqWarDecisions : [],
}));
