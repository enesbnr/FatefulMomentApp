jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import CheckYourEmailScreen from '../CheckYourEmailScreen';
import AuthHeader from '../components/AuthHeader';
import AuthButton from '../components/AuthButton';
import FormField from '../components/FormField';
import {
  getContentTopSpacing,
  referencePosition,
} from '../../../theme/authLanding';

test('auth logo keeps the same screen position with a large top inset', () => {
  const dynamicIslandInset = 59;

  expect(
    dynamicIslandInset + getContentTopSpacing(dynamicIslandInset),
  ).toBe(referencePosition.headerTop);
});

test('auth header uses the shared 327-point Figma text width', async () => {
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <AuthHeader subtitle="Sign in to continue your journey" />,
    );
  });

  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'auth-header-text-group' }).props.style,
    ),
  ).toMatchObject({ width: '100%', maxWidth: 327, marginTop: 36, gap: 8 });

  await act(() => tree.unmount());

  await act(() => {
    tree = Renderer.create(
      <AuthHeader title="Create your Fateful Moment Account" />,
    );
  });

  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'auth-header-text-group' }).props.style,
    ).maxWidth,
  ).toBe(327);

  await act(() => tree.unmount());
});

test('long email content can wrap without a fixed-height container', async () => {
  const longEmail = `${'very-long-address'.repeat(8)}@example.com`;
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <CheckYourEmailScreen
        email={longEmail}
        onBack={jest.fn()}
        onBackToSignIn={jest.fn()}
      />,
    );
  });

  const email = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === longEmail)!;
  const description = email.parent!;
  const descriptionStyle = StyleSheet.flatten(description.props.style);
  expect(descriptionStyle.height).toBeUndefined();
  expect(StyleSheet.flatten(email.props.style).flexShrink).toBe(1);
  expect(email.props.allowFontScaling).not.toBe(false);

  await act(() => tree.unmount());
});

test('auth controls can grow with large text and remain scrollable on short landscape screens', async () => {
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <CheckYourEmailScreen
        email="person@example.com"
        onBack={jest.fn()}
        onBackToSignIn={jest.fn()}
      />,
    );
  });

  const scrollView = tree.root.findByType(ScrollView);
  expect(
    StyleSheet.flatten(scrollView.props.contentContainerStyle),
  ).toMatchObject({ flexGrow: 1 });

  const button = tree.root.findByType(AuthButton);
  const renderedButton = button.findByProps({ accessibilityRole: 'button' });
  expect(StyleSheet.flatten(renderedButton.props.style)).toMatchObject({
    minHeight: 56,
  });

  await act(() => tree.unmount());

  await act(() => {
    tree = Renderer.create(
      <FormField value="person@example.com" onChangeText={jest.fn()} />,
    );
  });
  const inputContainer = tree.root.findByProps({ accessible: false });
  expect(StyleSheet.flatten(inputContainer.props.style)).toMatchObject({
    minHeight: 56,
  });
  expect(StyleSheet.flatten(inputContainer.props.style).height).toBeUndefined();

  await act(() => tree.unmount());
});
