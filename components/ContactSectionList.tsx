import {SectionList, StyleSheet, Text, View, TouchableOpacity, NativeModules, Dimensions} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {storeState} from "../stores/auth/authSlice";
import {useSelector} from "react-redux";
import Cry from "../assets/images/cry.svg"

type contactType = {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}

type propType = {
    contactsData: {id: number, title: string, data: contactType[]}[],
    searching: any,
    addContactToList: any
    removeContactFromList: any
    contactList: any
    onPress: any
    setEmployerDetailsEnabled: any
}

const getAbbreviation = (name: string) => {
    return name[0]
}

const { width, height } = Dimensions.get("window");

const Item = ({ contact, removeContact, contactList, section, onPress, setEmployerDetailsEnabled }: { contact: contactType, removeContact: any, contactList: any, section: any, setEmployerDetailsEnabled: any, onPress: any }) => {
    const isChecked = contactList.find((con: any ) => con.memberNumber === contact.memberNumber);
    if (section.id === 2) {
        return contact.name ? (
            <TouchableOpacity onPress={async () => {
                removeContact({
                    ...contact
                });
            }} style={{
                ...styles.item,
                backgroundColor: isChecked ? 'rgba(72,154,171,0.77)' : '#FFFFFF'
            }}>
                <View style={{flex: 0.1}}>
                    {
                        isChecked ?

                            <Ionicons name="radio-button-on-sharp" size={24} color="white"/>

                            :

                            <View
                                style={{width: 22, height: 22, borderWidth: 1, borderRadius: 50, borderColor: '#CCCCCC'}}/>
                    }
                </View>
                <View style={{flex: 0.13}}>
                    <View style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        backgroundColor: '#489AAB',
                        borderRadius: 50
                    }}>
                        <Text allowFontScaling={false} style={{
                            ...styles.title,
                            fontSize: 12,
                            color: '#FFFFFF'
                        }}>{getAbbreviation(contact.name).toUpperCase()}</Text>
                    </View>
                </View>
                <View style={{flex: 0.67}}>
                    <Text allowFontScaling={false}
                          style={{...styles.title, color: isChecked ? '#FFFFFF' : '#393a34', fontSize: 13, fontFamily: 'Poppins_500Medium'}}>{contact.name}</Text>
                    <Text allowFontScaling={false}
                          style={{...styles.title, color: isChecked ? '#FFFFFF' : '#393a34', fontSize: 12, fontFamily: 'Poppins_300Light'}}>{contact.phone}</Text>
                </View>
                <Text allowFontScaling={false} style={{
                    ...styles.title,
                    fontSize: 10,
                    flex: 0.1,
                    color: isChecked ? '#FFFFFF' : '#393a34'
                }}>{contact.memberNumber}</Text>
            </TouchableOpacity>
        ): (
            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
                <Cry width={width/2} height={height/3}/>
                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_300Light', fontSize: 10, marginRight: 10, color: '#737373', textAlign: 'center', width: '66%'}}>Enter for your preferred guarantor’s phone number/ member number above. Or select “👤” to add members directly from your contacts’ list.</Text>
            </View>
        )
    } else if (section.id === 1) {
        return (
            <TouchableOpacity onPress={() => {
                setEmployerDetailsEnabled(false);
                onPress('options');
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20}}>
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

const ContactSectionList = ({contactsData, searching, addContactToList, removeContactFromList, contactList, onPress, setEmployerDetailsEnabled}: propType) => {

    const { loading } = useSelector((state: { auth: storeState }) => state.auth);

    const removeContact = async (contact: {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}) => {
        removeContactFromList(contact);
    };

    return (
        <>
            <SectionList
                refreshing={loading}
                onRefresh={() => console.log('refresh')}
                progressViewOffset={20}
                sections={contactsData}
                keyExtractor={(item, index) => item.name + index}
                renderItem={({ item, section }) => (<Item contact={item} section={section} removeContact={removeContact} contactList={contactList} onPress={onPress} setEmployerDetailsEnabled={setEmployerDetailsEnabled} />)}
                renderSectionHeader={({ section: { title, data } }) => (<Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Poppins_300Light', paddingHorizontal: 20, paddingVertical: title !== 'OPTIONS' ? 10 : 0, backgroundColor: '#FFFFFF' }}>{title}</Text>)}
                stickySectionHeadersEnabled={true}
                ListFooterComponent={<View style={{height: 75}} />}
            />
        </>
    )
};

const styles = StyleSheet.create({
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        padding: 20
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
});

export default ContactSectionList;
