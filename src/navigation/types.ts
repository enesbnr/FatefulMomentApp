import type { NavigatorScreenParams } from '@react-navigation/native';
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

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Gameplay: NavigatorScreenParams<GameplayStackParamList> | undefined;
};

export type AuthScreenProps<RouteName extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, RouteName>;

export type GameplayScreenProps<
  RouteName extends keyof GameplayStackParamList,
> = NativeStackScreenProps<GameplayStackParamList, RouteName>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
