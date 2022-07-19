/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('presta-sign://app')],
  config: {
    screens: {
      Root: {
        screens: {
          UserProfile: {
            screens: {
              UserProfile: 'user-profile',
            },
          },
          LoanRequests: {
            screens: {
              LoanRequests: 'loan-requests',
            },
          },
          History: {
            screens: {
              History: 'history',
            },
          },
          Account: {
            screens: {
              Account: 'account',
            },
          },
        },
      },
      Modal: 'modal',
      NotFound: '*',
      GetStarted: 'get-started',
      UserEducation: 'user-education',
      LoanProducts: 'loan-products',
      LoanProduct: 'loan-product',
      GuarantorsHome: 'guarantors-home',
      WitnessesHome: 'witnesses-home',
      LoanConfirmation: 'loan-confirmation',
      LoanRequest: 'loan-request',
      Login: 'login',
      ShowTenants: 'Show-tenants',
      GetTenants: 'get-tenants',
      PinLogin: 'pin-login',
      SetPin: 'set-pin',
      LoanPurpose: 'loan-purpose',
      Forgot: 'forgot',
      ProfileMain: 'profile-main',
      GuarantorshipRequests: 'guarantorship-requests',
      WitnessRequests: 'witness-requests',
      GuarantorshipStatus: 'guarantorship-status',
      WitnessStatus: 'witness-status',
      SignDocumentRequest: 'signDocument-request',
      FavouriteGuarantors: 'favourite-guarantors',
      VerifyOTP: 'verifyotp',
    },
  },
};

export default linking;
