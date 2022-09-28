import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Dimensions, View, StyleSheet, TextInput, Text, StatusBar, Pressable, NativeModules} from "react-native";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {RotateView} from "./VerifyOTP";
import {useDispatch, useSelector} from "react-redux";
import {authClient, searchByEmail, searchByPhone, storeState} from "../../stores/auth/authSlice";
import {Controller, useForm} from "react-hook-form";
import {useEffect} from "react";
import {store} from "../../stores/store";

const {CSTM} = NativeModules;

const { width, height } = Dimensions.get("window");

type NavigationProps = NativeStackScreenProps<any>;

type FormData = {
    pin: string;
    pinConfirmation: string;
}

const SetPin = ({ navigation, route }: NavigationProps) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const {
        control,
        watch,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<FormData>({})

    const { selectedTenant } = useSelector((state: { auth: storeState }) => state.auth);

    const {phoneNumber, email, realm, client_secret}: any = route.params;

    const onSubmit = ({pin, pinConfirmation}: FormData) => {
        console.log(pin, pinConfirmation);
    }

    const {} = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let start = true;

        (async () => {
            const {type, payload} : any = await dispatch(authClient({realm, client_secret}))

            if (type === 'authClient/fulfilled') {
                const { access_token } = payload;

                if (phoneNumber) {
                    const response = await dispatch(searchByPhone({phoneNumber, access_token}))

                    if (response.type === 'searchByPhone/fulfilled') {
                        console.log('searchByPhone,,,', response.payload)

                    } else {
                        console.error('searchByPhone,error', response.payload)
                    }
                }

                if (email) {
                    const response = await dispatch(searchByEmail({email, access_token}))

                    if (response.type === 'searchByEmail/fulfilled') {
                        console.log('searchByEmail,,,', response.payload)

                    } else {
                        console.error('searchByEmail error', response.payload)
                    }
                }

            } else {
                CSTM.showToast("Couldn't authenticate client")
            }
            console.log(type)
        })()

        return () => {
            start = false;
        }
    }, [])

    if (fontsLoaded) {
        return (
            <View style={styles.container}>
                <Text allowFontScaling={false} style={{ color: '#489AAB', fontFamily: 'Poppins_400Regular', fontSize: 14, paddingHorizontal: 5 }} >Pin</Text>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                        maxLength: 4,
                        minLength: 4
                    }}
                    render={( { field: { onChange, onBlur, value } }) => (
                        <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            value={value}
                            autoFocus={false}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            maxLength={4}
                            onChange={() => clearErrors()}
                            placeholder="Enter Pin"
                            keyboardType="number-pad"
                            secureTextEntry={true}
                        />
                    )}
                    name="pin"
                />
                {
                    errors.pin &&
                    <Text  allowFontScaling={false}  style={styles.error}>{errors.pin?.message ? errors.pin?.message : 'Invalid Pin'}</Text>
                }
                <Text allowFontScaling={false} style={{ color: '#489AAB', marginTop: 20, fontFamily: 'Poppins_400Regular', fontSize: 14, paddingHorizontal: 5 }}>Pin Confirmation</Text>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                        maxLength: 4,
                        minLength: 4,
                        validate: value => value === getValues('pin')
                    }}
                    render={( { field: { onChange, onBlur, value } }) => (
                        <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            maxLength={4}
                            onChange={() => clearErrors()}
                            placeholder="Enter Pin Confirmation"
                            keyboardType="number-pad"
                            secureTextEntry={true}
                        />
                    )}
                    name="pinConfirmation"
                />
                {
                    errors.pinConfirmation &&
                    <Text  allowFontScaling={false}  style={styles.error}>{errors.pinConfirmation?.message ? errors.pinConfirmation?.message : 'Invalid Pin Confirmation'}</Text>
                }

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 50, marginBottom: 5 }}>
                    <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
                        <Text allowFontScaling={false} style={styles.buttonText}>Save</Text>
                    </Pressable>
                </View>
            </View>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <RotateView/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#FFFFFF'
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 20,
        height: 45,
        marginTop: 10,
        paddingHorizontal: 20,
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular'
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    },
    button: {
        backgroundColor: '#3D889A',
        elevation: 3,
        borderRadius: 50,
        paddingHorizontal: 15,
        paddingVertical: 7,
        width: '99%'
    },
    buttonText: {
        fontSize: 14,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_400Regular',
    },
})

export default SetPin
