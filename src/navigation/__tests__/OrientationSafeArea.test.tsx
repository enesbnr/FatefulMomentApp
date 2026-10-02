let mockInsets = { top: 47, right: 0, bottom: 34, left: 0 };
const mockInsetListeners = new Set<() => void>();

function mockSetInsets(nextInsets: typeof mockInsets) {
  mockInsets = nextInsets;
  mockInsetListeners.forEach(listener => listener());
}

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const safeAreaMock = require('react-native-safe-area-context/jest/mock').default;

  return {
    ...safeAreaMock,
    useSafeAreaInsets: () =>
      React.useSyncExternalStore(
        (listener: () => void) => {
          mockInsetListeners.add(listener);
          return () => mockInsetListeners.delete(listener);
        },
        () => mockInsets,
        () => mockInsets,
      ),
  };
});

import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { FlatList, StyleSheet, TextInput } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import type { OrientationType } from 'react-native-orientation-locker';
import App from '../../../App';
import EmailSignInScreen from '../../features/auth/EmailSignInScreen';
import AuthButton from '../../features/auth/components/AuthButton';

test('recalculates gameplay layout when safe-area insets change after landscape lock', async () => {
  let currentOrientation = 'LANDSCAPE-RIGHT' as OrientationType;
  jest.mocked(Orientation.getOrientation).mockImplementation(callback =>
    callback(currentOrientation),
  );
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<App />);
  });

  expect(Orientation.lockToPortrait).toHaveBeenCalled();

  await act(() => {
    tree.root
      .findAllByType(AuthButton)
      .find(button => button.props.label === 'Continue with Email')!
      .props.onPress();
  });

  const signInScreen = tree.root.findByType(EmailSignInScreen);
  const inputs = signInScreen.findAllByType(TextInput);
  await act(() => {
    inputs[0].props.onChangeText('test@test.com');
    inputs[1].props.onChangeText('ABcd1234');
  });
  await act(() => signInScreen.findByType(AuthButton).props.onPress());

  expect(Orientation.lockToLandscape).toHaveBeenCalled();

  const orientationListener = jest.mocked(
    Orientation.addOrientationListener,
  ).mock.calls.at(-1)?.[0];
  expect(orientationListener).toBeDefined();

  await act(() => {
    currentOrientation = 'LANDSCAPE-LEFT' as OrientationType;
    orientationListener!(currentOrientation);
    mockSetInsets({ top: 0, right: 16, bottom: 21, left: 59 });
  });

  const leftObstructedContent = StyleSheet.flatten(
    tree.root.findByType(FlatList).props.contentContainerStyle,
  );
  expect(leftObstructedContent.paddingLeft).toBe(75);
  expect(leftObstructedContent.paddingRight).toBe(32);

  await act(() => {
    currentOrientation = 'LANDSCAPE-RIGHT' as OrientationType;
    orientationListener!(currentOrientation);
    mockSetInsets({ top: 0, right: 59, bottom: 21, left: 16 });
  });

  const rightObstructedContent = StyleSheet.flatten(
    tree.root.findByType(FlatList).props.contentContainerStyle,
  );
  expect(rightObstructedContent.paddingLeft).toBe(66);
  expect(rightObstructedContent.paddingRight).toBe(75);
  expect(Orientation.getOrientation).toHaveBeenCalledTimes(3);

  await act(() => tree.unmount());
});
