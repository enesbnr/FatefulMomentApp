import type { ScenarioProgress } from '../model/types';
import type { ScenarioProgressRepository } from '../repository/ScenarioProgressRepository';

const cloneScenarioProgress = (
  progress: ScenarioProgress,
): ScenarioProgress => ({
  ...progress,
  answers: progress.answers.map(answer => ({ ...answer })),
});

export default class MemoryScenarioProgressRepository
  implements ScenarioProgressRepository
{
  private readonly progressByScenarioId = new Map<string, ScenarioProgress>();

  get(scenarioId: string): Promise<ScenarioProgress | null> {
    const progress = this.progressByScenarioId.get(scenarioId);
    return Promise.resolve(progress ? cloneScenarioProgress(progress) : null);
  }

  save(progress: ScenarioProgress): Promise<void> {
    this.progressByScenarioId.set(
      progress.scenarioId,
      cloneScenarioProgress(progress),
    );
    return Promise.resolve();
  }

  remove(scenarioId: string): Promise<void> {
    this.progressByScenarioId.delete(scenarioId);
    return Promise.resolve();
  }
}
