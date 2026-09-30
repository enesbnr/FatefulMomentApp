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
  }: {
    onAccountCreated: (account: {
      fullName: string;
      email: string;
      password: string;
    }) => void;
  }) {
    React.useEffect(() => {
      mockAuthNavigatorMounted();
      return mockAuthNavigatorUnmounted;
    }, []);

    return (
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
    );
  };
});

import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import RootNavigator from '../RootNavigator';

test('keeps the auth navigator mounted when the account state changes', async () => {
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
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
