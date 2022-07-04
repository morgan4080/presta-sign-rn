import {
    Dimensions,
    Image, Keyboard,
    NativeModules,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from "react-native";
import {RotateView} from "../Auth/VerifyOTP";
const { width, height } = Dimensions.get("window");
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import AppLoading from "expo-app-loading";
import {Controller, useForm} from "react-hook-form";
import {authenticate, getTenants, storeState} from "../../stores/auth/authSlice";
import {useDispatch, useSelector} from "react-redux";
import {store} from "../../stores/store";
import {useEffect, useRef} from "react";

type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    phoneNumber: string | undefined;
}
const GetTenants = ({ navigation }: NavigationProps) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const { isJWT, isLoggedIn, loading, tenants } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const CSTM = NativeModules.CSTM;

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const response = await dispatch(authenticate());
                if (response.type === 'authenticate/rejected') {
                    return
                }
                if (response.type === 'authenticate/fulfilled') {
                    navigation.navigate('VerifyOTP')
                }
            })()
        }
        return () => {
            Keyboard.removeAllListeners('keyboardDidShow');
            authenticating = false
        }
    }, []);

    useEffect(() => {
        let isLoggedInSubscribed = true;
        if (isLoggedIn) {
            if (isLoggedInSubscribed) navigation.navigate('VerifyOTP')
        }
        return () => {
            // cancel the subscription
            isLoggedInSubscribed = false;
        };
    }, [isLoggedIn]);

    useEffect(() => {
        let tenantsFetched = true;

        if (tenants.length > 0 && tenantsFetched) {
            navigation.navigate('ShowTenants');
        }  else {
            setError('phoneNumber', {type: 'custom', message: "Kindly check the number and try again"});
        }

        return () => {
            tenantsFetched = false;
        };
    }, [tenants])

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {
            phoneNumber: '',
        }
    })

    const onSubmit = async (value: any): Promise<void> => {
        if (value) {
            try {
                if (value.phoneNumber.length < 12) {
                    setError('phoneNumber', {type: 'custom', message: 'Please provide a valid phone number'});
                    return
                }
                const { type, error }: any = await dispatch(getTenants(value.phoneNumber))
                if (type === 'getTenants/rejected' && error) {
                    if (error.message === "Network request failed") {
                        CSTM.showToast(error.message);
                    } else {
                        setError('phoneNumber', {type: 'custom', message: error.message});
                    }
                }
            } catch (e: any) {
                console.log('Error Get Tenants', e);
            }
        }
    }

    const scrollViewRef = useRef<any>();

    Keyboard.addListener('keyboardDidShow', () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    });

    if (!isJWT && fontsLoaded) {
        return (
            <>
                <SafeAreaView style={{
                    flex: 1,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    backgroundColor: '#F8F8FA'
                }}>
                    <ScrollView  ref={scrollViewRef} contentContainerStyle={styles.container}>
                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                            <Image
                                style={styles.landingLogo}
                                source={require('../../assets/images/DarkLogo.png')}
                            />
                        </View>
                        <View style={styles.container2}>
                            <Text allowFontScaling={false} style={styles.titleText}>Enter registered phone number</Text>
                            <Text allowFontScaling={false} style={styles.subTitleText}>Verify Membership</Text>
                            <View style={{ paddingHorizontal: 30 }}>
                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                        maxLength: 12,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            autoFocus={true}
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="254722000000"
                                            keyboardType="numeric"
                                        />
                                    )}
                                    name="phoneNumber"
                                />
                                {errors.phoneNumber && <Text  allowFontScaling={false}  style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Kindly use the required format'}</Text>}

                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
                <View style={{ backgroundColor: '#489AAB', width, display: 'flex', flexDirection: 'row', justifyContent: 'center', position: 'relative' }}>
                    {!loading && <TouchableOpacity onPress={handleSubmit(onSubmit)} style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderColor: '#FFFFFF',
                        borderWidth: 1,
                        width: width / 2,
                        paddingHorizontal: 20,
                        paddingVertical: 15,
                        borderRadius: 25,
                        marginTop: 45,
                        marginBottom: 25
                    }}>
                        <Text allowFontScaling={false} style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>}
                    {loading &&
                        <View style={{marginTop: 45, marginBottom: 25}}>
                            <RotateView/>
                        </View>
                    }
                </View>
            </>
        )
    } else {
        return (<AppLoading/>)
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width,
        height: height - height/3
    },
    container2: {
        display: 'flex',
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
    titleText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_600SemiBold',
        paddingTop: 10,
        marginBottom: 10,
    },
    subTitleText: {
        fontSize: 13,
        marginHorizontal: 40,
        textAlign: 'center',
        color: '#8d8d8d',
        fontFamily: 'Poppins_400Regular'
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
    landingLogo: {
        marginTop: height/8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 20,
        height: 60,
        marginTop: 30,
        paddingHorizontal: 20,
        fontSize: 14
    },
    error: {
        fontSize: 12,
        color: '#f30000',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    }
});

export default GetTenants;
