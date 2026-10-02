import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import MemoryScenarioProgressRepository from '../../../entities/scenario-progress/testing/MemoryScenarioProgressRepository';
import {
  ScenarioProgressProvider,
  useScenarioProgressRepository,
} from '../ScenarioProgressProvider';

function RepositoryConsumer({
  onRepository,
}: {
  onRepository: ReturnType<typeof jest.fn>;
}) {
  onRepository(useScenarioProgressRepository());
  return null;
}

test('provides the explicitly supplied repository', async () => {
  const repository = new MemoryScenarioProgressRepository();
  const onRepository = jest.fn();
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <ScenarioProgressProvider repository={repository}>
        <RepositoryConsumer onRepository={onRepository} />
      </ScenarioProgressProvider>,
    );
  });

  expect(onRepository).toHaveBeenCalledWith(repository);
  await act(() => tree.unmount());
});

test('fails clearly when the provider is missing', () => {
  const onRepository = jest.fn();

  expect(() => {
    act(() => {
      Renderer.create(<RepositoryConsumer onRepository={onRepository} />);
    });
  }).toThrow(
    'useScenarioProgressRepository must be used within ScenarioProgressProvider',
  );
});
