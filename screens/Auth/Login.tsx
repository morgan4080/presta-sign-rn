import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions,
    SafeAreaView,
    NativeModules,
    Alert,
    TouchableHighlight
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming
} from "react-native-reanimated";
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useState} from "react";
import * as LocalAuthentication from 'expo-local-authentication';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import {loginUser, authenticate, setAuthState} from "../../stores/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../stores/store";
import { storeState, loginUserType } from "../../stores/auth/authSlice"
import {RotateView} from "./VerifyOTP";
import {FontAwesome5, Ionicons} from "@expo/vector-icons";
import {getSecureKey, saveSecureKey} from "../../utils/secureStore";
const { width, height } = Dimensions.get("window");

type NavigationProps = NativeStackScreenProps<any>;

type FormData = {
    phoneNumber: string | undefined;
    pinChar1: string | undefined;
    pinChar2: string | undefined;
    pinChar3: string | undefined;
    pinChar4: string | undefined;
};

const Ring = ({ delay, loading }: {delay: number, loading: boolean}) => {
    const ring = useSharedValue(0);

    const ringStyle = useAnimatedStyle(() => {
        return {
            opacity: 0.8 - ring.value,
            backgroundColor: loading ? '#489AAB': '#FFFFFF',
            transform: [
                {
                    scale: interpolate(ring.value, [0, 1], [0, 4]),
                },
            ],
        };
    });

    useEffect(() => {
        ring.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, {
                    duration: 4000,
                }),
                -1,
                false
            )
        );
    }, []);
    return <Animated.View style={[styles.ring, ringStyle]} />;
};

export default function Login({ navigation }: NavigationProps) {
    const { tenants, selectedTenantId, loading, organisations } = useSelector((state: { auth: storeState }) => state.auth);
    const [otpVerified, setOtpVerified] = useState(undefined);
    const [fingerPrint, setFingerPrint] = useState<string | null>(null);
    const [localLogin, setLocalLogin] = useState<boolean>(false);
    const [currentTenant, setCurrentTenant] = useState<{tenantName: string, tenantId: string, clientSecret: string} | undefined>(undefined);

    (async () => {
        try {
            let otpV = await getSecureKey('otp_verified');
            setOtpVerified(otpV);
        } catch (e:any) {
            console.log("getSecureKey otpVerified", e)
        }
    })()

    type AppDispatch = typeof store.dispatch;

    const CUSTOM = NativeModules.CSTM;

    const tenant = tenants.find(t => t.id === selectedTenantId);

    console.log(tenant)

    const dispatch : AppDispatch = useDispatch();

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const [isBiometricSupported, setIsBiometricSupported] = useState(false);

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const CT = organisations.find(org => org.tenantId === tenant?.tenantId)
                if (CT) {
                    setCurrentTenant(CT)
                    await saveSecureKey('currentTenant', JSON.stringify(CT))
                }
                const fP = await getSecureKey('fingerPrint');
                setFingerPrint(fP);
                const response = await dispatch(authenticate());
                if (response.type === 'authenticate/rejected') {
                    return
                }
                if (response.type === 'authenticate/fulfilled') {
                    if (otpVerified === 'true') {
                        dispatch(setAuthState(true));
                    } else {
                        navigation.navigate('VerifyOTP')
                    }
                }
            })()
        }
        return () => {
            authenticating = false
        }
    }, []);

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setIsBiometricSupported(compatible);
        })()
    });

    useEffect(() => {
        let launching = true;

        if (isBiometricSupported && launching) {
            if (fingerPrint && currentTenant) {
                (async () => {
                    // let fpParsed = JSON.parse(fingerPrint)
                    // let pin = fpParsed !== '' ? fpParsed.pin : ''
                    // await handleBiometricAuth(currentTenant, pin)
                })()
            }
        }

        return () => {
            launching = false;
        }
    }, [isBiometricSupported, fingerPrint])

    const {
        control,
        setError,
        setValue,
        formState: {  }
    } = useForm<FormData>({
        defaultValues: {
            phoneNumber: tenant? tenant.ussdPhoneNumber : '',
            pinChar1: '',
            pinChar2: '',
            pinChar3: '',
            pinChar4: ''
        }
    });

    const fallBackToDefaultAuth = () => {
        console.log("fallback to phone and pin authentication")
    }

    const alertComponent = (title: string, mess: string | undefined, btnText: any, btnFunc: any) => {
        return Alert.alert(title, mess, [
            {
                text: btnText,
                onPress: btnFunc,
            }
        ])
    }

    /*const TwoButtonAlert = () => {
        return Alert.alert('Welcome', 'Get started by creating a new loan request', [
            {
                text: 'Back',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel'
            },
            {
                text: 'OK',
                onPress: () => console.log('Ok Pressed')
            }
        ])
    }*/

    const handleBiometricAuth = async () => {
        // check for support by hardware
        const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();

        // fallback to pin in biometric not available
        if (!isBiometricAvailable) {
            return  alertComponent(
                'Please Enter your pin',
                'Biometric Auth not supported',
                'Ok',
                () => fallBackToDefaultAuth()
            );
        }

        // check biometric types available (fingerprint, facial recognition, iris recognition)

        let supportedBiometrics;

        if (isBiometricAvailable) {
            supportedBiometrics = await LocalAuthentication.supportedAuthenticationTypesAsync()
        }

        // check biometrics are saved locally in users device

        const savedBiometrics = await LocalAuthentication.isEnrolledAsync()

        if (!savedBiometrics) {
            return alertComponent(
                'Biometric record not found',
                'Please login with pin',
                'Ok',
                () => fallBackToDefaultAuth()
            )
        }

        // authenticate with biometrics
        const biometricAuth = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login with biometrics',
            cancelLabel: 'cancel',
            disableDeviceFallback: true
        })

        // log the user in on success

        if (biometricAuth && !biometricAuth.hasOwnProperty('error')) {
            if (localLogin) {
                setCancelFingerPrint(false);
                if (otpVerified === 'true') {
                    dispatch(setAuthState(true));
                } else {
                    navigation.navigate('VerifyOTP');
                }
            } else {
                // check fingerPrint Secure Key and perform login process
                let fP = await getSecureKey('fingerPrint');
                fP = JSON.parse(fP);
                if (currentTenant && tenant && fP) {
                    const payload: loginUserType = {
                        phoneNumber: fP.phoneNumber,
                        pin: fP.pin,
                        tenant: tenant.tenantId,
                        clientSecret: currentTenant.clientSecret,
                    };

                    try {
                        const {type, error}: any = await dispatch(loginUser(payload))
                        if (type === 'loginUser/rejected' && error) {
                            if (error.message === "Network request failed") {
                                CUSTOM.showToast(error.message);
                            } else {
                                setError('phoneNumber', {type: 'custom', message: error.message});
                                CUSTOM.showToast(error.message);
                            }
                        } else {
                            setCancelFingerPrint(false);
                            if (otpVerified === 'true') {
                                dispatch(setAuthState(true));
                            } else {
                                navigation.navigate('VerifyOTP');
                            }
                        }
                    } catch (e: any) {
                        CUSTOM.showToast(e.message)
                    }
                } else {
                    CUSTOM.showToast("Kindly use pin")
                }
            }
        }

        console.log({isBiometricAvailable})
        console.log({supportedBiometrics})
        console.log({savedBiometrics})
        console.log({biometricAuth})
    }
    let characters: number[] = []

    // const animatedOpacity = useRef(new Animated.Value(1))

    const [inputDisabled, setInputDisabled] = useState(false)

    const [cancelFingerPrint, setCancelFingerPrint] = useState<boolean>(false);

    const onPressed = async (field: number) => {
        if (!loading) {
            if (field === -1) {
                console.log("activate finger print");
                if (isBiometricSupported) {
                    // proceed
                    // check secureStore for fingerPrint details
                    if (fingerPrint && currentTenant) {
                        // let fpParsed = JSON.parse(fingerPrint)
                        // let pin = fpParsed !== '' ? fpParsed.pin : ''
                        // await handleBiometricAuth(currentTenant, pin)
                    } else {
                        return alertComponent(
                            'Please Enter your pin',
                            'Biometrics not activated on this application.',
                            'Ok',
                            () => fallBackToDefaultAuth()
                        );
                    }
                } else {
                    return alertComponent(
                        'Please Enter your pin',
                        'Biometrics not supported on this application.',
                        'Ok',
                        () => fallBackToDefaultAuth()
                    );
                }
            } else if (field === -2) {
                // backspace
                characters = []
                setValue(`pinChar1`, ``)
                setValue(`pinChar2`, ``)
                setValue(`pinChar3`, ``)
                setValue(`pinChar4`, ``)
            } else if (field >= 0) {
                characters.push(field)
                characters.forEach((value, i) => {
                    if (i === 0) setValue(`pinChar1`, `⬤`)
                    if (i === 1) setValue(`pinChar2`, `⬤`)
                    if (i === 2) setValue(`pinChar3`, `⬤`)
                    if (i === 3) setValue(`pinChar4`, `⬤`)
                });
                if (characters.length === 4) {
                    // disable all buttons
                    setInputDisabled(true);

                    setTimeout(() => {
                        setValue(`pinChar1`, ``)
                        setValue(`pinChar2`, ``)
                        setValue(`pinChar3`, ``)
                        setValue(`pinChar4`, ``)
                    }, 2000);

                    if (currentTenant) {
                        await doLogin(currentTenant, `${characters[0]}${characters[1]}${characters[2]}${characters[3]}`)
                        //
                    } else {
                        CUSTOM.showToast("Tenant not Supported");
                    }
                }
            }
        }
    }

    const doLogin = async (currentTenant: {tenantName: string, tenantId: string, clientSecret: string}, pin: string) => {
        if (currentTenant && tenant) {
            const payload: loginUserType = {
                phoneNumber: parseInt(tenant.ussdPhoneNumber),
                pin,
                tenant: tenant.tenantId,
                clientSecret: currentTenant.clientSecret,
            };

            try {
                const {type, error}: any = await dispatch(loginUser(payload))
                if (type === 'loginUser/rejected' && error) {
                    if (error.message === "Network request failed") {
                        CUSTOM.showToast(error.message);
                    } else {
                        setError('phoneNumber', {type: 'custom', message: error.message});
                        CUSTOM.showToast(error.message);
                        setCancelFingerPrint(true);
                    }
                } else {
                    const oldBoy = await getSecureKey('existing');
                    setLocalLogin(true);
                    const fP = fingerPrint ? JSON.parse(fingerPrint) : null;
                    if (!(fingerPrint && fP && fP.phoneNumber === tenant?.ussdPhoneNumber) && !cancelFingerPrint && oldBoy !== 'true') {
                        // ask if fingerprint should be enabled
                        // save pin/phoneNumber in secureStore fingerPrint
                        return Alert.alert('Activate Biometrics', 'Proceed to add your print', [
                            {
                                text: 'Cancel',
                                onPress: async () => {
                                    setCancelFingerPrint(true);
                                    if (otpVerified === 'true') {
                                        dispatch(setAuthState(true));
                                    } else {
                                        navigation.navigate('VerifyOTP');
                                    }
                                },
                                style: 'cancel'
                            },
                            {
                                text: 'Ok',
                                onPress: async () => {
                                    const payloadFinger = {
                                        pin,
                                        phoneNumber: tenant?.ussdPhoneNumber
                                    };
                                    await Promise.all([
                                        saveSecureKey('fingerPrint', JSON.stringify(payloadFinger)),
                                        handleBiometricAuth()
                                    ]);
                                }
                            }
                        ])
                    } else {
                        if (otpVerified === 'true') {
                            dispatch(setAuthState(true));
                        } else {
                            navigation.navigate('VerifyOTP');
                        }
                        return;
                    }
                }
            } catch (e: any) {
                console.log('LOGIN ERROR', e);
            } finally {
                setInputDisabled(false);
            }
        }
    }

    if (fontsLoaded) {
        return (
            <SafeAreaView style={{ flex: 1, width, height: 8/12 * height, backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                <ScrollView contentContainerStyle={styles.container} >
                    <View style={{height: height/2, display: 'flex', justifyContent: 'space-between', position: 'relative'}}>
                        <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <TouchableOpacity onPress={() => navigation.navigate('GetTenants')} style={{marginTop: 45, marginBottom: 25, position: 'absolute', top: height/60, left: width/15}}>
                                <Ionicons name="chevron-back-sharp" size={24} color="black" />
                            </TouchableOpacity>
                            {loading &&
                                <View style={{marginTop: 45, marginBottom: 25, position: 'absolute'}}>
                                    <RotateView/>
                                </View>
                            }
                            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: height/9 }}>
                                <Text allowFontScaling={false} style={{fontSize: 12, fontFamily: 'Poppins_500Medium'}}>{tenant?.firstName + " " + tenant?.lastName}</Text>
                                <Text allowFontScaling={false} style={{fontSize: 10, fontFamily: 'Poppins_300Light'}}>{tenant?.ussdPhoneNumber}</Text>
                            </View>
                        </View>

                        <View>
                            <Text allowFontScaling={false} style={{fontSize: 10, textAlign: 'center', fontFamily: 'Poppins_300Light', textTransform: 'uppercase'}}>{tenant?.tenantName} LOGIN</Text>
                            <Text allowFontScaling={false} style={{fontSize: 10, textAlign: 'center', fontFamily: 'Poppins_300Light'}}>ENTER PIN</Text>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', paddingVertical: 10 }}>
                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                        maxLength: 1,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <View style={styles.ringContainer}>

                                                    <Ring delay={100} loading={loading}/>
                                            {
                                                value ?
                                                    <View style={styles.ring2}></View> : <></>
                                            }
                                            <TextInput
                                                allowFontScaling={false}
                                                style={{...styles.input, color: '#489AAB' }}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                editable={false}
                                                selectTextOnFocus={false}
                                            />
                                        </View >
                                    )}
                                    name="pinChar1"
                                />
                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                        maxLength: 1,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <View style={styles.ringContainer}>

                                                    <Ring delay={200} loading={loading}/>

                                            {
                                                value ?
                                                    <View style={styles.ring2}></View> : <></>
                                            }
                                            <TextInput
                                                allowFontScaling={false}
                                                style={{...styles.input, color: '#489AAB' }}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                editable={false}
                                                selectTextOnFocus={false}
                                            />
                                        </View >
                                    )}
                                    name="pinChar2"
                                />
                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                        maxLength: 1,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <View style={styles.ringContainer}>

                                                    <Ring delay={300} loading={loading}/>

                                            {
                                                value ?
                                                    <View style={styles.ring2}></View> : <></>
                                            }
                                            <TextInput
                                                allowFontScaling={false}
                                                style={{...styles.input, color: '#489AAB',}}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                editable={false}
                                                selectTextOnFocus={false}
                                            />
                                        </View >
                                    )}
                                    name="pinChar3"
                                />
                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                        maxLength: 1,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (

                                            <View style={styles.ringContainer}>

                                                <Ring delay={400} loading={loading}/>
                                                {
                                                    value ?
                                                    <View style={styles.ring2}></View> : <></>
                                                }

                                                <TextInput
                                                allowFontScaling={false}
                                                style={{...styles.input}}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                editable={false}
                                                selectTextOnFocus={false}
                                                />
                                            </View>
                                    )}
                                    name="pinChar4"
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{height: height/2.8, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
                        {[1,2,3,4,5,6,7,8,9,-2,0,-1].map(num => (
                            <TouchableHighlight disabled={inputDisabled} underlayColor='#CCCCCC' onPress={() => onPressed(num)} key={num} style={{width: width/3, height: height/11, display: 'flex', justifyContent: 'center'}}>
                                {
                                    num >= 0 ?
                                        <Text allowFontScaling={false} style={{fontSize: 20, textAlign: 'center', fontFamily: 'Poppins_400Regular'}}>{num}</Text>
                                        : num === -1 ?
                                            <Text allowFontScaling={false} style={{fontSize: 18, textAlign: 'center', fontFamily: 'Poppins_400Regular'}}>
                                                <FontAwesome5 name="fingerprint" size={24} color="black" />
                                            </Text>
                                            :
                                            <Text allowFontScaling={false} style={{fontSize: 11, textAlign: 'center', fontFamily: 'Poppins_400Regular'}}>
                                                CLEAR
                                            </Text>
                                }
                            </TouchableHighlight>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }  else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <RotateView/>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: height,
        justifyContent: 'space-between'
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium'
    },
    button: {
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 25
    },
    linkText: {
        fontSize: 14,
        textDecorationLine: 'underline',
        color: '#489AAB',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 10,
        marginTop: 10,
    },
    input: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 35,
        display: 'none'
    },
    error: {
        fontSize: 12,
        color: '#f30000',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    },
    ringContainer: {
        borderColor: '#CCCCCC',
        borderWidth: 1,
        height: 40,
        width: 40,
        marginLeft: 10,
        borderRadius: 50,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    ring: {
        position: "absolute",
        width: 20,
        height: 20,
        borderRadius: 50
    },
    ring2: {
        position: "absolute",
        width: 26,
        height: 26,
        backgroundColor: "rgba(72,154,171,0.98)",
        borderRadius: 50
    }
});
