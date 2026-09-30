/* global jest */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(key => Promise.resolve(storage.get(key) ?? null)),
      setItem: jest.fn((key, value) => {
        storage.set(key, value);
        return Promise.resolve();
      }),
      removeItem: jest.fn(key => {
        storage.delete(key);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        storage.clear();
        return Promise.resolve();
      }),
    },
  };
});

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
  getOrientation: jest.fn(callback => callback('LANDSCAPE-RIGHT')),
  addOrientationListener: jest.fn(),
  removeOrientationListener: jest.fn(),
  getDeviceOrientation: jest.fn(callback => callback('LANDSCAPE-RIGHT')),
  addDeviceOrientationListener: jest.fn(),
  removeDeviceOrientationListener: jest.fn(),
}));

jest.mock('react-native-video', () => ({
  __esModule: true,
  default: 'Video',
  ViewType: { TEXTURE: 0 },
}));
