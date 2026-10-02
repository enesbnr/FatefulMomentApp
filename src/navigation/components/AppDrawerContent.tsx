import { fontFamilies } from '../../theme/typography';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import ScenariosActiveIcon from '../../../assets/navigation/sidebar/icons/scenarios.svg';
import ScenariosPassiveIcon from '../../../assets/navigation/sidebar/icons/scenarios-passive.svg';
import DNAActiveIcon from '../../../assets/navigation/sidebar/icons/dna-active.svg';
import DNAPassiveIcon from '../../../assets/navigation/sidebar/icons/dna.svg';
import SettingsIcon from '../../../assets/navigation/sidebar/icons/settings.svg';
import { useGameplaySafeArea } from '../../app/providers/GameplaySafeAreaProvider';
import { appColors, withAlpha } from '../../theme/colors';

export default function AppDrawerContent({
  navigation,
  state,
}: DrawerContentComponentProps) {
  const { leftObstruction } = useGameplaySafeArea();
  const activeRoute = state.routeNames[state.index];

  const openScenarios = () => {
    navigation.navigate('Scenarios', { screen: 'Home' });
    navigation.closeDrawer();
  };
  const openDNA = () => {
    // Reset a briefing/video stack before leaving Scenarios. Doing this
    // explicitly avoids Drawer dispatching POP_TO_TOP while Home is already
    // the only route in the nested stack.
    navigation.navigate('Scenarios', { screen: 'Home' });
    navigation.navigate('DNAResult');
    navigation.closeDrawer();
  };

  return (
    <View style={[styles.screen, { paddingLeft: leftObstruction }]}>
      <View style={styles.layout}>
        <DrawerLink
          label="SCENARIOS"
          active={activeRoute === 'Scenarios'}
          ActiveIcon={ScenariosActiveIcon}
          PassiveIcon={ScenariosPassiveIcon}
          onPress={openScenarios}
        />
        <DrawerLink
          label="DNA"
          active={activeRoute === 'DNAResult'}
          ActiveIcon={DNAActiveIcon}
          PassiveIcon={DNAPassiveIcon}
          onPress={openDNA}
        />
        <DrawerLink
          label="SETTINGS"
          active={false}
          ActiveIcon={SettingsIcon}
          PassiveIcon={SettingsIcon}
          disabled
        />
      </View>
    </View>
  );
}

type IconComponent = React.ComponentType<{ width: number; height: number }>;

function DrawerLink({
  label,
  active,
  ActiveIcon,
  PassiveIcon,
  onPress,
  disabled = false,
}: {
  label: string;
  active: boolean;
  ActiveIcon: IconComponent;
  PassiveIcon: IconComponent;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const Icon = active ? ActiveIcon : PassiveIcon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.link, active ? styles.linkActive : styles.linkPassive]}
    >
      <Icon width={20} height={20} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {active ? <View style={styles.activeDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: withAlpha(appColors.background, 0.95),
    borderLeftWidth: 0.75873,
    borderLeftColor: appColors.cardBorder,
    shadowColor: appColors.black,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 16,
  },
  layout: {
    width: 208,
    gap: 16,
    alignSelf: 'center',
  },
  link: {
    width: 208,
    height: 45.51,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 11.9974,
    gap: 15.99,
    borderWidth: 0.75873,
    borderRadius: 14,
  },
  linkActive: {
    backgroundColor: withAlpha(appColors.link, 0.1),
    borderColor: withAlpha(appColors.link, 0.3),
  },
  linkPassive: {
    backgroundColor: withAlpha(appColors.surfaceElevated, 0.4),
    borderColor: withAlpha(appColors.cardBorder, 0.5),
  },
  label: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.500391,
    color: appColors.textSecondary,
    includeFontPadding: false,
  },
  labelActive: {
    color: appColors.accent,
  },
  activeDot: {
    position: 'absolute',
    right: 13.51,
    top: 20.76,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: appColors.accent,
  },
});
