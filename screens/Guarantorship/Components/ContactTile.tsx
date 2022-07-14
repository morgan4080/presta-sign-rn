import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons, Octicons} from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import {useState} from "react";
import {updateContact, validateNumber} from "../../../stores/auth/authSlice";
import {store} from "../../../stores/store";
import {useDispatch} from "react-redux";
import {NativeModules} from 'react-native';

interface propInterface {
    contact: any,
    addContactToList: any
    removeContactFromList: any
}
const { width, height } = Dimensions.get("window");
export default function contactTile ({contact, addContactToList, removeContactFromList}: propInterface) {
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const CSTM = NativeModules.CSTM;

    const [selectedContact, setSelectedContact] = useState<boolean>(false)
    const selectContact = async (newValue: boolean, contact: {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}) => {
        try {
            let phone: string = ''
            if (contact.phone[0] === '+') {
                let number = contact.phone.substring(1);
                phone = `${number.replace(/ /g, "")}`;
                /*phone = `${phone.substring(0, 3) === '254' ? '' : '254'}${phone}`;*/
                console.log('starts @+' ,phone);
            } else if (contact.phone[0] === '0') {
                let number = contact.phone.substring(1);
                console.log('starts @0', `254${number.replace(/ /g, "")}`);
                phone = `254${number.replace(/ /g, "")}`;
            }

            const result: any = await dispatch(validateNumber(phone));
            const {payload, type}: {payload: any, type: string} = result;

            if (type === 'validateNumber/rejected') {
                console.log(`${contact.name} ${result.error.message}`);
                CSTM.showToast(`${contact.name} ${result.error.message}`);
                return
            }
            // update contact with member id and ref id
            let res: boolean = false;
            if (type === "validateNumber/fulfilled") {
                if (newValue) {
                    const statement = `UPDATE contacts SET memberNumber = '${payload?.memberNumber}', memberRefId = '${payload?.refId}' WHERE contact_id = ${contact.contact_id};`;
                    await dispatch(updateContact(statement));
                    // console.log('update response', response);
                    res = await addContactToList({
                       ...contact,
                        memberNumber: payload?.memberNumber,
                        memberRefId: payload?.refId
                    });
                } else {
                    removeContactFromList({
                        ...contact,
                        memberNumber: payload?.memberNumber,
                        memberRefId: payload?.refId
                    });
                }
                /*if (!res && !newValue) {
                    CSTM.showToast("Already added contact");
                }*/
                setSelectedContact(res)
            }
        } catch (e: any) {
            console.log("error", e)
        }
    }


    return (
        <TouchableOpacity style={[{backgroundColor: selectedContact ? 'rgb(50,52,146)' : '#FFFFFF'},styles.main]} onPress={() => selectContact(!selectedContact, contact)}>
            <View style={styles.tile} >
                <View style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', width: width/5}}>
                    <Ionicons name="person-circle" size={40} color="#CCCCCC"/>
                </View>
                <View style={{ width: width * 6.8/12 }}>
                    <View style={{ display: 'flex', flexDirection: 'row'}}>
                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: selectedContact ? '#FFFFFF' : '#9a9a9a', fontSize: 13, maxWidth: 200 }}>{contact.name}</Text>
                        {contact.memberNumber &&
                            <View style={{ display: 'flex', flexDirection: 'row'}}>
                                <Octicons style={{paddingLeft: 5}} name="verified" size={12} color="#336DFFFF" />
                                <Text allowFontScaling={false} style={{color: selectedContact ? '#FFFFFF' : '#cccccc', fontSize: 10}}>{contact.memberNumber}</Text>
                            </View>
                        }
                    </View>
                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: selectedContact ? '#FFFFFF' : '#9a9a9a', fontSize: 13 }}>{contact.phone}</Text>
                </View>
                <View>
                    <Checkbox
                        style={{ width: 22, height: 22 }}
                        value={selectedContact}
                        onValueChange={(newValue) => selectContact(newValue, contact)}
                        color={selectedContact ? 'rgb(50,52,146)' : '#ADADAD'}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    main: {
        marginTop: 20,
        borderRadius: 25,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 6, // Android
    },
    tile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
})


