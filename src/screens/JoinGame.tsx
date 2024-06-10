import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons"; // If using vector icons
import GlobalVariables from "../../GlobalVariables";

const JoinGameScreen = ({ games, onBack, onNext }) => {
  const [globalString, setGlobalString] = useState(GlobalVariables.globalString);

  // Mettre à jour la variable globale lorsque l'état globalString change
  useEffect(() => {
    GlobalVariables.globalString = globalString;
  }, [globalString]);

  

  const addParticipantsGame = async (docId) => {
    try {
      const docRef = firestore().collection("Games").doc(docId);
      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        const deviceId = await DeviceInfo.getUniqueId();
        const storedDeviceId = await AsyncStorage.getItem("deviceId");

        if (storedDeviceId !== deviceId) {
          await AsyncStorage.setItem("deviceId", deviceId);
        }

        await docRef.update({
          GameParticipantDeviceId: firestore.FieldValue.arrayUnion(deviceId),
        });

        console.log(
          `Element '${deviceId}' added to attribute 'GameParticipantDeviceId' in document with ID '${docId}'.`
        );

        // Mettre à jour la variable globale
        setGlobalString(docId);

        onNext(); // Appel de la fonction onNext après avoir ajouté le participant
      } else {
        console.log(`Document with ID '${docId}' does not exist.`);
      }
    } catch (error) {
      console.error("Error updating or adding attribute to document: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-back" size={30} />
      </TouchableOpacity>
      <Text style={styles.text}>Liste des parties</Text>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.gameItem, styles.verticalItem]}
            onPress={() => {
              addParticipantsGame(item.id);
            }}
          >
            <View style={styles.gameItemContent}>
              <Text style={styles.gameName}>Partie de {item.gameName}</Text>
              <Text style={styles.createdBy}>Créée par {item.createdBy[1]}</Text>
              <Text>Le {item.createdAt ? item.createdAt.toDate().toLocaleString() : 'date inconnue'}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50, // To ensure there is space at the top for the back button
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
  },
  listContainer: {
    paddingVertical: 16,
  },
  gameItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verticalItem: {
    flexDirection: "column",
  },
  gameItemContent: {
    flex: 1,
    justifyContent: "center",
  },
  gameName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  createdBy: {
    fontSize: 16,
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 14,
    color: "#666",
  },
});

export default JoinGameScreen;
