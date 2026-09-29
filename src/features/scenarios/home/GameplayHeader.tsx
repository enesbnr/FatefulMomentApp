import { StyleSheet, View } from 'react-native';
import MusicPlayer from './MusicPlayer';

export default function GameplayHeader({ rightInset }: { rightInset: number }) {
  return (
    <View style={styles.header}>
      <MusicPlayer rightInset={rightInset} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexShrink: 0,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#314158',
    backgroundColor: '#020618',
  },
});
