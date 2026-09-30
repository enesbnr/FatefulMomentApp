import type { ScenarioProgress } from '../model/types';
import type { ScenarioProgressRepository } from '../repository/ScenarioProgressRepository';

export default class MemoryScenarioProgressRepository
  implements ScenarioProgressRepository
{
  private readonly progressByScenarioId = new Map<string, ScenarioProgress>();

  get(scenarioId: string): Promise<ScenarioProgress | null> {
    return Promise.resolve(this.progressByScenarioId.get(scenarioId) ?? null);
  }

  save(progress: ScenarioProgress): Promise<void> {
    this.progressByScenarioId.set(progress.scenarioId, {
      ...progress,
      completedDecisionIds: [...progress.completedDecisionIds],
      answers: progress.answers.map(answer => ({ ...answer })),
    });
    return Promise.resolve();
  }

  remove(scenarioId: string): Promise<void> {
    this.progressByScenarioId.delete(scenarioId);
    return Promise.resolve();
  }
}
