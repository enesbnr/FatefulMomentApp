import { fontFamilies } from '../../../theme/typography';
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useGameplaySafeArea } from '../../../app/providers/GameplaySafeAreaProvider';
import { useScenarioProgressRepository } from '../../../app/providers/ScenarioProgressProvider';
import { getScenarioById } from '../../../entities/scenario/selectors/scenarioSelectors';
import type { GameplayDrawerScreenProps } from '../../../navigation/types';
import { demoDnaResult } from '../data/demoDnaResult';
import calculateDnaTraitScores from '../domain/calculateDnaTraitScores';
import type { DnaResult } from '../model/types';
import DNAResultContent from '../components/DNAResultContent';
import {
  dnaResultColors,
  dnaResultLayout,
} from '../components/dnaResult.constants';

export default function DNAResultScreen(
  props: GameplayDrawerScreenProps<'DNAResult'>,
) {
  const scenarioId = props.route.params?.scenarioId;
  const repository = useScenarioProgressRepository();
  const [result, setResult] = useState<DnaResult | null>(
    scenarioId ? null : demoDnaResult,
  );
  const resultScrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [contentScrollable, setContentScrollable] = useState(false);
  const { width, height } = useWindowDimensions();
  const { obstructionSide } = useGameplaySafeArea();
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

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadResult = () => {
      const currentRequestId = ++requestId;

      if (!scenarioId) {
        setResult(demoDnaResult);
        return;
      }

      setResult(null);
      const scenario = getScenarioById(scenarioId);
      if (!scenario) {
        setResult(demoDnaResult);
        return;
      }

      repository
        .get(scenarioId)
        .then(progress => {
          if (active && currentRequestId === requestId) {
            setResult({
              // Narrative fields remain Figma demo content until the API or a
              // product-owned interpretation engine provides matching copy.
              ...demoDnaResult,
              traits: progress
                ? calculateDnaTraitScores(scenario, progress.answers)
                : demoDnaResult.traits,
            });
          }
        })
        .catch(() => {
          if (active && currentRequestId === requestId) {
            setResult(demoDnaResult);
          }
        });
    };

    loadResult();
    const unsubscribe = props.navigation.addListener('focus', loadResult);

    return () => {
      active = false;
      requestId += 1;
      unsubscribe();
    };
  }, [props.navigation, repository, scenarioId]);

  if (!result) {
    return <View style={styles.screen} testID="dna-result-loading" />;
  }

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
        <ScrollView
          ref={resultScrollRef}
          testID="dna-result-scroll"
          style={[styles.resultScroll, { left: contentLeft }]}
          scrollEnabled={contentScrollable}
          bounces={contentScrollable}
          overScrollMode={contentScrollable ? 'auto' : 'never'}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(_contentWidth, contentHeight) => {
            const overflows =
              contentHeight > dnaResultLayout.contentHeight + 1;
            setContentScrollable(overflows);
            if (!overflows) {
              resultScrollRef.current?.scrollTo({ y: 0, animated: false });
            }
          }}
        >
          <DNAResultContent result={result} />
        </ScrollView>
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
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    lineHeight: 20,
    color: dnaResultColors.text,
    includeFontPadding: false,
  },
  resultScroll: {
    position: 'absolute',
    top: 77,
    width: dnaResultLayout.contentWidth,
    height: dnaResultLayout.contentHeight,
  },
});
