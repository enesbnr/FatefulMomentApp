const fs = require('fs');
const path = require('path');

const orientationModule = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-orientation-locker',
  'ios',
  'RCTOrientation',
  'Orientation.m',
);

if (!fs.existsSync(orientationModule)) {
  process.exit(0);
}

const source = fs.readFileSync(orientationModule, 'utf8');
const patched = source
  .replace('        [self addListener:@"orientationDidChange"];\n', '')
  .replace('    [self removeListeners:1];\n', '');

if (patched !== source) {
  fs.writeFileSync(orientationModule, patched);
}
