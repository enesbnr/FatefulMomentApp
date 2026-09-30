import { createContext, type ReactNode, useContext } from 'react';
import AsyncStorageScenarioProgressRepository from '../../entities/scenario-progress/data/AsyncStorageScenarioProgressRepository';
import type { ScenarioProgressRepository } from '../../entities/scenario-progress/repository/ScenarioProgressRepository';

const defaultRepository = new AsyncStorageScenarioProgressRepository();
const ScenarioProgressRepositoryContext =
  createContext<ScenarioProgressRepository>(defaultRepository);

export function ScenarioProgressProvider({
  children,
  repository = defaultRepository,
}: {
  children: ReactNode;
  repository?: ScenarioProgressRepository;
}) {
  return (
    <ScenarioProgressRepositoryContext.Provider value={repository}>
      {children}
    </ScenarioProgressRepositoryContext.Provider>
  );
}

export const useScenarioProgressRepository = () =>
  useContext(ScenarioProgressRepositoryContext);
