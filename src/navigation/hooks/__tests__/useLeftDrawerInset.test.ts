import type { OrientationType } from 'react-native-orientation-locker';
import { resolveLandscapeObstructionSide } from '../useLeftDrawerInset';

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

  test('uses stable interface orientation when landscape insets are symmetric', () => {
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

  test('does not invent an obstruction on devices without a large inset', () => {
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
