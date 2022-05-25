/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import * as React from 'react';
import {ColorSchemeName, Dimensions, Image, Pressable, TouchableOpacity, View} from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import GetStarted from "../screens/Landing/GetStarted";
import UserEducation from "../screens/Landing/UserEducation";
import Login from "../screens/Auth/Login";
import Forgot from "../screens/Auth/Forgot";
import VerifyOTP from "../screens/Auth/VerifyOTP";
import UserProfile from "../screens/User/UserProfile";
import LoanRequests from "../screens/User/LoanRequests";
import GuarantorshipRequests from "../screens/Guarantorship/GuarantorshipRequests";
import FavouriteGuarantors from "../screens/Guarantorship/FavouriteGuarantors";
import GuarantorsHome from "../screens/Guarantorship/GuarantorsHome";
import WitnessesHome from "../screens/Guarantorship/WitnessesHome";
import Account from "../screens/User/Account";
import History from "../screens/User/History";
import LoanProducts from "../screens/Loans/LoanProducts";
import LoanProduct from "../screens/Loans/LoanProduct";
import LoanPurpose from "../screens/Loans/LoanPurpose";
import LoanConfirmation from "../screens/Loans/LoanConfirmation";
import LoanRequest from "../screens/Loans/LoanRequest";
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";

const { width, height } = Dimensions.get("window");

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

type NavigationProps = NativeStackScreenProps<any>
function RootNavigator() {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });
  return (
    <Stack.Navigator initialRouteName="GetStarted">
      {/*<Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />*/}
      <Stack.Screen name="GetStarted" component={GetStarted} options={{ headerShown: false }} />
      <Stack.Screen name="UserEducation" component={UserEducation} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTP} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Modal" component={ModalScreen} options={{
            title: '',
            headerStyle: {
                backgroundColor: 'rgba(50,52,146,0.12)',
            },
            headerTintColor: '#323492',
            headerShadowVisible: false
        }}/>
      </Stack.Group>
      <Stack.Screen name="ProfileMain" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="LoanProducts" component={LoanProducts} options={{ headerShown: false }} />
      <Stack.Screen name="LoanProduct" component={LoanProduct} options={{ headerShown: false }} />
      <Stack.Screen name="LoanPurpose" component={LoanPurpose} options={{ headerShown: false }} />
      <Stack.Screen name="GuarantorsHome" component={GuarantorsHome} options={{ headerShown: false }} />
      <Stack.Screen name="WitnessesHome" component={WitnessesHome} options={{ headerShown: false }} />
      <Stack.Screen name="LoanConfirmation" component={LoanConfirmation} options={{ headerShown: false }} />
      <Stack.Screen name="LoanRequest" component={LoanRequest} options={{ headerShown: false }} />
      <Stack.Screen name="GuarantorshipRequests" component={GuarantorshipRequests} options={{
          headerShown: true,
          title: 'Guarantorship Requests',
          headerShadowVisible: false,
          headerStyle: {
              backgroundColor: 'rgba(204,204,204,0.28)',
          },
          headerTintColor: '#323492',
          headerTitleStyle: {
              fontSize: 20,
              fontFamily: 'Poppins_600SemiBold'
          }
      }} />
      <Stack.Screen name="FavouriteGuarantors" component={FavouriteGuarantors} options={{
          headerShown: true,
          title: 'Favourite Guarantors',
          headerShadowVisible: false,
          headerStyle: {
              backgroundColor: 'rgba(204,204,204,0.28)',
          },
          headerTintColor: '#323492',
          headerTitleStyle: {
              fontSize: 20,
              fontFamily: 'Poppins_600SemiBold'
          }
      }} />
      <Stack.Screen name="Forgot" component={Forgot} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="UserProfile"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="UserProfile"
        component={UserProfile}
        options={({ navigation }: RootTabScreenProps<'UserProfile'>) => ({
          title: 'User Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="home-account" color={color} />,
          headerShown: false
        })}
      />
      <BottomTab.Screen
        name="LoanRequests"
        component={LoanRequests}
        options={{
          title: 'Loan Requests',
          tabBarIcon: ({ color }) => <TabBarIcon name="bank-transfer" color={color} />,
            headerShown: false
        }}
      />
      <BottomTab.Screen
        name="History"
        component={History}
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
            headerShown: false
        }}
      />
      <BottomTab.Screen
        name="Account"
        component={Account}
        options={{
          title: 'My Account',
          tabBarIcon: ({ color }) => <TabBarIcon name="account" color={color} />,
            headerShown: false
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <MaterialCommunityIcons size={30} style={{ marginBottom: -3 }} {...props} />;
}
