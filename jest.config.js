module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/test-support/setupTests.js'],
  moduleNameMapper: { '\\.svg$': '<rootDir>/test-support/svgMock.js' },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context)/)',
  ],
};
