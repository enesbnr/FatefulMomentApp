import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { GameplayDrawerScreenProps } from '../../../navigation/types';
import { useLandscapeObstructionSide } from '../../../navigation/hooks/useLeftDrawerInset';
import { demoDnaResult } from '../data/demoDnaResult';
import DNAResultContent from '../components/DNAResultContent';
import {
  dnaResultColors,
  dnaResultLayout,
} from '../components/dnaResult.constants';

export default function DNAResultScreen(
  _props: GameplayDrawerScreenProps<'DNAResult'>,
) {
  const { width, height } = useWindowDimensions();
  const obstructionSide = useLandscapeObstructionSide();
  const scale = Math.min(
    width / dnaResultLayout.referenceWidth,
    height / dnaResultLayout.referenceHeight,
  );
  const horizontalRemainder =
    dnaResultLayout.referenceWidth - dnaResultLayout.contentWidth;
  const contentLeft =
    obstructionSide === 'left'
      ? dnaResultLayout.protectedEdge
      : obstructionSide === 'right'
        ? dnaResultLayout.compactEdge
        : horizontalRemainder / 2;

  return (
    <View style={styles.screen} testID="dna-result-screen">
      <View
        style={[
          styles.canvas,
          {
            left: (width - dnaResultLayout.referenceWidth) / 2,
            top: (height - dnaResultLayout.referenceHeight) / 2,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={[styles.heading, { left: contentLeft }]}>Karar DNAsı</Text>
        <DNAResultContent result={demoDnaResult} left={contentLeft} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: dnaResultColors.background,
  },
  canvas: {
    position: 'absolute',
    width: dnaResultLayout.referenceWidth,
    height: dnaResultLayout.referenceHeight,
    backgroundColor: dnaResultColors.background,
  },
  heading: {
    position: 'absolute',
    top: 33,
    height: 28,
    paddingVertical: 4,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    lineHeight: 20,
    color: dnaResultColors.text,
    includeFontPadding: false,
  },
});
