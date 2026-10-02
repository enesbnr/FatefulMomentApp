import { createContext, type ReactNode, useContext } from 'react';
import AsyncStorageScenarioProgressRepository from '../../entities/scenario-progress/data/AsyncStorageScenarioProgressRepository';
import type { ScenarioProgressRepository } from '../../entities/scenario-progress/repository/ScenarioProgressRepository';

const defaultRepository = new AsyncStorageScenarioProgressRepository();
const ScenarioProgressRepositoryContext =
  createContext<ScenarioProgressRepository | null>(null);

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

export function useScenarioProgressRepository() {
  const repository = useContext(ScenarioProgressRepositoryContext);

  if (!repository) {
    throw new Error(
      'useScenarioProgressRepository must be used within ScenarioProgressProvider',
    );
  }

  return repository;
}
