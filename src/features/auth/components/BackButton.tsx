import { Pressable } from 'react-native';
import BackArrow from '../../../../assets/auth/back-arrow.svg';
import { backStyle } from '../../../theme/emailSignIn';

export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      style={backStyle.button}
    >
      <BackArrow width={20} height={20} preserveAspectRatio="xMidYMid meet" />
    </Pressable>
  );
}
