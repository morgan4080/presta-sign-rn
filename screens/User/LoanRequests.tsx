import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {fetchLoanRequests, storeState} from "../../stores/auth/authSlice";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../../stores/store";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {useEffect} from "react";
import LoanRequest from "./Components/LoanRequest";
import {RotateView} from "../Auth/VerifyOTP";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function LoanRequests ({ navigation }: NavigationProps) {
    const { loading, user, member, loanRequests } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;
        if (user) {
            (async () => {
                const {type, error}: any = await dispatch(fetchLoanRequests(member?.refId as string));
                if (type === 'fetchLoanRequests/rejected' && error) {
                    return
                }
                if (type === 'fetchLoanRequests/fulfilled') {
                    return
                }
            })()
        }
        return () => {
            isMounted = false;
        };
    }, []);


    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    if (fontsLoaded && !loading) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            width,
                            height: 1/12 * height
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Modal')} style={{ marginRight: 20, marginLeft: 15 }}>
                                <AntDesign name="arrowleft" size={24} color="#489AAB" />
                            </TouchableOpacity>
                            <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_700Bold', fontSize: 18 }}>Your Loan Requests</Text>
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: 11/12 * height }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50 }}>
                                {
                                    loanRequests && loanRequests.map((loan, i) => (
                                        <LoanRequest key={i} loan={loan}  />
                                    ))
                                }
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                </View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
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
        position: 'relative'
    },
    tile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        marginTop: 20,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFFFFF',
        elevation: 2, // Android
    },
    progress: {
        backgroundColor: '#489AAB',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    }
});
