jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

import React, { useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, Text, TextInput } from 'react-native';
import App from '../../../../App';
import CheckYourEmailScreen from '../CheckYourEmailScreen';
import CreateAccountScreen from '../CreateAccountScreen';
import EmailSignInScreen from '../EmailSignInScreen';
import ResetPasswordScreen from '../ResetPasswordScreen';
import AuthButton from '../components/AuthButton';
import BackButton from '../components/BackButton';
import FormField from '../components/FormField';
import { createdAccountFixture } from '../testing/fixtures';

test('email flow keeps password masked, gates submission, and returns to landing', async () => {
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
  const emailScreen = () => tree.root.findByType(EmailSignInScreen);
  const submit = () => emailScreen().findByType(AuthButton);
  const inputs = () => emailScreen().findAllByType(TextInput);
  expect(submit().props.disabled).toBe(true);
  expect(inputs()[1].props.secureTextEntry).toBe(true);
  await act(() => {
    inputs()[0].props.onChangeText('invalid');
    inputs()[1].props.onChangeText('x');
  });
  expect(
    emailScreen()
      .findAllByType(Text)
      .some(text => text.props.children === 'Please enter a valid email address.'),
  ).toBe(true);
  expect(submit().props.disabled).toBe(true);
  await act(() => {
    inputs()[0].props.onChangeText(createdAccountFixture.email);
  });
  expect(submit().props.disabled).toBe(false);
  await act(() => {
    inputs()[1].props.onChangeText('');
  });
  expect(submit().props.disabled).toBe(true);
  await act(() => {
    emailScreen().findByType(BackButton).props.onPress();
  });
  expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
  expect(tree.root.findAllByType(AuthButton)).toHaveLength(3);
  await act(() => {
    tree.root
      .findAllByType(AuthButton)
      .find(button => button.props.label === 'Continue with Email')!
      .props.onPress();
  });
  expect(
    tree.root.findByType(EmailSignInScreen).findAllByType(TextInput)
      .map(input => input.props.value),
  ).toEqual(['', '']);
  await act(() => {
    tree.unmount();
  });
});

test('filled auth fields retain their active border after blur', async () => {
  function ControlledField() {
    const [value, setValue] = useState('');
    return <FormField value={value} onChangeText={setValue} />;
  }

  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<ControlledField />);
  });

  const input = tree.root.findByType(TextInput);
  await act(() => {
    input.props.onFocus({});
    input.props.onChangeText('filled');
    input.props.onBlur({});
  });

  expect(StyleSheet.flatten(input.parent!.props.style).borderColor).toBe(
    '#00B8DB',
  );

  await act(() => {
    input.props.onChangeText('');
  });
  expect(StyleSheet.flatten(input.parent!.props.style).borderColor).toBe(
    'rgba(255, 255, 255, 0.05)',
  );
});

test('forgot password opens reset flow, validates email, and returns to sign in', async () => {
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

  await act(() => {
    tree.root.findByType(EmailSignInScreen).props.onForgotPassword();
  });
  expect(tree.root.findAllByType(ResetPasswordScreen)).toHaveLength(1);

  const resetScreen = () => tree.root.findByType(ResetPasswordScreen);
  const resetButton = () => resetScreen().findByType(AuthButton);
  const emailInput = () => resetScreen().findByType(TextInput);

  expect(resetButton().props.disabled).toBe(true);
  await act(() => emailInput().props.onChangeText('invalid'));
  expect(resetButton().props.disabled).toBe(true);
  await act(() =>
    emailInput().props.onChangeText(createdAccountFixture.email),
  );
  expect(resetButton().props.disabled).toBe(false);

  await act(() => {
    resetButton().props.onPress();
  });
  expect(tree.root.findByType(CheckYourEmailScreen).props.email).toBe(
    createdAccountFixture.email,
  );

  await act(() =>
    tree.root
      .findByType(CheckYourEmailScreen)
      .findByType(BackButton).props.onPress(),
  );
  expect(tree.root.findByType(ResetPasswordScreen)).toBeDefined();
  expect(emailInput().props.value).toBe(createdAccountFixture.email);

  await act(() => resetButton().props.onPress());
  await act(() => {
    tree.root
      .findByType(CheckYourEmailScreen)
      .findAllByType(AuthButton)
      .find(button => button.props.label === 'Back to Sign in')!
      .props.onPress();
  });
  expect(tree.root.findByType(EmailSignInScreen)).toBeDefined();

  await act(() => tree.unmount());
});

test('create account validates live requirements, toggles password, and returns to sign in', async () => {
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
  await act(() => {
    tree.root.findByType(EmailSignInScreen).props.onSignUp();
  });
  expect(tree.root.findByType(CreateAccountScreen)).toBeDefined();

  const createScreen = () => tree.root.findByType(CreateAccountScreen);
  const inputs = () => createScreen().findAllByType(TextInput);
  const submit = () =>
    createScreen()
      .findAllByType(AuthButton)
      .find(button => button.props.label === 'Sign up')!;

  await act(() => inputs()[2].props.onFocus({}));
  const lengthRequirement = () =>
    createScreen()
      .findAllByType(Text)
      .find(text => text.props.children === 'Must be at least 8 characters long')!;
  expect(StyleSheet.flatten(lengthRequirement().props.style).color).toBe(
    '#90A1B9',
  );

  await act(() => {
    inputs()[0].props.onChangeText('Jo');
    inputs()[1].props.onChangeText(createdAccountFixture.email);
    inputs()[2].props.onChangeText(createdAccountFixture.password);
  });
  expect(
    createScreen()
      .findAllByType(Text)
      .some(text => text.props.children === 'Enter at least 3 characters.'),
  ).toBe(true);
  expect(StyleSheet.flatten(lengthRequirement().props.style).color).toBe(
    '#FFFFFF',
  );
  expect(submit().props.disabled).toBe(true);

  const showPassword = createScreen()
    .findAll(node => node.props.accessibilityLabel === 'Show password')
    .at(0)!;
  await act(() => showPassword.props.onPress());
  expect(inputs()[2].props.secureTextEntry).toBe(false);

  await act(() =>
    inputs()[0].props.onChangeText(createdAccountFixture.fullName),
  );
  expect(submit().props.disabled).toBe(false);
  await act(() => submit().props.onPress());
  expect(tree.root.findByType(EmailSignInScreen)).toBeDefined();

  const signInScreen = () => tree.root.findByType(EmailSignInScreen);
  const signInInputs = () => signInScreen().findAllByType(TextInput);
  const signInButton = () => signInScreen().findByType(AuthButton);

  await act(() => {
    signInInputs()[0].props.onChangeText(createdAccountFixture.email);
    signInInputs()[1].props.onChangeText('wrong-password');
  });
  await act(() => signInButton().props.onPress());
  expect(
    signInScreen()
      .findAllByType(Text)
      .some(
        text =>
          text.props.children === 'Your password is wrong. Please try again.',
      ),
  ).toBe(true);
  expect(tree.root.findByType(EmailSignInScreen)).toBeDefined();

  await act(() => tree.unmount());
});
