import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { DecisionOption } from '../../../../entities/scenario/model/decisionTypes';
import type { DecisionPhase } from '../../model/decisionSessionTypes';
import { appColors } from '../../../../theme/colors';
import { fontFamilies } from '../../../../theme/typography';
import {
  decisionColors,
  decisionLayout,
  decisionMotion,
  selectedOptionGradient,
} from './decision.constants';

export type DecisionOptionVisualState =
  | 'default'
  | 'active-selection'
  | 'user-choice'
  | 'revealed-choice'
  | 'matching-choice';

type Props = {
  option: DecisionOption;
  phase: DecisionPhase;
  visualState: DecisionOptionVisualState;
  onPress: (optionId: DecisionOption['id']) => void;
};

export default function DecisionOptionCard({
  option,
  phase,
  visualState,
  onPress,
}: Props) {
  const highlighted = visualState !== 'default';
  const showsBadge =
    visualState === 'user-choice' || visualState === 'matching-choice';
  const faded = visualState === 'user-choice';
  const longLabel = option.label.length > 42;
  const centeredLabel =
    highlighted && visualState !== 'revealed-choice' && !longLabel;
  const cardOpacity = useRef(new Animated.Value(faded ? 0.48 : 1)).current;
  const highlightOpacity = useRef(
    new Animated.Value(highlighted ? 1 : 0),
  ).current;
  const baseOpacity = useRef(
    new Animated.Value(highlighted ? 0 : 1),
  ).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: faded ? 0.48 : 1,
        duration: decisionMotion.revealFadeDurationMs,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(highlightOpacity, {
        toValue: highlighted ? 1 : 0,
        duration: decisionMotion.highlightDurationMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(baseOpacity, {
        toValue: highlighted ? 0 : 1,
        duration: decisionMotion.highlightDurationMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => animation.stop();
  }, [baseOpacity, cardOpacity, faded, highlightOpacity, highlighted]);

  return (
    <View
      style={[
        styles.wrapper,
        visualState === 'matching-choice' && styles.lockedWrapper,
      ]}
      testID={`decision-option-frame-${option.id}`}
    >
      <Animated.View style={[styles.animatedCard, { opacity: cardOpacity }]}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{
            checked:
              visualState === 'active-selection' ||
              visualState === 'user-choice' ||
              visualState === 'matching-choice',
            disabled: phase !== 'choosing',
          }}
          disabled={phase !== 'choosing'}
          onPress={() => onPress(option.id)}
          style={({ pressed }) => [
            styles.card,
            highlighted && styles.highlightedCard,
            pressed && styles.pressedCard,
          ]}
          testID={`decision-option-${option.id}`}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.baseBackground, { opacity: baseOpacity }]}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.selectedHighlight, { opacity: highlightOpacity }]}
            testID={`decision-option-gradient-${option.id}`}
          >
            <Svg
              preserveAspectRatio="none"
              width="100%"
              height="100%"
              viewBox={`0 0 ${selectedOptionGradient.viewBoxWidth} ${selectedOptionGradient.viewBoxHeight}`}
            >
              <Defs>
                <LinearGradient
                  id={`selected-gradient-${option.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={selectedOptionGradient.startX}
                  y1={selectedOptionGradient.startY}
                  x2={selectedOptionGradient.endX}
                  y2={selectedOptionGradient.endY}
                >
                  <Stop
                    offset="0%"
                    stopColor={decisionColors.selectedGradientEdge}
                    stopOpacity={decisionColors.selectedGradientOpacity}
                  />
                  <Stop
                    offset="50%"
                    stopColor={decisionColors.selectedGradientCenter}
                    stopOpacity={decisionColors.selectedGradientOpacity}
                  />
                  <Stop
                    offset="100%"
                    stopColor={decisionColors.selectedGradientEdge}
                    stopOpacity={decisionColors.selectedGradientOpacity}
                  />
                </LinearGradient>
              </Defs>
              <Rect
                width={selectedOptionGradient.viewBoxWidth}
                height={selectedOptionGradient.viewBoxHeight}
                fill={`url(#selected-gradient-${option.id})`}
              />
            </Svg>
          </Animated.View>
          <Text
            style={[styles.label, centeredLabel && styles.centeredLabel]}
          >
            {option.label}
          </Text>
        </Pressable>
      </Animated.View>
      {showsBadge ? (
        <View pointerEvents="none" style={styles.badge}>
          <Text style={styles.badgeText}>Your Choice</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minWidth: 0,
    height: decisionLayout.optionHeight,
    overflow: 'visible',
  },
  lockedWrapper: {
    zIndex: 1,
  },
  animatedCard: {
    width: '100%',
    height: '100%',
  },
  card: {
    width: '100%',
    minWidth: 0,
    height: decisionLayout.optionHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: decisionColors.optionBorder,
    borderRadius: decisionLayout.optionRadius,
  },
  highlightedCard: {
    borderWidth: 2,
  },
  pressedCard: {
    opacity: 0.82,
  },
  selectedHighlight: {
    ...StyleSheet.absoluteFill,
  },
  baseBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: decisionColors.optionBackground,
  },
  badge: {
    position: 'absolute',
    top: -16,
    alignSelf: 'center',
    width: 106,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: decisionColors.badgeBackground,
    borderWidth: 1,
    borderColor: appColors.warning,
    borderRadius: 16,
    zIndex: 2,
  },
  badgeText: {
    color: decisionColors.badgeText,
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  label: {
    color: decisionColors.badgeText,
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'left',
  },
  centeredLabel: {
    textAlign: 'center',
  },
});
