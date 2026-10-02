import { fontFamilies } from '../../../theme/typography';
import { StyleSheet, Text, View } from 'react-native';
import Previous from '../../../../assets/scenarios/home/icons/player-previous.svg';
import Play from '../../../../assets/scenarios/home/icons/player-play.svg';
import Next from '../../../../assets/scenarios/home/icons/player-next.svg';
import Queue from '../../../../assets/scenarios/home/icons/player-queue.svg';
import { appColors, withAlpha } from '../../../theme/colors';

export default function MusicPlayer({ rightInset }: { rightInset: number }) {
  return (
    <View
      style={[
        styles.container,
        { paddingRight: Math.max(16, rightInset) },
      ]}
      accessibilityLabel="Music player, standby"
    >
      <Previous width={16} height={16} />
      <View style={styles.play}><Play width={11} height={14} /></View>
      <Next width={16} height={16} />
      <View style={styles.track}>
        <Text style={styles.status}>STANDBY</Text>
        <Text style={styles.title} numberOfLines={1}>THIS IS THE FATEF...</Text>
      </View>
      <View style={styles.queue}><Queue width={14} height={14} /></View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { width: 289, height: 48, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, gap: 16, backgroundColor: withAlpha(appColors.surfaceElevated, 0.8), borderWidth: 1, borderColor: withAlpha(appColors.divider, 0.5), borderTopLeftRadius: 999, borderBottomLeftRadius: 999 },
  play: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', paddingLeft: 2, borderRadius: 16, backgroundColor: withAlpha(appColors.link, 0.1), borderWidth: 1, borderColor: withAlpha(appColors.link, 0.3), boxShadow: `0 0 15px ${withAlpha(appColors.accentStrong, 0.2)}` },
  track: { flex: 1, minWidth: 0 },
  status: { fontFamily: fontFamilies.mono, fontSize: 9, lineHeight: 14, letterSpacing: 0.9, color: withAlpha(appColors.accent, 0.8), opacity: 0.62, includeFontPadding: false },
  title: { fontFamily: fontFamilies.bold, fontSize: 10, lineHeight: 15, color: appColors.textSoft, includeFontPadding: false },
  queue: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' , marginRight:6},
});
