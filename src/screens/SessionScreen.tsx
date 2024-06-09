import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Party } from '../model/Party';
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage';


type RootStackParamList = {
    Session: undefined;
    'Lobby Screen': undefined;
    'Select Session': undefined;
    'Login': undefined;
};

type SessionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Session'>;
type SessionScreenRouteProp = RouteProp<RootStackParamList, 'Session'>;

type Props = {
    navigation: SessionScreenNavigationProp;
    route: SessionScreenRouteProp;
};
let email = ""
const addParty =async () =>{
    try {
        const playerString = await AsyncStorage.getItem("Player");
        if (playerString !== null) {

            const player = JSON.parse(playerString);
            email = player.email;

            const party = new Party([email],55,email,true)
            party.getParties()
            // party.addPlayer("seim")
            return player;
        }
    } catch (error) {
        console.log(error)
    }
}

const SessionScreen: React.FC<Props> = ({ navigation }) => {
    const disconnect = async () => {
        try {
            navigation.navigate('Login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>


            <TouchableOpacity style={styles.button} onPress={() =>{

                addParty()

            }}>
                <Text style={styles.buttonText}>Créer une session</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Select Session')}>
                <Text style={styles.buttonText}>Rejoindre une session</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    image: {
        width: 300,
        height: 250,
        marginTop: -150,
        marginBottom: 100,
    },
    button: {
        backgroundColor: '#1E90FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default SessionScreen;
