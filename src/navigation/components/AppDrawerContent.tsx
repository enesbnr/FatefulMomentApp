import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import ScenariosActiveIcon from '../../../assets/navigation/sidebar/icons/scenarios.svg';
import ScenariosPassiveIcon from '../../../assets/navigation/sidebar/icons/scenarios-passive.svg';
import DNAActiveIcon from '../../../assets/navigation/sidebar/icons/dna-active.svg';
import DNAPassiveIcon from '../../../assets/navigation/sidebar/icons/dna.svg';
import SettingsIcon from '../../../assets/navigation/sidebar/icons/settings.svg';
import useLeftDrawerInset from '../hooks/useLeftDrawerInset';

export default function AppDrawerContent({
  navigation,
  state,
}: DrawerContentComponentProps) {
  const leftDrawerInset = useLeftDrawerInset();
  const activeRoute = state.routeNames[state.index];

  const openScenarios = () => {
    navigation.navigate('Scenarios', { screen: 'Home' });
    navigation.closeDrawer();
  };
  const openDNA = () => {
    navigation.navigate('DNAResult');
    navigation.closeDrawer();
  };

  return (
    <View style={[styles.screen, { paddingLeft: leftDrawerInset }]}> 
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
    backgroundColor: 'rgba(2, 6, 24, 0.95)',
    borderLeftWidth: 0.75873,
    borderLeftColor: '#1D293D',
    shadowColor: '#000000',
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
    backgroundColor: 'rgba(0, 184, 219, 0.1)',
    borderColor: 'rgba(0, 184, 219, 0.3)',
  },
  linkPassive: {
    backgroundColor: 'rgba(15, 23, 43, 0.4)',
    borderColor: 'rgba(29, 41, 61, 0.5)',
  },
  label: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.500391,
    color: '#90A1B9',
    includeFontPadding: false,
  },
  labelActive: {
    color: '#00D3F3',
  },
  activeDot: {
    position: 'absolute',
    right: 13.51,
    top: 20.76,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00D3F3',
  },
});
