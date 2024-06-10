import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import firestore, { firebase } from "@react-native-firebase/firestore";
import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons"; // If using vector icons
import { Player } from "./src/model/Player";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SessionScreen from "./src/screens/SessionScreen";
import SalleDattenteScreen from "./src/screens/SalleDattenteScreen";
import JoinGameScreen from "./src/screens/JoinGame";
import NumberSelector from "./src/screens/NumberSelector";
import PageDeJeu from "./src/screens/PageDeJeu";
import GlobalVariables from "./GlobalVariables";

let gameId: string;

const generateRandomName = () => {
  // Liste de mots qui peuvent être combinés pour former un nom de partie
  const firstWords = [
    "Chat",
    "Pizza",
    "Montagne",
    "Jungle",
    "Aventure",
    "Secret",
    "Super",
    "Cosmique",
    "Galaxie",
  ];
  const secondWords = [
    "Rapide",
    "Glace",
    "Magique",
    "Infini",
    "Mystère",
    "Légendaire",
    "Explorateur",
    "Sauvage",
    "Ninja",
  ];

  // Choix aléatoire d'un mot de chaque liste
  const firstWord = firstWords[Math.floor(Math.random() * firstWords.length)];
  const secondWord =
    secondWords[Math.floor(Math.random() * secondWords.length)];

  // Combinaison des mots pour former le nom de la partie
  const randomName = `${firstWord}${secondWord}`;

  return randomName;
};

const App = () => {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      const gamesSnapshot = await firestore()
        .collection("Games")
        .where("gameStatus", "==", false)
        .get();
      const gamesData = gamesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGames(gamesData);
    };
    if (currentScreen === "joinGame") {
      fetchGames();
    }
  }, [currentScreen]);

  const goToHomeScreen = () => setCurrentScreen("home");
  const goToSessionScreen = () => setCurrentScreen("session");
  const goToSalleDattenteScreen = () => setCurrentScreen("salleDattente");
  const goToPreviousSessionScreen = () => setCurrentScreen("session");
  const goToJoinGameScreen = () => setCurrentScreen("joinGame");
  const goToPageDeJeu = () => setCurrentScreen("Jeu");
  const goToNumberSelector = () => setCurrentScreen("numberSelector");
  const [globalString, setGlobalString] = useState(GlobalVariables.globalString);
  // Mettre à jour la variable globale lorsque l'état globalString change
  useEffect(() => {
    GlobalVariables.globalString = globalString;
  }, [globalString]);
  
  const createGame = async () => {
    try {

      const deviceId = await DeviceInfo.getUniqueId();
      const deviceName = await DeviceInfo.getDeviceName();
      const gameRef = await firestore().collection("Games").add({
        createdBy: [deviceId, deviceName ],
        createdAt: firestore.FieldValue.serverTimestamp(),
        gameStatus: false,
        GameParticipantDeviceId: [],
        gameName: generateRandomName(),
        MaxNombre: 0,
      });
      console.log(`Game created with ID: ${gameRef.id}`);
      // Mettre à jour la variable globale
      setGlobalString(gameRef.id);
      // You can store this game ID if needed for further operations
      goToSalleDattenteScreen();
    } catch (error) {
      console.error("Error creating game: ", error);
    }
  };

  return (
    <View style={styles.appContainer}>
      {currentScreen === "login" && <LoginScreen onLogin={goToHomeScreen} />}
      {currentScreen === "home" && <HomeScreen onNext={goToSessionScreen} />}
      {currentScreen === "session" && (
        <SessionScreen
          onNext={goToJoinGameScreen}
          onBack={goToHomeScreen}
          createGame={createGame}
        />
      )}
      {currentScreen === "salleDattente" && (
        <SalleDattenteScreen onBack={goToPreviousSessionScreen} onNext={goToNumberSelector } />
      )}
      {currentScreen === "joinGame" && (
        <JoinGameScreen games={games} onBack={goToSessionScreen} onNext={goToSalleDattenteScreen} />
      )}
      { currentScreen === "numberSelector" && (
        <NumberSelector onNext={goToPageDeJeu}/>
      )}
      { currentScreen === "Jeu" && (
        <PageDeJeu onBack={goToSessionScreen}/>
      )}
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
    //height: 100,
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

export default App;
