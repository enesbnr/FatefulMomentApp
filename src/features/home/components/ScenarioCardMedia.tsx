import { useEffect, useRef, useState } from 'react';
import { AppState, Image, StyleSheet, View } from 'react-native';
import Video, {
  type OnProgressData,
  type VideoRef,
  ViewType,
} from 'react-native-video';

import type { ScenarioPreviewMedia } from '../../../entities/scenario/model/types';
import { scenarioCardLayout } from '../scenarioCard.constants';

type ScenarioCardMediaProps = {
  active: boolean;
  media: ScenarioPreviewMedia;
  muted?: boolean;
  resumeAtSeconds?: number;
  startAtSeconds?: number;
  onPositionChange?: (positionSeconds: number) => void;
};

export default function ScenarioCardMedia({
  active,
  media,
  muted = true,
  resumeAtSeconds,
  startAtSeconds = 0,
  onPositionChange,
}: ScenarioCardMediaProps) {
  const [appState, setAppState] = useState(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return (
    <View
      collapsable={false}
      pointerEvents="none"
      style={styles.viewport}
      accessible={false}
    >
      <Image source={media.fallback} resizeMode="cover" style={styles.fill} />
      <Image source={media.poster} resizeMode="cover" style={styles.fill} />
      {active && media.video && appState === 'active' ? (
        <PausedPreview
          muted={muted}
          resumeAtSeconds={resumeAtSeconds ?? startAtSeconds}
          source={media.video}
          startAtSeconds={startAtSeconds}
          onPositionChange={onPositionChange}
        />
      ) : null}
    </View>
  );
}

function PausedPreview({
  muted,
  resumeAtSeconds,
  source,
  startAtSeconds,
  onPositionChange,
}: {
  muted: boolean;
  resumeAtSeconds: number;
  source: ScenarioPreviewMedia['video'];
  startAtSeconds: number;
  onPositionChange?: (positionSeconds: number) => void;
}) {
  const videoRef = useRef<VideoRef>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const seekToPosition = (positionSeconds: number, duration?: number) => {
    const latestSafePosition = duration
      ? Math.max(0, duration - 1)
      : positionSeconds;
    const safePosition = Math.min(positionSeconds, latestSafePosition);
    videoRef.current?.seek(safePosition);
  };
  if (failed) {
    return null;
  }
  return (
    <Video
      ref={videoRef}
      source={source}
      style={[styles.fill, !ready && styles.loading]}
      resizeMode="cover"
      viewType={ViewType.TEXTURE}
      paused={false}
      muted={muted}
      controls={false}
      repeat={false}
      playInBackground={false}
      playWhenInactive={false}
      disableAudioSessionManagement
      disableFocus
      preventsDisplaySleepDuringVideoPlayback={false}
      progressUpdateInterval={250}
      onLoad={({ duration }) => seekToPosition(resumeAtSeconds, duration)}
      onProgress={({ currentTime }: OnProgressData) => {
        onPositionChange?.(currentTime);
      }}
      onEnd={() => {
        onPositionChange?.(startAtSeconds);
        seekToPosition(startAtSeconds);
        videoRef.current?.resume();
      }}
      onReadyForDisplay={() => setReady(true)}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  viewport: {
    ...StyleSheet.absoluteFill,
    borderRadius: scenarioCardLayout.radius,
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    borderRadius: scenarioCardLayout.radius,
  },
  loading: { opacity: 0 },
});
