import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import GlobalVariables from "../../GlobalVariables";

const SessionScreen = ({ onNext, onBack, createGame }) => {
  
  useEffect(() => {
    const handleLeaveGame = async () => {
      try {
        const deviceId = await DeviceInfo.getUniqueId();
        const gamesCollection = firestore().collection('Games');
        const querySnapshot = await gamesCollection.get();
  
        let deviceRemoved = false;
  
        for (const doc of querySnapshot.docs) {
          const gameData = doc.data();
  
          if (gameData.GameParticipantDeviceId && gameData.GameParticipantDeviceId.includes(deviceId)) {
            await doc.ref.update({
              GameParticipantDeviceId: firestore.FieldValue.arrayRemove(deviceId),
            });
            deviceRemoved = true;
          }
        }
  
        if (deviceRemoved) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'You have left the game!',
          });
        } else {
          //console.log("je suis ici ohhh")
        }
      } catch (error) {
        console.error("Error leaving game: ", error);
        console.log('An error occurred while trying to leave the game.')
        
      }
    };
  
    handleLeaveGame();
  }, []); 


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-back" size={30} />
      </TouchableOpacity>
      <Text style={styles.text}>Session Screen</Text>
      <Button title="Creer une partie" onPress={createGame} />
      <Button title="Rejoindre une partie" onPress={onNext} />

      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
  },
});

export default SessionScreen;
