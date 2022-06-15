import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import * as React from "react";

type NavigationProps = NativeStackScreenProps<any>;
const { width, height } = Dimensions.get("window");

const GuarantorshipStatus = ({ navigation, route }: NavigationProps) => {

    const request = route.params?.guarantor;

    return (
        <View style={{ flex: 1, alignItems: 'center', width, height }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                <ScrollView contentContainerStyle={{display: 'flex', alignItems: 'center', justifyContent: 'center', width, height: height/1.5}}>
                    <View style={{display: 'flex', alignItems: 'center'}}>
                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#489AAB', fontSize: 20, maxWidth: 250, textAlign: 'center', marginTop: (height/1.5)/30 }}>Guarantorship Request {route.params?.accepted ? 'Accepted' : 'Declined'}</Text>
                        {route.params?.accepted && <MaterialIcons name="check-circle" size={150} color="#78E49D"/>}
                        {!route.params?.accepted && <MaterialIcons name="cancel" size={150} color="#FF927A"/>}
                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 12, maxWidth: 250, textAlign: 'center', marginTop: (height/1.5)/20 }}>
                            You have {route.params?.accepted ? 'agreed' : 'declined'} to take on Guarantorship resposnsibility for <Text style={{color: '#489AAB'}}>{request?.executor}</Text> for a loan amount <Text style={{color: '#489AAB'}}>{request?.subject}</Text>
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.6)', width, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 50 }}>
                <TouchableOpacity onPress={() => alert('Done')} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginVertical: 30 }}>
                    <Text allowFontScaling={false} style={{...styles.buttonText, color: '#797979'}}>REVIEW</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => route.params?.accepted ? navigation.navigate('SignDocumentRequest', {guarantorshipRequest: route.params?.loanRequest}) : navigation.navigate('GuarantorshipRequests')} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#336DFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginVertical: 30 }}>
                    <Text allowFontScaling={false} style={styles.buttonText}>{route.params?.accepted ? 'CONTINUE' : 'DONE'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    buttonText: {
        fontSize: 12,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
})

export default GuarantorshipStatus
