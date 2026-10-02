import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Orientation, {
  type OrientationType,
} from 'react-native-orientation-locker';
import type { EdgeInsets } from 'react-native-safe-area-context';

export type LandscapeObstructionSide = 'left' | 'right' | null;
export type LandscapeObstructionState = {
  side: LandscapeObstructionSide;
  interfaceOrientation: OrientationType | null;
};

export default function useLandscapeObstructionSide(
  insets: Pick<EdgeInsets, 'left' | 'right'>,
): LandscapeObstructionState {
  const { width, height } = useWindowDimensions();
  const [interfaceOrientation, setInterfaceOrientation] =
    useState<OrientationType | null>(null);
  const handleOrientationChange = useCallback(
    (nextOrientation: OrientationType) => {
      setInterfaceOrientation(previousOrientation =>
        preserveLandscapeInterfaceOrientation(
          previousOrientation,
          nextOrientation,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    Orientation.addOrientationListener(handleOrientationChange);

    return () => {
      Orientation.removeOrientationListener(handleOrientationChange);
    };
  }, [handleOrientationChange]);

  useEffect(() => {
    Orientation.getOrientation(handleOrientationChange);
  }, [
    handleOrientationChange,
    height,
    insets.left,
    insets.right,
    width,
  ]);

  return {
    side: resolveLandscapeObstructionSide(insets, interfaceOrientation),
    interfaceOrientation,
  };
}

export function preserveLandscapeInterfaceOrientation(
  previousOrientation: OrientationType | null,
  nextOrientation: OrientationType,
): OrientationType | null {
  return nextOrientation === 'LANDSCAPE-LEFT' ||
    nextOrientation === 'LANDSCAPE-RIGHT'
    ? nextOrientation
    : previousOrientation;
}

export function resolveLandscapeObstructionSide(
  insets: { left: number; right: number },
  interfaceOrientation: OrientationType | null,
): LandscapeObstructionSide {
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

  if (interfaceOrientation === 'LANDSCAPE-LEFT') {
    return 'left';
  }

  if (interfaceOrientation === 'LANDSCAPE-RIGHT') {
    return 'right';
  }

  return null;
}
