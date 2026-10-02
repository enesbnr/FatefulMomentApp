import type { OrientationType } from 'react-native-orientation-locker';
import {
  preserveLandscapeInterfaceOrientation,
  resolveLandscapeObstructionSide,
} from '../useLandscapeObstructionSide';

const landscapeLeft = 'LANDSCAPE-LEFT' as OrientationType;
const landscapeRight = 'LANDSCAPE-RIGHT' as OrientationType;

describe('resolveLandscapeObstructionSide', () => {
  test('uses the safe-area side when horizontal insets are asymmetric', () => {
    expect(
      resolveLandscapeObstructionSide(
        { left: 59, right: 16 },
        landscapeRight,
      ),
    ).toBe('left');
    expect(
      resolveLandscapeObstructionSide(
        { left: 16, right: 59 },
        landscapeLeft,
      ),
    ).toBe('right');
  });

  test('uses interface orientation when landscape insets are symmetric', () => {
    expect(
      resolveLandscapeObstructionSide(
        { left: 59, right: 59 },
        landscapeLeft,
      ),
    ).toBe('left');
    expect(
      resolveLandscapeObstructionSide(
        { left: 59, right: 59 },
        landscapeRight,
      ),
    ).toBe('right');
  });

  test('does not invent an obstruction when horizontal insets are small and equal', () => {
    expect(
      resolveLandscapeObstructionSide(
        { left: 0, right: 0 },
        landscapeLeft,
      ),
    ).toBeNull();
    expect(
      resolveLandscapeObstructionSide(
        { left: 16, right: 16 },
        landscapeRight,
      ),
    ).toBeNull();
  });
});

describe('preserveLandscapeInterfaceOrientation', () => {
  test('keeps the last landscape side for flat and transient device states', () => {
    const transientOrientations = [
      'FACE-UP',
      'FACE-DOWN',
      'UNKNOWN',
      'PORTRAIT',
    ] as OrientationType[];

    transientOrientations.forEach(orientation => {
      expect(
        preserveLandscapeInterfaceOrientation(landscapeLeft, orientation),
      ).toBe(landscapeLeft);
    });
  });

  test('accepts a new valid landscape side', () => {
    expect(
      preserveLandscapeInterfaceOrientation(landscapeLeft, landscapeRight),
    ).toBe(landscapeRight);
  });
});
