import { scenarios } from '../data/scenarios';

export function getScenarios() {
  return scenarios;
}

export function getScenarioById(scenarioId: string) {
  return scenarios.find(scenario => scenario.id === scenarioId);
}
