/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WitnessStatus from "./screens/Guarantorship/WitnessStatus";
import pinLogin from "./screens/Auth/PinLogin";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
  GetStarted: NavigatorScreenParams<RootTabParamList> | undefined;
  UserEducation: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanProducts: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanProduct: NavigatorScreenParams<RootTabParamList> | undefined;
  GuarantorsHome: NavigatorScreenParams<RootTabParamList> | undefined;
  WitnessesHome: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanConfirmation: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanRequest: NavigatorScreenParams<RootTabParamList> | undefined;
  Login: NavigatorScreenParams<RootTabParamList> | undefined;
  pinLogin: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanPurpose: NavigatorScreenParams<RootTabParamList> | undefined;
  Forgot: NavigatorScreenParams<RootTabParamList> | undefined;
  ProfileMain: NavigatorScreenParams<RootTabParamList> | undefined;
  GuarantorshipRequests: NavigatorScreenParams<RootTabParamList> | undefined;
  WitnessRequests: NavigatorScreenParams<RootTabParamList> | undefined;
  GuarantorshipStatus: NavigatorScreenParams<RootTabParamList> | undefined;
  WitnessStatus: NavigatorScreenParams<RootTabParamList> | undefined;
  SignDocumentRequest: NavigatorScreenParams<RootTabParamList> | undefined;
  FavouriteGuarantors: NavigatorScreenParams<RootTabParamList> | undefined;
  VerifyOTP: NavigatorScreenParams<RootTabParamList> | undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
  UserProfile: undefined;
  LoanRequests: undefined;
  History: undefined;
  Account: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
