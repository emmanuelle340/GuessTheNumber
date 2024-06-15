import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import GlobalVariables from "../../GlobalVariables";

const NumberSelector = forwardRef(({ onNext }, ref) => {
  const [number, setNumber] = useState("");
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [maxNumber, setMaxNumber] = useState(null);

  useEffect(() => {
    const fetchMaxNumber = async () => {
      const gameId = GlobalVariables.globalString;
      const gameDoc = await firestore().collection("Games").doc(gameId).get();
      if (gameDoc.exists) {
        setMaxNumber(gameDoc.data().MaxNombre);
      } else {
        console.log("Game document not found.");
      }
    };

    fetchMaxNumber();
  }, []);

  const handleInputChange = (value) => {
    setNumber(value);
  };

  const UpdateSecretNumber = async (monNombre) => {
    const deviceId = await DeviceInfo.getUniqueId();
    const storedDeviceId = await AsyncStorage.getItem("deviceId");

    if (storedDeviceId !== deviceId) {
      await AsyncStorage.setItem("deviceId", deviceId);
    }

    const gameId = GlobalVariables.globalString;
    const roundsCollectionRef = firestore().collection("Round");
    const roundsQuery = roundsCollectionRef.where("gameId", "==", gameId);
    const roundsSnapshot = await roundsQuery.get();

    if (!roundsSnapshot.empty) {
      roundsSnapshot.forEach(async (doc) => {
        const data = doc.data();
        const roundId = doc.id;

        if (data.unRound && data.unRound.length > 0) {
          const lastRound = data.unRound[data.unRound.length - 1];

          const updatedLesPropositions = lastRound.LesPropositions.map((proposition) => {
            if (proposition.deviceId === deviceId) {
              return {
                ...proposition,
                secretNumber: monNombre,
              };
            }
            return proposition;
          });

          const updatedUnRound = data.unRound.map((round, index) => {
            if (index === data.unRound.length - 1) {
              return {
                ...round,
                LesPropositions: updatedLesPropositions,
              };
            }
            return round;
          });

          roundsCollectionRef.doc(roundId).update({
            unRound: updatedUnRound,
          });

          console.log("Document mis à jour avec succès.");
          Toast.show({
            type: "success",
            text1: "Succès",
            text2: "Le nombre secret a été mis à jour.",
          });
        } else {
          console.log("Le tableau unRound est vide pour le document avec gameId =", gameId);
        }
      });
    } else {
      console.log(
        "Aucun document trouvé dans la collection 'Round' avec gameId =",
        gameId
      );
    }
  };

  const handleSubmit = () => {
    if (isNaN(number) || number === "") {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Veuillez entrer un nombre valide",
      });
      return;
    }

    const num = parseInt(number, 10);

    if (num < 0 || num > maxNumber) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: `Veuillez entrer un nombre entre 0 et ${maxNumber}`,
      });
      return;
    }

    setSelectedNumber(number);
    UpdateSecretNumber(number);
    if (onNext) {
      onNext();
    }
  };

  useImperativeHandle(ref, () => ({
    clearSelectedNumber: () => setSelectedNumber(null),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisir un nombre</Text>
      {maxNumber !== null ? (
        <Text style={styles.interval}>
          Veuillez entrer un nombre entre 0 et {maxNumber}
        </Text>
      ) : (
        <Text style={styles.loading}>Chargement de la plage de nombres...</Text>
      )}
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={number}
        onChangeText={handleInputChange}
        placeholder="Entrez un nombre"
      />
      <Button title="Je choisis ce nombre" onPress={handleSubmit} />
      {selectedNumber !== null && (
        <Text style={styles.result}>
          Vous avez choisi le nombre: {selectedNumber}
        </Text>
      )}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  interval: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "gray",
  },
  loading: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "gray",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
  },
  result: {
    marginTop: 16,
    fontSize: 18,
    textAlign: "center",
  },
});

export default NumberSelector;
