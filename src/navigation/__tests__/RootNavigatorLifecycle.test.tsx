jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

const mockAuthNavigatorMounted = jest.fn();
const mockAuthNavigatorUnmounted = jest.fn();

jest.mock('../AuthNavigator', () => {
  const React = require('react');
  const { Pressable } = require('react-native');

  return function MockAuthNavigator({
    onAccountCreated,
    onAuthenticated,
  }: {
    onAccountCreated: (account: {
      fullName: string;
      email: string;
      password: string;
    }) => void;
    onAuthenticated: () => Promise<void>;
  }) {
    React.useEffect(() => {
      mockAuthNavigatorMounted();
      return mockAuthNavigatorUnmounted;
    }, []);

    return (
      <>
        <Pressable
          testID="update-auth-account"
          onPress={() =>
            onAccountCreated({
              fullName: 'Updated User',
              email: 'updated@example.com',
              password: 'ABcd1234',
            })
          }
        />
        <Pressable testID="authenticate" onPress={onAuthenticated} />
      </>
    );
  };
});

jest.mock('../GameplayNavigator', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockGameplayNavigator() {
    return <View testID="gameplay" />;
  };
});

import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import RootNavigator from '../RootNavigator';

beforeEach(() => jest.clearAllMocks());

test('keeps the auth navigator mounted when the account state changes', async () => {
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(<RootNavigator />);
  });

  expect(mockAuthNavigatorMounted).toHaveBeenCalledTimes(1);

  await act(() => {
    tree.root.findByProps({ testID: 'update-auth-account' }).props.onPress();
  });

  expect(mockAuthNavigatorMounted).toHaveBeenCalledTimes(1);
  expect(mockAuthNavigatorUnmounted).not.toHaveBeenCalled();

  await act(() => tree.unmount());
  expect(mockAuthNavigatorUnmounted).toHaveBeenCalledTimes(1);
});

test('keeps dummy authentication in memory and starts at auth on relaunch', async () => {
  let tree!: Renderer.ReactTestRenderer;

  await act(async () => {
    tree = Renderer.create(<RootNavigator />);
  });
  expect(tree.root.findAllByProps({ testID: 'gameplay' })).toHaveLength(0);

  await act(async () => {
    await tree.root.findByProps({ testID: 'authenticate' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'gameplay' })).toBeDefined();

  await act(() => tree.unmount());

  await act(async () => {
    tree = Renderer.create(<RootNavigator />);
  });

  expect(tree.root.findByProps({ testID: 'authenticate' })).toBeDefined();
  expect(tree.root.findAllByProps({ testID: 'gameplay' })).toHaveLength(0);

  await act(() => tree.unmount());
});
