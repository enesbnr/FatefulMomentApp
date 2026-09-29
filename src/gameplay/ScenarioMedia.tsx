import { useEffect, useState } from 'react';
import { AppState, Image, StyleSheet, View } from 'react-native';
import Video, { ViewType } from 'react-native-video';

import { sharedMedia } from '../features/scenarios/home/scenarios';
import type { ScenarioMediaSource } from '../features/scenarios/home/types';

// Shared demo media only. The carousel will grant media ownership to one card.
export default function ScenarioMedia({
  active,
  media = sharedMedia,
}: {
  active: boolean;
  media?: ScenarioMediaSource;
}) {
  const [appState, setAppState] = useState(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessible={false}
    >
      <Image source={media.fallback} resizeMode="cover" style={styles.fill} />
      <Image source={media.poster} resizeMode="cover" style={styles.fill} />
      {active && media.video && appState === 'active' ? (
        <PausedPreview source={media.video} />
      ) : null}
    </View>
  );
}

function PausedPreview({ source }: { source: ScenarioMediaSource['video'] }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed) {
    return null;
  }
  return (
    <Video
      source={source}
      style={[styles.fill, !ready && styles.loading]}
      resizeMode="cover"
      viewType={ViewType.TEXTURE}
      paused={false}
      muted
      controls={false}
      repeat
      playInBackground={false}
      playWhenInactive={false}
      disableAudioSessionManagement
      disableFocus
      preventsDisplaySleepDuringVideoPlayback={false}
      onReadyForDisplay={() => setReady(true)}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  loading: { opacity: 0 },
});
