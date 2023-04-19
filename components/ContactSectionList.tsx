import {SectionList, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {AntDesign, Ionicons} from "@expo/vector-icons";
import {addFavouriteGuarantor, storeState} from "../stores/auth/authSlice";
import {useSelector} from "react-redux";
import {showSnack} from "../utils/immediateUpdate";
import {useAppDispatch, useMember} from "../stores/hooks";
import {Poppins_300Light, Poppins_400Regular, useFonts} from "@expo-google-fonts/poppins";
import {toMoney} from "../screens/User/Account";

type contactType = {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string, amountToGuarantee: any}

type propType = {
    contactsData: {id: number, title: string, data: contactType[]}[];
    removeContactFromList: any;
    contactList: any;
    onPress: any;
}

const Item = ({ contact, removeContact, contactList, section, onPress }: { contact: contactType; removeContact: any; contactList: any; section: any; onPress: any }) => {
    useFonts([
        Poppins_300Light,
        Poppins_400Regular
    ])
    const isChecked = contactList.find((con: any ) => con.memberNumber === contact.memberNumber)
    const [member] = useMember()
    const dispatch = useAppDispatch()
    const addFav = () => {
        if (member) {
            const payload = {
                "memberRefId": member.refId,
                "guarantorRefId": contact.memberRefId
            }

            dispatch(addFavouriteGuarantor(payload)).then(response => {
                if (response.type === "addFavouriteGuarantor/fulfilled") {
                    console.log("xx", response.payload)
                    showSnack("Added to favourite guarantors", "SUCCESS")
                }
            }).catch(error => {
                console.warn(error)
            })
        }
    }
    const removeCont = () => {
        removeContact({
            ...contact
        });
    }

    if (section.id === 2) {
        return contact.name ? (
            <View  style={{
                ...styles.item,
                backgroundColor: isChecked ? 'rgba(72,154,171,0.25)' : '#FFFFFF',
                marginHorizontal: 16,
                marginVertical: 5,
                borderRadius: 12,
                borderColor: 'rgba(0,0,0,0.09)',
            }}>
                <View style={{flex: 0.1}}>
                    {
                        isChecked ?

                            <Ionicons name="radio-button-on-sharp" size={24} color="#489AAB"/>

                            :

                            <View
                                style={{width: 22, height: 22, borderWidth: 1, borderRadius: 50, borderColor: '#489AAB'}}/>
                    }
                </View>
                <View style={{flex: 0.8}}>
                    <Text allowFontScaling={false}
                          style={{...styles.title, color: isChecked ? '#393a34' : '#393a34', fontSize: 13, fontFamily: 'Poppins_500Medium'}}>{contact.name}</Text>
                    <Text allowFontScaling={false}
                          style={{...styles.title, letterSpacing: 0.2, color: isChecked ? '#393a34' : '#393a34', fontSize: 12, fontFamily: 'Poppins_300Light'}}>{contact.phone} | {contact.memberNumber} {contact.amountToGuarantee ? ` | ${toMoney(contact.amountToGuarantee)}` : ""}</Text>
                </View>
                {/*<TouchableOpacity onPress={() => addFav()} style={{flex: 0.13}}>
                    <MaterialIcons name="bookmark" size={40} color="#489AAB" />
                </TouchableOpacity>*/}
                <TouchableOpacity onPress={() => removeCont()} style={{flex: 0.1, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                    <AntDesign name="deleteuser" size={24} color="#489AAB" />
                </TouchableOpacity>
            </View>
        ): (
            <View style={{display: 'flex', flexDirection: "row", justifyContent: 'space-around', alignItems: 'center', margin: 16, paddingHorizontal: 10}}>
                <AntDesign name="infocirlceo" size={24} color="#6e5638" />
                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, letterSpacing: 0.7, color: '#6e5638', width: "80%" }}>
                    Add guarantors using phone number or member number on the above text input.
                </Text>
            </View>
        )
    } else if (section.id === 1) {
        return (
            <TouchableOpacity onPress={() => {
                onPress('options');
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 20}}>
                <View style={styles.optionsButton} >
                    <Ionicons name="options-outline" size={20} color="white" style={{padding: 5}} />
                </View>
                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_400Regular', color: '#000000', fontSize: 10, paddingLeft: 10 }}>OPTIONS</Text>
            </TouchableOpacity>
        )
    } else {
        return (
            <></>
        )
    }
};

const ContactSectionList = ({contactsData, removeContactFromList, contactList, onPress}: propType) => {

    useFonts([
        Poppins_300Light,
        Poppins_400Regular
    ])

    const { loading } = useSelector((state: { auth: storeState }) => state.auth);

    const removeContact = async (contact: {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}) => {
        removeContactFromList(contact);
    };

    return (
        <SectionList
            refreshing={loading}
            onRefresh={() => console.log('refresh')}
            progressViewOffset={20}
            sections={contactsData}
            keyExtractor={(item, index) => item.name + index}
            renderItem={({ item, section }) => (
                <Item
                    contact={item}
                    section={section}
                    removeContact={removeContact}
                    contactList={contactList}
                    onPress={onPress}
                />
            )}
            renderSectionHeader={({ section: { title, data } }) => (
                <Text
                    allowFontScaling={false}
                    style={[styles.label, { paddingVertical: title !== 'OPTIONS' ? 10 : 0 }]}
                >
                    {title}
                </Text>
            )}
            stickySectionHeadersEnabled={true}
        />
    )
};

const styles = StyleSheet.create({
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "#FFFFFF",
        paddingVertical: 15,
        paddingHorizontal: 20
    },
    title: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular'
    },
    optionsButton: {
        backgroundColor: '#489AAB',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        width: 35,
        height: 35,
    },
    label: {
        fontSize: 12,
        color:'#393a34',
        marginHorizontal: 16,
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10
    }
});

export default ContactSectionList;
