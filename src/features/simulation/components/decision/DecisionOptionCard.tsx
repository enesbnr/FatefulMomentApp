import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { DecisionOption } from '../../../../entities/scenario/model/decisionTypes';
import type { DecisionPhase } from '../../model/decisionSessionTypes';
import {
  decisionColors,
  decisionLayout,
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

  return (
    <View
      style={styles.wrapper}
      testID={`decision-option-frame-${option.id}`}
    >
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
          faded && styles.fadedCard,
          pressed && styles.pressedCard,
        ]}
        testID={`decision-option-${option.id}`}
      >
        {highlighted ? (
          <Svg
            pointerEvents="none"
            preserveAspectRatio="none"
            style={styles.selectedHighlight}
            testID={`decision-option-gradient-${option.id}`}
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
        ) : null}
        <Text
          style={[styles.label, option.label.length > 42 && styles.longLabel]}
        >
          {option.label}
        </Text>
      </Pressable>
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
  card: {
    width: '100%',
    minWidth: 0,
    height: decisionLayout.optionHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: decisionColors.optionBackground,
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
  fadedCard: {
    opacity: 0.48,
  },
  selectedHighlight: {
    ...StyleSheet.absoluteFill,
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
    borderColor: '#FFB900',
    borderRadius: 16,
    zIndex: 2,
  },
  badgeText: {
    color: decisionColors.badgeText,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  label: {
    color: decisionColors.badgeText,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
  longLabel: {
    textAlign: 'left',
  },
});
