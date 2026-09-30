const SCENARIO_PROGRESS_PREFIX = 'scenario-progress';

export const getScenarioProgressStorageKey = (scenarioId: string) =>
  `${SCENARIO_PROGRESS_PREFIX}:${scenarioId}`;
