import type { NavigatorScreenParams } from '@react-navigation/native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Landing: undefined;
  EmailSignIn: undefined;
  CreateAccount: undefined;
  ResetPassword: { initialEmail?: string } | undefined;
  CheckEmail: { email: string };
};

export type GameplayStackParamList = {
  Home: undefined;
  ScenarioBriefing: { scenarioId: string };
  ScenarioVideo: { scenarioId: string };
};

export type GameplayDrawerParamList = {
  Scenarios: NavigatorScreenParams<GameplayStackParamList> | undefined;
  DNAResult: { scenarioId?: string } | undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Gameplay: NavigatorScreenParams<GameplayDrawerParamList> | undefined;
};

export type AuthScreenProps<RouteName extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, RouteName>;

export type GameplayScreenProps<
  RouteName extends keyof GameplayStackParamList,
> = NativeStackScreenProps<GameplayStackParamList, RouteName>;

export type GameplayDrawerScreenProps<
  RouteName extends keyof GameplayDrawerParamList,
> = DrawerScreenProps<GameplayDrawerParamList, RouteName>;

export type RootScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
