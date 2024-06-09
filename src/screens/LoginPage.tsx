import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// Importez les fonctions Firestore de Firebase
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

const LoginPage: React.FC = () => {

    GoogleSignin.configure({
        webClientId: '1832760171-fulqshs23vojnqogh341ggf25u966s26.apps.googleusercontent.com',
    });

    const signInWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(
                userInfo.idToken,
            );
            await auth().signInWithCredential(googleCredential);
            console.log(userInfo.user.email);


        } catch (error) {
            console.log(error);
        }
    };

    async function onGoogleButtonPress() {
        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        return auth().signInWithCredential(googleCredential);
    }


    return (
        <View >


            {/* Bouton de connexion Google */}
            <GoogleSigninButton
                style={styles.googleButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={signInWithGoogle}
            />
            <Button
                title="Google Sign-In"
                onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    googleButton: {
        width: '80%',
        marginVertical: 20,
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
});

export default LoginPage;
