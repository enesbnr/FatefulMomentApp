import { useEffect, useState } from 'react';
import Orientation, {
  type OrientationType,
} from 'react-native-orientation-locker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function useLeftDrawerInset() {
  const insets = useSafeAreaInsets();
  const obstructionSide = useLandscapeObstructionSide();

  return obstructionSide === 'left' ? insets.left : 0;
}

export type LandscapeObstructionSide = 'left' | 'right' | null;

export function useLandscapeObstructionSide(): LandscapeObstructionSide {
  const insets = useSafeAreaInsets();
  const [deviceOrientation, setDeviceOrientation] =
    useState<OrientationType | null>(null);

  useEffect(() => {
    Orientation.getDeviceOrientation(setDeviceOrientation);
    Orientation.addDeviceOrientationListener(setDeviceOrientation);

    return () => {
      Orientation.removeDeviceOrientationListener(setDeviceOrientation);
    };
  }, []);

  const obstructionIsClearlyOnLeft = insets.left > insets.right + 1;
  const obstructionIsClearlyOnRight = insets.right > insets.left + 1;

  if (obstructionIsClearlyOnRight) {
    return 'right';
  }

  if (obstructionIsClearlyOnLeft) {
    return 'left';
  }

  const hasHorizontalObstruction = Math.max(insets.left, insets.right) > 16;

  if (!hasHorizontalObstruction) {
    return null;
  }

  if (deviceOrientation === 'LANDSCAPE-LEFT') {
    return 'left';
  }

  if (deviceOrientation === 'LANDSCAPE-RIGHT') {
    return 'right';
  }

  return null;
}
