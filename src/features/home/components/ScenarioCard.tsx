import { fontFamilies } from '../../../theme/typography';
import { memo, useId } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Clock from '../../../../assets/scenarios/home/icons/clock.svg';
import { appColors, withAlpha } from '../../../theme/colors';
import { scenarioCardLayout } from '../scenarioCard.constants';
import ScenarioCardMedia from './ScenarioCardMedia';
import type { HomeScenario } from '../types';

function ScenarioCard({
  scenario,
  active,
  selected,
  dimmed,
  previewResumeAtSeconds,
  onPreviewPositionChange,
  onSelect,
  onStart,
}: {
  scenario: HomeScenario;
  active: boolean;
  selected: boolean;
  dimmed: boolean;
  previewResumeAtSeconds?: number;
  onPreviewPositionChange?: (id: string, positionSeconds: number) => void;
  onSelect: (id: string) => void;
  onStart?: (id: string) => void;
}) {
  const gradientId = useId();
  const cardContent = (
    <>
      <View style={styles.clip}>
        <ScenarioCardMedia
          active={active}
          media={scenario.homePreview}
          muted={!selected}
          resumeAtSeconds={previewResumeAtSeconds}
          startAtSeconds={scenario.previewStartAtSeconds}
          onPositionChange={positionSeconds =>
            onPreviewPositionChange?.(scenario.id, positionSeconds)
          }
        />
        <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs><LinearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={appColors.background} />
            <Stop offset="0.6306" stopColor={appColors.background} stopOpacity={0.6} />
            <Stop offset="1" stopColor={appColors.black} stopOpacity={0} />
          </LinearGradient></Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        </Svg>
        <View style={styles.content}>
          <View style={styles.durationRow}><Clock width={12} height={12} /><Text style={styles.duration}>{scenario.duration}</Text></View>
          <Text numberOfLines={1} style={styles.title}>{scenario.title}</Text>
          <Text numberOfLines={4} style={styles.description}>{scenario.description}</Text>
          {scenario.disabled ? (
            <View style={styles.start}>
              <Text style={styles.startLabel}>Start</Text>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Start ${scenario.title}`}
              onPress={event => {
                event.stopPropagation();
                onStart?.(scenario.id);
              }}
              style={styles.start}
            >
              <Text style={styles.startLabel}>Start</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View pointerEvents="none" style={styles.border} />
    </>
  );

  if (scenario.disabled) {
    return (
      <View
        accessibilityRole="button"
        accessibilityLabel={`Locked ${scenario.title}`}
        accessibilityState={{ disabled: true }}
        style={[styles.card, dimmed && styles.dimmed]}
      >
        {cardContent}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={event => {
        event.stopPropagation();
        onSelect(scenario.id);
      }}
      style={[styles.card, dimmed && styles.dimmed]}
    >
      {cardContent}
    </Pressable>
  );
}
export default memo(ScenarioCard);
const styles = StyleSheet.create({
  card: { width: scenarioCardLayout.width, height: scenarioCardLayout.height, borderRadius: scenarioCardLayout.radius, boxShadow: `0 20px 25px -5px ${withAlpha(appColors.black, 0.1)}, 0 8px 10px -6px ${withAlpha(appColors.black, 0.1)}` },
  clip: { flex: 1, borderRadius: scenarioCardLayout.radius, overflow: 'hidden', backgroundColor: appColors.background },
  border: { ...StyleSheet.absoluteFill, borderRadius: scenarioCardLayout.radius, borderWidth: 1, borderColor: appColors.cardBorder },
  dimmed: { opacity: 0.35 },
  content: {
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: scenarioCardLayout.width,
  height: 160,
  paddingHorizontal: 12,
  paddingTop: 12,
  gap: 4,
},
  durationRow: { height: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  duration: { fontFamily: fontFamilies.mono, fontWeight: '700', fontSize: 8, lineHeight: 11, color: appColors.accent, includeFontPadding: false },
  title: { fontFamily: fontFamilies.bold, fontStyle: 'italic', fontSize: 12, lineHeight: 16, color: appColors.textStrong, includeFontPadding: false },
  description: { height: 64, fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 16, color: appColors.textPrimary, includeFontPadding: false },
  start: { alignSelf: 'flex-end', width: 62, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: withAlpha(appColors.accent, 0.14), borderWidth: 1, borderColor: withAlpha(appColors.textSecondary, 0.25) },
  startLabel: { fontFamily: fontFamilies.bold, fontSize: 12, lineHeight: 16, color: appColors.accent, includeFontPadding: false },
});
