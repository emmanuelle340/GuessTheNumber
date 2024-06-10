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
import Icon from "react-native-vector-icons/MaterialIcons";
import GlobalVariables from "../../GlobalVariables";

const SalleDattenteScreen = ({ onBack, onNext }) => {
  const [hostName, setHostName] = useState("");
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const gameId = GlobalVariables.globalString; // Accéder directement à la variable globale

    const unsubscribe = firestore()
      .collection("Games")
      .doc(gameId)
      .onSnapshot(
        async (doc) => {
          if (doc.exists) {
            const gameData = doc.data();
            setHostName(gameData.createdBy[0].deviceName); // Utiliser le champ createdBy comme nom de l'hôte

            const participantIds = gameData.GameParticipantDeviceId; // Assurez-vous de récupérer le bon champ
            const participantsData = [];
            for (const participantId of participantIds) {
              const participantDoc = await firestore()
                .collection("Players")
                .doc(participantId)
                .get();
              if (participantDoc.exists) {
                participantsData.push(participantDoc.data().name);
              }
            }
            setParticipants(participantsData);
          } else {
            console.log(`Game with ID '${gameId}' does not exist.`);
          }
        },
        (error) => {
          console.error("Error fetching game data:", error);
        }
      );

    return () => unsubscribe(); // Nettoyer le listener lorsque le composant est démonté
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-back" size={30} />
      </TouchableOpacity>
      <Text style={styles.text}>Salle d'attente</Text>
      <Text style={styles.subtitle}>Nom de l'hôte :</Text>
      <Text>{hostName}</Text>
      <Text style={styles.subtitle}>Participants :</Text>
      <FlatList
        data={participants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
      <Button title="Lancer" onPress={onNext} />
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
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
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

export default SalleDattenteScreen;