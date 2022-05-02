import * as React from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Animated,
    Easing,
    Button
} from 'react-native';
import AppLoading from 'expo-app-loading';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { sendOTP, authenticate, setLoading } from "../../stores/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../stores/store";
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useRef, useState} from "react";
// import types
import { storeState, loginUserType } from "../../stores/auth/authSlice"
import {Ionicons} from "@expo/vector-icons";
import {UseFormWatch} from "react-hook-form/dist/types/form";
import Colors from "../../constants/Colors";


type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    otpChar1?: string | undefined;
    otpChar2?: string | undefined;
    otpChar3?: string | undefined;
    otpChar4?: string | undefined;
}

const RotateView = () => {
    const rotateAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.loop(
            Animated.timing(
                rotateAnim,
                {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true
                }
            )
        ).start();
    }, [rotateAnim])

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })

    return (
        <Animated.Image
            style={{transform: [{rotate: spin}] }}
            source={require('../../assets/images/OTPloader.png')} />
    );
}

export default function VerifyOTP({ navigation }: NavigationProps) {

    const { isLoggedIn, user, loading, otpSent } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        dispatch(authenticate()).then(() => {
            if (user && !otpSent) {
                dispatch(sendOTP(user.username))
            }
        })
    }, []);

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            navigation.navigate('Login')
        }
    }, [isLoggedIn, loading, user, otpSent]);


    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>()

    const onSubmit = async (value: any): Promise<void> => {
        console.log(value)
        dispatch(setLoading(true))
    }
    let newValues: FormData
    useEffect(() => {
        const subscription = watch((value) => {
            newValues = [value].reduce((acc, { otpChar1, otpChar2, otpChar3, otpChar4 }) => {
                return {
                    otpChar1: otpChar1 ?  otpChar1.slice(0, 1) : undefined,
                    otpChar2: otpChar2 ?  otpChar2.slice(0, 1) : undefined,
                    otpChar3: otpChar3 ?  otpChar3.slice(0, 1) : undefined,
                    otpChar4: otpChar4 ?  otpChar4.slice(0, 1) : undefined,
                }
            },{});
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const [valueInput, setValueInput] = useState("")

    const onChange = (e: any) => {
        setValueInput(e)
    }

    useEffect(() => {
        console.log(valueInput)
    }, [valueInput])

    const resendOTP = () => (user && dispatch(sendOTP(user.username)))

    if (isLoggedIn && fontsLoaded) {
        return(
            <ScrollView contentContainerStyle={styles.container}>
                <View>
                    <Text style={styles.titleText}>Verify account</Text>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <Image
                            style={styles.landingLogo}
                            source={require('../../assets/images/verifyillustration.png')}
                        />
                    </View>

                    <Text style={styles.titleText1}>Enter your verification code</Text>
                    <Text style={styles.subTitleText1}>Kindly enter the verification code that was sent to <Text style={{textDecorationLine: 'underline'}}>{user && user.username}</Text></Text>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, position: 'relative' }}>
                        <TextInput
                            style={{ position: 'absolute', top: 0, height: 70, width: '100%', zIndex: 1, opacity: 0 }}
                            onChangeText={onChange}
                            keyboardType="numeric"
                            selectTextOnFocus={false}
                            value={valueInput}
                            defaultValue={valueInput}
                        />
                        <Controller
                            control={control}
                            rules={{
                                required: true,
                                maxLength: 1,
                            }}
                            render={( { field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="*"
                                    placeholderTextColor="#FFFFFF"
                                    keyboardType="numeric"
                                    editable={false}
                                    selectTextOnFocus={false}
                                />
                            )}
                            name="otpChar1"
                        />
                        <Controller
                            control={control}
                            rules={{
                                required: true,
                                maxLength: 1,
                            }}
                            render={( { field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="*"
                                    placeholderTextColor="#FFFFFF"
                                    keyboardType="numeric"
                                    editable={false}
                                    selectTextOnFocus={false}
                                />
                            )}
                            name="otpChar2"
                        />
                        <Controller
                            control={control}
                            rules={{
                                required: true,
                                maxLength: 1,
                            }}
                            render={( { field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="*"
                                    placeholderTextColor="#FFFFFF"
                                    keyboardType="numeric"
                                    editable={false}
                                    selectTextOnFocus={false}
                                />
                            )}
                            name="otpChar3"
                        />
                        <Controller
                            control={control}
                            rules={{
                                required: true,
                                maxLength: 1,
                            }}
                            render={( { field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="*"
                                    placeholderTextColor="#FFFFFF"
                                    keyboardType="numeric"
                                    editable={false}
                                    selectTextOnFocus={false}
                                />
                            )}
                            name="otpChar4"
                        />
                    </View>

                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => resendOTP()} >
                            <Text style={styles.subTitleText1}>
                                Did't receive code? <Text style={{ textDecorationLine: 'underline' }}>Resend code</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: 100 }}>
                    {loading && <RotateView/>}
                </View>
            </ScrollView>
        )
    } else {
        return (
            <AppLoading/>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: '#489AAB'
    },
    titleText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 100,
    },
    titleText1: {
        fontSize: 25,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 20,
    },
    subTitleText1: {
        fontSize: 16,
        paddingHorizontal: 60,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 30,
    },
    landingLogo: {
        marginTop: 50,
    },
    input: {
        textAlign: 'center',
        borderColor: '#ffffff',
        color: '#ffffff',
        borderWidth: 2,
        borderRadius: 20,
        height: 70,
        width: 70,
        marginTop: 30,
        paddingHorizontal: 20,
        fontSize: 30
    },
    loader: {

    }
})
