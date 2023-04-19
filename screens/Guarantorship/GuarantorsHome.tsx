import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
    LoadOrganisation,
    searchByMemberNo,
    validateNumber
} from "../../stores/auth/authSlice";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity
} from "react-native";
type NavigationProps = NativeStackScreenProps<any>;
import {useForm} from "react-hook-form";
import {AntDesign} from "@expo/vector-icons";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {getContact, requestPhoneNumberFormat} from "../../utils/smsVerification";
import {getSecureKey} from "../../utils/secureStore";
import {cloneDeep} from "lodash";
import ContactSectionList from "../../components/ContactSectionList";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop  } from "@gorhom/bottom-sheet";
import {toMoney} from "../User/Account";
import {showSnack} from "../../utils/immediateUpdate";
import TextField from "../../components/TextField";
import TouchableButton from "../../components/TouchableButton";
import {
    useAppDispatch, useClientSettings,
    useLoading,
    useMember,
    useSettings,
} from "../../stores/hooks";
import {Poppins_300Light, Poppins_400Regular, useFonts} from "@expo-google-fonts/poppins";
import GenericModal from "../../components/GenericModal";
import {reset} from "react-native-svg/lib/typescript/lib/Matrix2D";
type searchedMemberType = { contact_id: string; memberNumber: string; memberRefId: string; name: string; phone: string }
type FormData = {
    searchTerm: string;
    amountToGuarantee: string | undefined;
    employerName: string;
    employerDetails: boolean;
    serviceNo: string;
    grossSalary: string;
    netSalary: string;
    kraPin: string;
    businessLocation: string;
    businessType: string;
};
type employerPayloadType = {
    employerName: string | undefined;
    serviceNo: string | undefined;
    grossSalary: string | undefined;
    netSalary: string | undefined;
    kraPin: string | undefined;
};
type businessPayloadType = {
    businessLocation: string | undefined;
    businessType: string | undefined;
    kraPin: string | undefined;
};
const { width } = Dimensions.get("window");

const GuarantorsHome = ({ navigation, route }: NavigationProps) => {
    const [member] = useMember();
    const [loading] = useLoading();
    const [settings] = useSettings();
    const [clientSettings] = useClientSettings();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(LoadOrganisation())
            .catch((error) => showSnack(error.message, "ERROR"))
    }, []);

    useFonts([
        Poppins_300Light,
        Poppins_400Regular
    ]);

    const {
        control,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        getValues,
        watch,
        formState: { errors }
    } = useForm<FormData>();

    const [context, setContext] = useState<string>("");

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    const [allGuaranteedAmounts, setAllGuaranteedAmounts] = useState<string[]>([]);

    const [heldMember, setHeldMember] = useState<searchedMemberType | null>(null);

    const [employerPayload, setEmployerPayload] = useState<employerPayloadType>();

    const [businessPayload, setBusinessPayload] = useState<businessPayloadType>();

    const [currentGuarantor, setCurrentGuarantor] = useState<{contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}>()

    const requiredGuarantors = () => {
        if (route.params?.loanProduct.requiredGuarantors === 0) {
            return 0
        } else if (route.params?.loanProduct.requiredGuarantors) {
            return route.params?.loanProduct.requiredGuarantors
        } else if (settings) {
            return settings.minGuarantors
        } else {
            return 1
        }
    }

    const removeContactFromList = (contact2Remove: {contact_id: string, memberNumber: string,memberRefId: string,name: string,phone: string}): boolean => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let index = newDeserializedCopy.findIndex(contact => contact.contact_id === contact2Remove.contact_id);
        newDeserializedCopy.splice(index, 1);
        let amountsToG: any[] = cloneDeep(allGuaranteedAmounts);
        amountsToG.splice(index, 1);
        setAllGuaranteedAmounts(amountsToG);
        setSelectedContacts(newDeserializedCopy);
        return true;
    };

    const searchMemberByPhone = async (phone: string): Promise<searchedMemberType | undefined> => {
        const {payload, type, error}: {payload: any, type: string, error?: any} = await dispatch(validateNumber(phone));

        if (type === 'validateNumber/rejected') {
            showSnack(`${phone} ${error?.message}`, "WARNING");
            return undefined;
        }

        if (type === "validateNumber/fulfilled" && member) {
            return {
                contact_id: `${Math.floor(Math.random() * (100000 - 10000)) + 10000}`,
                memberNumber: `${payload.memberNumber}`,
                memberRefId: `${payload.refId}`,
                name: `${payload.firstName}`,
                phone: `${payload.phoneNumber}`
            };
        }
    }

    const searchMemberByMemberNo = async (member_no: string): Promise<searchedMemberType | undefined> => {
        const {payload, type}: {payload: any, type: string, error?: any} = await dispatch(searchByMemberNo(member_no));

        if (type === 'searchByMemberNo/rejected') {
            showSnack(`${member_no}: is not a member.`, "WARNING");
            return undefined;
        }

        if (type === "searchByMemberNo/fulfilled" && member) {
            if (payload && !payload.hasOwnProperty("firstName")) {
                showSnack(`${member_no}: is not a member.`, "WARNING");
                return undefined;
            }

            return {
                contact_id: `${Math.floor(Math.random() * (100000 - 10000)) + 10000}`,
                memberNumber: `${payload.memberNumber}`,
                memberRefId: `${payload.refId}`,
                name: `${payload.firstName}`,
                phone: `${payload.phoneNumber}`
            }
        }
    }

    const isDuplicateGuarantor = (member: searchedMemberType) => {
        return cloneDeep(selectedContacts).some((contact) => (member.phone === contact.phone || member.memberRefId === contact.memberRefId));
    }

    const addContactToList = async (searchedMember: searchedMemberType | undefined) => {
        if (searchedMember) {
            if (!isDuplicateGuarantor(searchedMember)) {
                // if amount required take it
                if (settings && settings.guarantors === 'value' && settings.amounts) {
                    setCurrentGuarantor(searchedMember);

                    setContext('amount');

                    setHeldMember(searchedMember);

                    handleSnapPress(1);

                    return Promise.resolve();

                } else if (settings && settings.guarantors === 'count' && member) {
                    // calculate amount to guarantee
                    const theAmount = (selectedContacts.length <= 4) ? route.params?.loanDetails.desiredAmount/requiredGuarantors() : route.params?.loanDetails.desiredAmount/selectedContacts.length;

                    const amountsToG: any[] = cloneDeep(allGuaranteedAmounts);

                    amountsToG.push(theAmount);

                    setAllGuaranteedAmounts(amountsToG);

                    const newDeserializedCopy: any[] = cloneDeep(selectedContacts);

                    newDeserializedCopy.push(searchedMember);

                    setSelectedContacts(newDeserializedCopy);

                    handleClosePress();

                    return Promise.resolve()
                }
            } else {
                handleClosePress();
                return Promise.reject("Duplicate Entry");
            }
        } else {
            return Promise.reject("Member not provided")
        }
    }

    const un_guaranteed = () => {
        return `${route.params?.loanDetails.desiredAmount - calculateGuarantorship(route.params?.loanDetails.desiredAmount)}`;
    }

    // add to sectionList
    // ${route.params?.loanProduct.requiredGuarantors} ${route.params?.loanProduct.requiredGuarantors == 1 ? 'Guarantor' : 'Guarantors'}`

    const calculateGuarantorship = useCallback((amount: string): any => {
        if (settings && settings.guarantors) {
            if (settings.guarantors === 'value') {
                // sum all guarantors amount inputs until they equal amount
                // when sum === amount stop ability to add guarantors
                let summation = allGuaranteedAmounts.reduce((a, b) => {
                    return a + parseInt(b)
                }, 0);

                return `${summation}`
            }
            if (settings.guarantors === 'count') {
                // split requiredGuarantors to amount
                // when sum === amount stop ability to add guarantors

                let summation = allGuaranteedAmounts.reduce((a, b) => {
                    return a + parseInt(b)
                }, 0);

                return `${summation}`
            }
            return "0"
        }
        return amount
    },[allGuaranteedAmounts]);

    const isDisabled = () => {
        if (requiredGuarantors() === 0) return false
        let reminder = route.params?.loanDetails.desiredAmount - calculateGuarantorship(route.params?.loanDetails.desiredAmount);
        if (reminder > 2) {
            return true
        }
        return selectedContacts.length < requiredGuarantors();
    }

    const sheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

    // callbacks
    const handleSheetChange = useCallback((index: any) => {
        console.log("handleSheetChange", index);
    }, []);

    const handleSnapPress = useCallback((index: any) => {
        sheetRef.current?.snapToIndex(index);
    }, []);

    const handleClosePress = useCallback(() => {
        sheetRef.current?.close();
    }, []);

    const [bSActive, setBSActive] = useState(false);

    const onPress = useCallback((ctx: string) => {
        if (!bSActive) {
            setContext(ctx);
            if (ctx === 'employment') {
                handleSnapPress(2);
            } else {
                handleSnapPress(1);
            }
        } else {
            handleClosePress();
        }
        setBSActive(!bSActive)
    }, []);

    // disappearsOnIndex={1}
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={1}
            />
        ),
        []
    );

    const [tab, setTab] = useState<number>(0);

    const submitEdit = () => {
        if (getValues("searchTerm") && getValues("searchTerm") !== "") {
            if (searchScheme) {
                if (searchScheme === 'MEMBER_NO') {
                    searchMemberByMemberNo(getValues("searchTerm").toUpperCase())
                        .then(addContactToList)
                        .catch(e => {
                            showSnack(e.message, "WARNING");
                        }).finally(() => {

                    });
                } else if (searchScheme === 'PHONE_NO') {
                    getSecureKey("alpha2Code")
                        .then(alpha2Code => requestPhoneNumberFormat(alpha2Code, getValues("searchTerm")))
                        .then((jsonDat) => Promise.resolve(JSON.parse(jsonDat)))
                        .then(({country_code, phone_no}) => searchMemberByPhone(`${country_code}${phone_no}`))
                        .then(addContactToList)
                        .catch(e => {
                            showSnack(e.message, "WARNING");
                        }).finally(() => {

                    });
                } else {
                    showSnack("Unsupported Search Scheme", "WARNING");
                }
            } else {
                const [phoneRegex, memberNoRegex] = [
                    /^([\d{1,2}[]?|)\d{3}[]?\d{3}[]?\d{4}$/i,
                    /^(?=.*[0-9a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{3,8}$/i
                ];
                if (memberNoRegex.test(getValues("searchTerm"))) {
                    searchMemberByMemberNo(getValues("searchTerm"))
                        .then(addContactToList)
                        .catch(e => {
                            showSnack(e.message, "WARNING");
                        }).finally(() => {

                    });
                } else if (phoneRegex.test(getValues("searchTerm"))) {
                    getSecureKey("alpha2Code")
                        .then(alpha2Code => requestPhoneNumberFormat(alpha2Code, getValues("searchTerm")))
                        .then((jsonDat) => Promise.resolve(JSON.parse(jsonDat)))
                        .then(({country_code, phone_no}) => searchMemberByPhone(`${country_code}${phone_no}`))
                        .then(addContactToList)
                        .catch(e => {
                            showSnack(e.message, "WARNING");
                        }).finally(() => {

                    });
                } else {
                    showSnack("Incorrect Format", "WARNING");
                }
            }
        }
    }

    const submitAmount = () => {
        if (getValues("amountToGuarantee") === "0") {
            return
        } else {
            let amountsToG: any[] = cloneDeep(allGuaranteedAmounts);
            amountsToG.push(getValues("amountToGuarantee"));
            setAllGuaranteedAmounts(amountsToG);
            handleClosePress();
            const newDeserializedCopy: any[] = cloneDeep(selectedContacts);
            newDeserializedCopy.push({...heldMember, amountToGuarantee: getValues("amountToGuarantee")});
            setSelectedContacts(newDeserializedCopy);
        }
    }

    const submitKYC = () => {
        clearErrors();
        if (tab === 0) {
            // set payload for employer
            // check em
            if (getValues("employerName") === undefined || getValues("employerName") === "" || getValues("employerName") === null) {
                setError("employerName", {type: 'custom', message: "required"});
                return
            }
            if (getValues("serviceNo") === undefined || getValues("serviceNo") === "" || getValues("serviceNo") === null) {
                setError("serviceNo", {type: 'custom', message: "required"});
                return
            }
            if (getValues("grossSalary") === undefined || getValues("grossSalary") === "" || getValues("grossSalary") === null) {
                setError("grossSalary", {type: 'custom', message: "required"});
                return
            }
            if (getValues("netSalary") === undefined || getValues("netSalary") === "" || getValues("netSalary") === null) {
                setError("netSalary", {type: 'custom', message: "required"});
                return
            }
            if (getValues("kraPin") === undefined || getValues("kraPin") === "" || getValues("kraPin") === null) {
                setError("kraPin", {type: 'custom', message: "required"});
                return
            }
            let payloadCode = {
                employerName: getValues("employerName"),
                serviceNo: getValues("serviceNo"),
                grossSalary: getValues("grossSalary"),
                netSalary: getValues("netSalary"),
                kraPin: getValues("kraPin")
            };
            setEmployerPayload(payloadCode);
            handleClosePress();
        } else if (tab === 1) {
            if (getValues("businessLocation") === undefined || getValues("businessLocation") === "" || getValues("businessLocation") === null) {
                setError("businessLocation", {type: 'custom', message: "required"});
                return
            }
            if (getValues("businessType") === undefined || getValues("businessType") === "" || getValues("businessType") === null) {
                setError("businessType", {type: 'custom', message: "required"});
                return
            }
            if (getValues("kraPin") === undefined || getValues("kraPin") === "" || getValues("kraPin") === null) {
                setError("kraPin", {type: 'custom', message: "required"});
                return
            }


            let payloadCode = {
                businessLocation: getValues("businessLocation"),
                businessType: getValues("businessType"),
                kraPin: getValues("kraPin")
            };

            setBusinessPayload(payloadCode);

            handleClosePress();
        }
    }

    const navigateUser = async () => {
        if (
            member &&
            route.params &&
            route.params.loanProduct &&
            route.params.loanDetails &&
            (selectedContacts.length > 0 || route.params?.loanProduct.requiredGuarantors === 0)
        ) {
            if (settings) {
                if (settings.employerInfo  && !(employerPayload || businessPayload)) {
                    onPress("employment");
                    return;
                }

                if (clientSettings.requireWitness) {
                    navigation.navigate('WitnessesHome', {
                        guarantors: selectedContacts.map((cont, i) => {
                            if (settings.amounts) {
                                cont = {
                                    ...cont,
                                    committedAmount: allGuaranteedAmounts[i]
                                }
                            }
                            return cont
                        }),
                        employerPayload,
                        businessPayload,
                        ...route.params
                    })
                } else if (!clientSettings.requireWitness) {
                    navigation.navigate('LoanConfirmation', {
                        witnesses: [],
                        guarantors: selectedContacts.map((cont, i) => {
                            if (settings.amounts) {
                                cont = {
                                    ...cont,
                                    committedAmount: allGuaranteedAmounts[i]
                                }
                            }
                            return cont
                        }),
                        employerPayload,
                        businessPayload,
                        ...route.params
                    })
                }
            } else {
                showSnack(`SETTINGS NOT AVAILABLE`, "WARNING");
            }
        } else {
            showSnack(`CANNOT VALIDATE GUARANTORS`, "WARNING");
        }
    }

    const [modalVisible, setModalVisible] = useState(false);
    const [guarantorSearchOptions, setGuarantorSearchOptions] = useState([
        {
            name: 'By Member No',
            value: 'MEMBER_NO',
            selected: false
        },
        {
            name: 'By Phone No',
            value: 'PHONE_NO',
            selected: false
        }
    ]);

    useEffect(() => {
        let change = true;
        if (change) {
            if (clientSettings && clientSettings.allowSelfGuarantee) {
                setGuarantorSearchOptions([
                    {
                        name: 'By Member No',
                        value: 'MEMBER_NO',
                        selected: false
                    },
                    {
                        name: 'By Phone No',
                        value: 'PHONE_NO',
                        selected: false
                    },
                    {
                        name: 'Self Guarantee',
                        value: 'SELF_GUARANTEE',
                        selected: false
                    }
                ]);
            }
        }
        return () => {
            change = false;
        }
    }, [clientSettings])

    const [searchLabel, setSearchLabel] = useState("Search from Phonebook →");

    const [searchScheme, setSearchScheme] = useState<string | null>(null);
    const genLabel = (key: string) => {
        if (key === 'ID_NUMBER') {
            const splitter = key.split("_");
            return "Search " + splitter[0].toUpperCase() + " " + splitter[1].toLowerCase();
        }
        if (key === 'SELF_GUARANTEE') {
            const splitter = key.split("_");
            return splitter[0].toLowerCase() + " " + splitter[1].toLowerCase();
        }
        return "Search " + key.charAt(0).toLowerCase() + key.slice(1).replace("_", " ").toLowerCase()
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.searchableHeader}>
                <TouchableOpacity style={{
                    flex: 0.15,
                    display: 'flex',
                    backgroundColor: 'rgba(72,154,171,0.25)',
                    borderRadius: 12,
                    borderColor: 'rgba(0,0,0,0.09)',
                    borderWidth: 1,
                    height: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onPress={() => setModalVisible(true)} >
                    <AntDesign name={ modalVisible? "upcircleo" : "downcircleo"} size={20} color="#393a34" style={{paddingRight: 2}} />
                </TouchableOpacity>
                <View style={{flex: 0.64}}>
                    <TextField
                        label={searchLabel}
                        field={"searchTerm"}
                        val={getValues}
                        watch={watch}
                        control={control}
                        error={errors.searchTerm}
                        required={true}
                        cb={handleSubmit(submitEdit)}
                    />
                </View>
                <TouchableOpacity style={{
                    flex: 0.15,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    backgroundColor: 'rgba(72,154,171,0.25)',
                    borderColor: 'rgba(0,0,0,0.09)',
                    borderWidth: 1,
                    borderRadius: 12,
                    height: '100%'
                }} onPress={() => {
                    getSecureKey("alpha2Code")
                    .then(alpha2Code => getContact(421, alpha2Code))
                    .then((data: any) => {
                        const dataObject: {name: string;country_code:string;phone_no:string;} = data;
                        setValue('searchTerm', `${dataObject.country_code}${dataObject.phone_no}`);
                        return searchMemberByPhone(`${dataObject.country_code}${dataObject.phone_no}`);
                    })
                    .then(addContactToList)
                    .catch(e => {
                        showSnack(e.message, "WARNING");
                    }).finally(() => {

                    });
                }}>
                    <AntDesign name="contacts" size={22} color="#393a34" />
                </TouchableOpacity>
            </View>
            <ContactSectionList
                contactsData={
                    [
                        {
                            id: 2,
                            title:`SELECTED GUARANTORS (REQUIRES ${route.params?.loanProduct.requiredGuarantors} ${route.params?.loanProduct.requiredGuarantors == 1 ? 'GUARANTOR' : 'GUARANTORS'})`,
                            data: selectedContacts.length > 0 ? selectedContacts : [
                                {
                                    name: false
                                }
                            ]
                        }
                    ]
                }
                removeContactFromList={removeContactFromList}
                contactList={selectedContacts}
                onPress={onPress}
            />

            {isDisabled() ?
                <View style={{ position: 'absolute', bottom: 5, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity disabled={ !isDisabled() || loading || !searchScheme } onPress={handleSubmit(submitEdit)} style={{ display: 'flex', alignItems: 'center', backgroundColor: !isDisabled() || loading || !searchScheme ? '#CCCCCC' : '#489AAB', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                        <Text allowFontScaling={false} style={styles.buttonText}>SEARCH</Text>
                    </TouchableOpacity>
                </View>
                :
                <View style={{ position: 'absolute', bottom: 5, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity disabled={ isDisabled() || loading } onPress={navigateUser} style={{ display: 'flex', alignItems: 'center', backgroundColor: isDisabled() || loading ? '#CCCCCC' : '#489AAB', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                        <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE</Text>
                    </TouchableOpacity>
                </View>
            }
            <BottomSheet
                ref={sheetRef}
                index={-1}
                snapPoints={snapPoints}
                onChange={handleSheetChange}
                backdropComponent={renderBackdrop}
            >
                <TouchableOpacity style={{ position: 'absolute', top: -25, right: 12, backgroundColor: '#767577', borderRadius: 15 }} onPress={() => {
                    onPress('options');
                }}>
                    <AntDesign name="close" size={15} style={{padding: 2}} color="#FFFFFF" />
                </TouchableOpacity>
                <BottomSheetScrollView contentContainerStyle={{backgroundColor: "white", paddingHorizontal: 16}}>
                    {
                        context === "amount" &&
                        <>
                            <View style={{paddingHorizontal: 5}}>
                                <Text allowFontScaling={false} style={styles.subtitle}>Guarantor: {currentGuarantor?.name}</Text>
                                <Text allowFontScaling={false} style={styles.subtitle2}>
                                    Remaining Amount:
                                    <Text style={{textDecorationLine: 'underline'}}>{toMoney(un_guaranteed())}</Text>
                                </Text>
                            </View>

                            <TextField
                                label={"Amount to guarantee"}
                                field={"amountToGuarantee"}
                                val={getValues}
                                watch={watch}
                                control={control}
                                error={errors.amountToGuarantee}
                                required={true}
                                keyboardType={"number-pad"}
                            />

                            <TouchableButton loading={loading} label={"SUBMIT"} onPress={handleSubmit(submitAmount)} />
                        </>
                    }
                    { context === "employment" &&
                        <>
                            <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', width: width-50, paddingBottom: 15 }}>
                                <TouchableOpacity onPress={() => {
                                    setTab(0)
                                }} style={{ display: 'flex', borderBottomWidth: tab === 0 ? 2 : 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: (width-50) / 2, borderColor: '#489AAB' }}>
                                    <Text allowFontScaling={false} style={[{color: tab === 0 ? '#489AAB' : '#c6c6c6'}, styles.tabTitle]}>Employed</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    setTab(1)
                                }} style={{ display: 'flex', borderBottomWidth: tab === 1 ? 2 : 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: (width-50) / 2, borderColor: '#489AAB' }}>
                                    <Text allowFontScaling={false} style={[{color: tab === 1 ? '#489AAB' : '#c6c6c6'}, styles.tabTitle]}>Business/ Self Employed</Text>
                                </TouchableOpacity>
                            </View>
                            {   tab === 0 ?
                                <>
                                    <TextField
                                        field={"employerName"}
                                        label={"Employer"}
                                        val={getValues}
                                        watch={watch}
                                        control={control}
                                        error={errors.employerName}
                                        required={true}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: "Employer Name is required"
                                            }
                                        }}
                                        keyboardType={"default"}
                                        secureTextEntry={false}
                                    />
                                    <TextField
                                        field={"serviceNo"}
                                        label={"Employment Number"}
                                        val={getValues}
                                        watch={watch}
                                        control={control}
                                        error={errors.serviceNo}
                                        required={true}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: "Employer service no. required"
                                            }
                                        }}
                                        keyboardType={"default"}
                                        secureTextEntry={false}
                                    />
                                    <TextField
                                        field={"grossSalary"}
                                        label={"Gross Salary"}
                                        val={getValues}
                                        watch={watch}
                                        control={control}
                                        error={errors.grossSalary}
                                        required={true}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: "Gross salary required"
                                            }
                                        }}
                                        keyboardType={"numeric"}
                                        secureTextEntry={false}
                                    />
                                    <TextField
                                        field={"netSalary"}
                                        label={"Net Salary"}
                                        val={getValues}
                                        watch={watch}
                                        control={control}
                                        error={errors.netSalary}
                                        required={true}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: "Net salary required"
                                            }
                                        }}
                                        keyboardType={"numeric"}
                                        secureTextEntry={false}
                                    />
                                    <TextField
                                        field={"kraPin"}
                                        label={"KRA Pin"}
                                        val={getValues}
                                        watch={watch}
                                        control={control}
                                        error={errors.kraPin}
                                        required={true}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: "KRA pin required"
                                            }
                                        }}
                                        keyboardType={"default"}
                                        secureTextEntry={false}
                                    />
                                </> : null
                            }

                            {
                                tab === 1 ?
                                    <>
                                        <TextField
                                            field={"businessLocation"}
                                            label={"Business Location"}
                                            val={getValues}
                                            watch={watch}
                                            control={control}
                                            error={errors.businessLocation}
                                            required={true}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "Business location required"
                                                }
                                            }}
                                            keyboardType={"default"}
                                            secureTextEntry={false}
                                        />

                                        <TextField
                                            field={"businessType"}
                                            label={"Business Type"}
                                            val={getValues}
                                            watch={watch}
                                            control={control}
                                            error={errors.businessType}
                                            required={true}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "Business type required"
                                                }
                                            }}
                                            keyboardType={"default"}
                                            secureTextEntry={false}
                                        />

                                        <TextField
                                            field={"kraPin"}
                                            label={"KRA Pin"}
                                            val={getValues}
                                            watch={watch}
                                            control={control}
                                            error={errors.kraPin}
                                            required={true}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "KRA pin required"
                                                }
                                            }}
                                            keyboardType={"default"}
                                            secureTextEntry={false}
                                        />

                                    </> : null
                            }

                            <TouchableButton loading={loading} label={"SUBMIT"} onPress={handleSubmit(submitKYC)} />
                        </>
                    }
                </BottomSheetScrollView>
            </BottomSheet>
            <View style={{position: 'absolute', bottom: -10}}>
                <GenericModal modalVisible={modalVisible} setModalVisible={setModalVisible} title={"Options"} description={"Select guarantor option"} cb={(option) => {
                    console.log(option?.context)
                    if (option?.context === 'dismiss') {
                        setSearchScheme(null);
                        setSearchLabel("Search Phonebook");
                    } else {
                        if (option && option?.context === 'option' && option?.option) {
                            setSearchScheme(option?.option.value);
                            const label = genLabel(option?.option.value);
                            setSearchLabel(label);
                            const index = guarantorSearchOptions?.findIndex(op => op.value.toLowerCase() === option?.option?.value.toLowerCase())
                            setGuarantorSearchOptions(guarantorSearchOptions?.map((op, i) => {
                                if (index === i) {
                                    return {
                                        ...op,
                                        selected: true
                                    }
                                } else {
                                    return {
                                        ...op,
                                        selected: false
                                    }
                                }
                            }))
                        }
                    }
                }} options={guarantorSearchOptions} />
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    searchableHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 25,
        marginHorizontal: 16,
    },
    header: {
        fontSize: 15,
        color: 'rgba(0,0,0,0.89)',
        paddingLeft: 20,
        fontFamily: 'Poppins_500Medium'
    },
    option: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: width/1.12,
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        borderColor: '#CCCCCC',
        borderWidth: .5,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2, // Android
    },
    optionName: {
        fontSize: 16,
        fontFamily: 'Poppins_300Light',
        marginLeft: 10
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_300Light',
        alignSelf: 'flex-start',
        paddingHorizontal: 30,
        marginTop: 5
    },
    input0: {
        borderWidth: 1,
        borderColor: '#cccccc',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 45,
        width: width -35,
        paddingHorizontal: 20,
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },
    subtitle2: {
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
        letterSpacing: 0.5,
        paddingBottom: 3,
    },
    tabTitle: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 12,
        padding: 5
    },
    subtitle: {
        textAlign: 'left',
        color: '#489AAB',
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.5,
        paddingBottom: 3,
    },
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold'
    },
});

export default GuarantorsHome;