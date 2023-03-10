import {
    View,
    StyleSheet,
    Dimensions,
    TouchableHighlight,
    Text,
    StatusBar as Bar,
    Image, Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {useEffect} from "react";
import {store} from "../../stores/store";
import {getTenants, initializeDB, pingBeacon} from "../../stores/auth/authSlice"
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import {RotateView} from "../Auth/VerifyOTP";
import Onboarding from "../../components/Onboarding";
import {registerForPushNotificationsAsync, registerTask} from "../../utils/notificationService";
import {checkToStartUpdate, showSnack} from "../../utils/immediateUpdate";
import {getSecureKey, saveSecureKey} from "../../utils/secureStore";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import showTenants from "../Tenants/ShowTenants";
import Container from "../../components/Container";

const { width, height } = Dimensions.get("window");

type NavigationProps = NativeStackScreenProps<any>

export default function GetStarted({ navigation }: NavigationProps) {
    const { appInitialized, loading } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    useEffect(() => {
        let initializing = true;
        if (initializing) {
            (async () => {
                try {
                    checkToStartUpdate();
                    /*showSnack("Hey testing", "SUCCESS", "Retry", () => {
                        console.log("testing callback")
                    });*/
                } catch (e: any) {
                    showSnack(e.message, "ERROR", "", false)
                }
                try {
                    const [oldBoy, phone, code, email, currentTenantId] = await Promise.all([
                        getSecureKey('existing'),
                        getSecureKey('phone_number_without'),
                        getSecureKey('phone_number_code'),
                        getSecureKey('account_email'),
                        getSecureKey('currentTenantId'),
                    ]);

                    // check for existing user and redirect to log in

                    if (oldBoy === 'true' && currentTenantId) {
                        dispatch(getTenants(`${code}${phone}`))
                        .then(({type, meta, error}: any) => {
                            if (type === 'getTenants/rejected' && error) {
                                showSnack(`Tenants not found: ${error.message}`, "ERROR", "", true);
                            } else {
                                navigation.navigate('Login', {
                                    countryCode: code,
                                    phoneNumber: phone,
                                    email
                                });
                            }
                        }).catch(error => {
                            showSnack(error.message, "ERROR", "", false)
                        })
                    } else {
                        // initialize new user
                    }
                } catch (e: any) {
                    showSnack(e.message, "ERROR", "", false)
                }

                // register for push notifications
                try {
                    const token = await registerForPushNotificationsAsync();
                    if (token) {
                        await Promise.allSettled([
                            saveSecureKey('notification_id', token),
                            /*dispatch(pingBeacon({
                                appName: Constants.manifest?.android?.package,
                                notificationTok: token,
                                version: Constants.manifest?.version
                            }))*/
                        ])

                        registerTask();
                    }
                } catch (e: any) {
                    console.log("registerForPushNotificationsAsync/pingBeacon", e.message);
                    // showSnack(e.message, "ERROR", "", false)
                }
            })()
        }

        // add notification listener

        const subscription = Notifications.addNotificationReceivedListener(notification => {
            if (notification.request.content.data.url) {
                console.log("notification data foreground", notification.request.content.data.url);
                (async () => {
                    await Linking.openURL(notification.request.content.data.url as string);
                })()
            }
        });

        return () => {
            initializing = false;
            subscription.remove();
        };
    }, [appInitialized])

    if (fontsLoaded && !loading) {
        return (
            <Container>
                <Onboarding />
                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
                    <TouchableHighlight style={styles.button} onPress={() => navigation.navigate('SetTenant', {
                        code: "254",
                        numericCode: "404",
                        alpha2Code: "KE",
                        flag: "https://flagcdn.com/28x21/ke.png"
                    })}>
                        <Text allowFontScaling={false} style={styles.buttonText}>Get Started</Text>
                    </TouchableHighlight>
                </View>
                <StatusBar style='auto'/>
            </Container>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <RotateView/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
    button: {
        backgroundColor: '#3D889A',
        elevation: 3,
        borderRadius: 25,
        paddingVertical: 15,
        marginTop: 20,
        marginBottom: 5,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    landingBg: {
        top: 0,
        position: 'absolute',
        height: height + (Bar.currentHeight ? Bar.currentHeight : 0),
        width
    },
});
