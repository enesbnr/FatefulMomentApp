import { useId, type ReactNode } from 'react';
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { appColors, withAlpha } from '../../../theme/colors';

export default function SimulationStage({
  background,
  children,
}: {
  background: ImageSourcePropType;
  children?: ReactNode;
}) {
  const gradientId = useId();

  return (
    <View style={styles.stage}>
      <Image source={background} resizeMode="cover" style={styles.background} />
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={appColors.background} />
            <Stop
              offset="0.5"
              stopColor={appColors.background}
              stopOpacity={0.4}
            />
            <Stop offset="1" stopColor={appColors.black} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      <View style={styles.content}>{children}</View>
      <View pointerEvents="none" style={styles.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    maxWidth: 728,
    height: '100%',
    maxHeight: 292,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: appColors.background,
    boxShadow: `0 25px 50px -12px ${withAlpha(appColors.black, 0.25)}`,
  },
  background: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  content: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: appColors.cardBorder,
  },
});
