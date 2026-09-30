import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { appColors } from '../../../theme/colors';

type AppHeaderProps = {
  trailing?: ReactNode;
};

export default function AppHeader({ trailing }: AppHeaderProps) {
  return <View style={styles.header}>{trailing}</View>;
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexShrink: 0,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: appColors.divider,
    backgroundColor: appColors.background,
  },
});
