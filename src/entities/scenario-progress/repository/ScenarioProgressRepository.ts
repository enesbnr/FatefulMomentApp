import type { ScenarioProgress } from '../model/types';

export interface ScenarioProgressRepository {
  get(scenarioId: string): Promise<ScenarioProgress | null>;
  save(progress: ScenarioProgress): Promise<void>;
  remove(scenarioId: string): Promise<void>;
}
