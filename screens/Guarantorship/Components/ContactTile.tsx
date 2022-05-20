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
import {Ionicons} from "@expo/vector-icons";
import * as React from "react";
import Checkbox from "expo-checkbox";
import {useEffect, useState} from "react";
import {initializeDB, updateContact, validateNumber} from "../../../stores/auth/authSlice";
import {store} from "../../../stores/store";
import {useDispatch} from "react-redux";

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

    const [selectedContact, setSelectedContact] = useState<boolean>(false)
    const selectContact = async (newValue: boolean, contact: any) => {
        try {
            let phone: string = ''
            if (contact.phone[0] === '+') {
                let number = contact.phone.substring(1);
                phone = `${number.replace(/ /g, "")}`;
                phone = `${phone.substring(0, 3) === '254' ? '' : '254'}${phone}`;
                console.log('starts @+' ,phone);
            } else if (contact.phone[0] === '0') {
                let number = contact.phone.substring(1);
                console.log('starts @0', `254${number.replace(/ /g, "")}`);
                //number[number.length - 1].replace(/ /g, "")
            }

            const result: any = await dispatch(validateNumber(phone));
            const {payload, type}: {payload: any, type: string} = result

            if (type === 'validateNumber/rejected') {
                console.log(result.error.message)
                return
            }
            // update contact with member id and ref id
            if (type === "validateNumber/fulfilled") {
                const statement = `UPDATE contacts SET memberNumber = '${payload?.memberNumber}', memberRefId = '${payload?.refId}' WHERE contact_id = ${contact.contact_id};`;
                let response = await dispatch(updateContact(statement))
                console.log(response)
                return
                if (newValue) {
                    addContactToList(contact)
                } else {
                    removeContactFromList(contact)
                }
                setSelectedContact(newValue)
            }
        } catch (e: any) {
            console.log("error", e)
        }
    }


    return (
        <TouchableOpacity style={styles.main} onPress={() => selectContact(!selectedContact, contact)}>
            <View style={styles.tile} >
                <View style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', width: width/5}}>
                    <Ionicons name="person-circle" size={40} color="#CCCCCC"/>
                </View>
                <View style={{ width: width * 6.8/12 }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 15, maxWidth: 200 }}>
                        {contact.name}
                    </Text>
                    <Text style={{ fontFamily: 'Poppins_300Light', color: '#9a9a9a', fontSize: 15 }}>{contact.phone}</Text>
                </View>
                <View>
                    <Checkbox
                        style={{ width: 20 }}
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
        backgroundColor: '#FFFFFF',
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


