import { memo, useId } from 'react';
import { Platform, StyleSheet, Text, View, Pressable } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Clock from '../../../../assets/scenarios/home/icons/clock.svg';
import ScenarioMedia from '../../../gameplay/ScenarioMedia';
import type { Scenario } from './types';


export const CARD_WIDTH = 220;
export const CARD_HEIGHT = 176;
export const CARD_GAP = 16;

function ScenarioCard({
  scenario,
  active,
  dimmed,
  onSelect,
}: {
  scenario: Scenario;
  active: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const gradientId = useId();
  return (
    <Pressable
  onPress={event => {
    event.stopPropagation();
    onSelect();
  }}
  style={[
  styles.card,
  dimmed && styles.dimmed,
]}
>
      <View style={styles.clip}>
        <ScenarioMedia active={active} media={scenario.media} />
        <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs><LinearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#020618" />
            <Stop offset="0.6306" stopColor="#020618" stopOpacity={0.6} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0} />
          </LinearGradient></Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        </Svg>
        <View style={styles.content}>
          <View style={styles.durationRow}><Clock width={12} height={12} /><Text style={styles.duration}>{scenario.duration}</Text></View>
          <Text numberOfLines={1} style={styles.title}>{scenario.title}</Text>
          <Text numberOfLines={4} style={styles.description}>{scenario.description}</Text>
          <View style={styles.start}><Text style={styles.startLabel}>Start</Text></View>
        </View>
      </View>
      <View pointerEvents="none" style={styles.border} />
    </Pressable>
  );
}
export default memo(ScenarioCard);
const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' },
  clip: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#020618' },
  border: { ...StyleSheet.absoluteFill, borderRadius: 16, borderWidth: 1, borderColor: '#1D293D' },
  dimmed: { opacity: 0.35 },
  content: {
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: CARD_WIDTH,
  height: 160,
  paddingHorizontal: 12,
  paddingTop: 12,
  gap: 4,
},
  durationRow: { height: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  duration: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '700', fontSize: 8, lineHeight: 11, color: '#00D3F3', includeFontPadding: false },
  title: { fontFamily: 'Inter-Bold', fontStyle: 'italic', fontSize: 12, lineHeight: 16, color: '#F8FAFC', includeFontPadding: false },
  description: { height: 64, fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 16, color: '#E2E8F0', includeFontPadding: false },
  start: { alignSelf: 'flex-end', width: 62, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,211,243,0.14)', borderWidth: 1, borderColor: 'rgba(144,161,185,0.25)' },
  startLabel: { fontFamily: 'Inter-Bold', fontSize: 12, lineHeight: 16, color: '#00D3F3', includeFontPadding: false },
});
