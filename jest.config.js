module.exports = {
  preset: '@react-native/jest-preset',
  resolver: 'react-native-reanimated/jest/resolver',
  setupFiles: ['<rootDir>/test-support/setupTests.js'],
  moduleNameMapper: { '\\.svg$': '<rootDir>/test-support/svgMock.js' },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-drawer-layout|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-worklets)/)',
  ],
};
