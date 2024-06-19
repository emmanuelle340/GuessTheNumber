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
import Toast from "react-native-toast-message"; // Importer le module Toast
import DeviceInfo from 'react-native-device-info';

const SalleDattenteScreen = ({ onBack, onNext }) => {
  const [hostName, setHostName] = useState("");
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const gameId = GlobalVariables.globalString;

    const unsubscribe = firestore()
      .collection("Games")
      .doc(gameId)
      .onSnapshot(
        async (doc) => {
          if (doc.exists) {
            const gameData = doc.data();
            setHostName(gameData.createdBy[1]);

            const participantIds = gameData.GameParticipantDeviceId;

            const participantsData = [];
            for (const participantId of participantIds) {
              const participantDoc = await firestore()
                .collection("Players")
                .doc(participantId)
                .get();
              if (participantDoc.exists) {
                participantsData.push(participantDoc.data().deviceName);
              }
            }
            setParticipants(participantsData);
             // Check if gameStatus is true and call onNext if it is
             if (gameData.gameStatus) {
              onNext();
            }
          } else {
            console.log(`Game with ID '${gameId}' does not exist.`);
          }
        },
        (error) => {
          console.error("Error fetching game data:", error);
        }
      );

    return () => unsubscribe();

    
  }, []);

  useEffect(() => {
    const gameId = GlobalVariables.globalString;
  
    const unsubscribe = firestore()
      .collection("Games")
      .doc(gameId)
      .onSnapshot(async (doc) => {
        if (doc.exists) {
          const gameData = doc.data();
          setHostName(gameData.createdBy[1]);
  
          const participantIds = gameData.GameParticipantDeviceId;
  
          const participantsData = [];
          for (const participantId of participantIds) {
            const participantDoc = await firestore()
              .collection("Players")
              .doc(participantId)
              .get();
            if (participantDoc.exists) {
              participantsData.push(participantDoc.data().deviceName);
            }
          }
          setParticipants(participantsData);
        } else {
          console.log(`Game with ID '${gameId}' does not exist.`);
        }
      }, (error) => {
        console.error("Error fetching game data:", error);
      });
  
    return () => unsubscribe();
  
  }, []);
  
  

  const handleLaunchGame = async () => {
    try {
      // Vérifier le nombre de participants
      const numParticipants = participants.length + 1; // +1 pour l'hôte
      if (numParticipants <2) {
        // Afficher un toast d'erreur si le nombre de participants est inférieur à 2
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Le nombre de participants est insuffisant.",
        });
      } else {
        // Mettre à jour l'attribut MaxNombre dans le document de jeu actuel
        const gameId = GlobalVariables.globalString;
        const gameRef = firestore().collection("Games").doc(gameId);
        await gameRef.update({
          MaxNombre: numParticipants * 2, // 2 fois le nombre de participants
          gameStatus: true,
        });
        const gameDocRef = firestore()
          .collection("Games")
          .doc(GlobalVariables.globalString);
        const gameDoc = await gameDocRef.get();
        let MaListe: Array<propositionPlusParticipants> = [];
        if (gameDoc.exists) {
          const participantIds = gameDoc.get("GameParticipantDeviceId");
          const hoteIds = gameDoc.get("createdBy");
          if (participantIds) {
            Object.values(participantIds).forEach((item) => {
              const tmp = new propositionPlusParticipants(item, -1,-1);
              MaListe.push(tmp);
            });
            //Ajouter l'hote
            const tmp = new propositionPlusParticipants(hoteIds[0], -1,-1)
            MaListe.push(tmp);
          }
        } else {
          console.log(
            "Le document 'Games' avec l'ID",
            GlobalVariables.globalString,
            "n'existe pas."
          );
        }
        // Ajouter les propositions au document Round
        const RoundRef = await firestore().collection("Round").add({
          gameId: GlobalVariables.globalString,
          unRound: [{LesPropositions: MaListe}],
        });
        onNext();

      }
    } catch (error) {
      console.error("Error launching game:", error);
    }
  };

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
      <Button title="Lancer" onPress={handleLaunchGame} />
      <Toast ref={(ref) => Toast.setRef(ref)} />
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
    paddingTop: 50,
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

class propositionPlusParticipants {
  constructor(deviceId, proposition,secretNumber) {
    this.deviceId = deviceId;
    this.proposition = proposition;
    this.secretNumber = secretNumber;
  }
}

export default SalleDattenteScreen;
