jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import App from '../../../App';
import EmailSignInScreen from '../../features/auth/EmailSignInScreen';
import AuthButton from '../../features/auth/components/AuthButton';
import HomeScreen from '../../features/home/HomeScreen';

test('demo credentials enter Home and returning restores portrait auth', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<App />);
  });
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

  const home = tree.root.findByType(HomeScreen);
  expect(Orientation.lockToLandscape).toHaveBeenCalled();

  jest.mocked(Orientation.lockToPortrait).mockClear();
  await act(() => home.props.onBack());
  expect(tree.root.findByType(EmailSignInScreen)).toBeDefined();
  expect(Orientation.lockToPortrait).toHaveBeenCalled();

  await act(() => tree.unmount());
});
