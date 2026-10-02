import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import {
  type EdgeInsets,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import useLandscapeObstructionSide, {
  type LandscapeObstructionSide,
} from '../../shared/hooks/useLandscapeObstructionSide';

export type GameplaySafeArea = {
  insets: EdgeInsets;
  obstructionSide: LandscapeObstructionSide;
  leftObstruction: number;
  rightObstruction: number;
};

const GameplaySafeAreaContext = createContext<GameplaySafeArea | null>(null);

export function GameplaySafeAreaProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { side: obstructionSide } = useLandscapeObstructionSide(insets);
  const value = useMemo<GameplaySafeArea>(
    () => ({
      insets,
      obstructionSide,
      leftObstruction: obstructionSide === 'left' ? insets.left : 0,
      rightObstruction: obstructionSide === 'right' ? insets.right : 0,
    }),
    [insets, obstructionSide],
  );

  return (
    <GameplaySafeAreaContext.Provider value={value}>
      {children}
    </GameplaySafeAreaContext.Provider>
  );
}

export function useGameplaySafeArea() {
  const value = useContext(GameplaySafeAreaContext);

  if (!value) {
    throw new Error(
      'useGameplaySafeArea must be used within GameplaySafeAreaProvider',
    );
  }

  return value;
}
