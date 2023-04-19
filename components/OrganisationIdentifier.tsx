import * as React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from "react-native";
import OrganisationSelected from "./OrganisationSelected";
import { useEffect } from "react";
import { AuthenticateClient, setSelectedTenant } from "../stores/auth/authSlice";
import { AntDesign } from "@expo/vector-icons";
import { deleteSecureKey } from "../utils/secureStore";
import { Poppins_500Medium, useFonts } from "@expo-google-fonts/poppins";
import { useAppDispatch, useSelectedTenant } from "../stores/hooks";
import { RootStackScreenProps } from "../types";
import {showSnack} from "../utils/immediateUpdate";
import { Raleway_600SemiBold, useFonts as useRale } from '@expo-google-fonts/raleway';
const OrganisationIdentifier = ({ navigation, route }: RootStackScreenProps<"SetTenant">) => {
    const [selectedTenant] = useSelectedTenant();
    const dispatch= useAppDispatch();
    useFonts({
        Poppins_500Medium
    });

    useRale({
        Raleway_600SemiBold
    });

    useEffect(() => {
        let changing = true;
        if (changing && route.params?.selectedTenant) {
            deleteSecureKey("access_token").then(() => dispatch(setSelectedTenant(route.params?.selectedTenant))).catch(error => console.log(error))
        }
        return () => {
            changing = false;
        }
    }, [route.params?.selectedTenant]);

    useEffect(() => {
        let changing = true;
        if (selectedTenant && changing) {
            dispatch(AuthenticateClient(selectedTenant)).then((response: any) => {
                if (response.type === 'AuthenticateClient/rejected' && response.error) {
                    throw (response.error.message)
                }
            }).catch(error => {
                showSnack(`AuthenticateClient: ${error}`, "ERROR")
            })
        }
        return () => {
            changing = false;
        }
    }, [selectedTenant, route.params?.selectedTenant]);

    return (
        <>
            <TouchableOpacity style={{...styles.input, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}} onPress={() => navigation.navigate('Organisations')}>
                <View style={[styles.inputContainer, styles.shadowProp]}>
                    {
                        selectedTenant && selectedTenant.tenantName ? <View style={[styles.animatedView]}>
                            <Text allowFontScaling={false} style={styles.label}>
                                Organisation
                            </Text>
                        </View> : null
                    }

                    <Text 
                        allowFontScaling={false}
                        style={[styles.input, {color: selectedTenant && selectedTenant.tenantName ? "#393a34" : "#0082A0"}]}
                    >
                        { selectedTenant && selectedTenant.tenantName ? selectedTenant.tenantName : "SELECT ORGANISATION" }
                    </Text>

                    <AntDesign style={{position: "absolute", right: 10}} name="right" size={20} color="#393a34" />
                </View>
            </TouchableOpacity>
            <OrganisationSelected tenantId={selectedTenant?.tenantId} parentProps={{navigation, route}} />
        </>
    )
}

const styles = StyleSheet.create({
    input: {
        letterSpacing: 0.4,
        fontSize: 14,
        color: '#000000',
        lineHeight: 10,
        paddingTop: 14,
        fontFamily: 'Poppins_500Medium'
    },

    label: {
        fontSize: 12,
        color: '#0082A0',
        fontFamily: 'Raleway_600SemiBold',
        lineHeight: 16,
        // textTransform: "capitalize"
    },

    animatedView: {
        position: "absolute",
        top: 3,
        paddingHorizontal: 14,
        zIndex: 1
    },

    inputContainer: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        backgroundColor: '#EFF3F4',
        borderRadius: 12,
        width: "100%",
        marginTop: 16,
        height: 56,
        paddingHorizontal: 14
    },

    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.008,
        shadowRadius: 3,
    },
});

export default OrganisationIdentifier;
