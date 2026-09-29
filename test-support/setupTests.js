/* global jest */
jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');
  return {
    KeyboardProvider: ({ children }) => children,
    KeyboardAwareScrollView: React.forwardRef((props, ref) =>
      React.createElement(ScrollView, { ...props, ref }),
    ),
    useKeyboardHandler: jest.fn(),
  };
});

jest.mock('react-native-orientation-locker', () => ({
  lockToPortrait: jest.fn(),
  lockToLandscape: jest.fn(),
}));

jest.mock('react-native-video', () => ({
  __esModule: true,
  default: 'Video',
  ViewType: { TEXTURE: 0 },
}));
