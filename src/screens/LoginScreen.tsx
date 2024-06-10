import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player } from '../model/Player';

const LoginScreen = ({ onLogin }) => {
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    const fetchDeviceName = async () => {
      const name = await DeviceInfo.getDeviceName();
      setDeviceName(name);
    };

    fetchDeviceName();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const player = new Player("Mon nom 1", 256, "monEmail 1");
      await player.addPlayer(player);

      const deviceId = await DeviceInfo.getUniqueId();
      const storedDeviceId = await AsyncStorage.getItem("deviceId");

      if (storedDeviceId !== deviceId) {
        await AsyncStorage.setItem("deviceId", deviceId);
      }

      const userDoc = await firestore()
        .collection("Players")
        .doc(deviceId)
        .get();

      if (!userDoc.exists) {
        await firestore().collection("Players").doc(deviceId).set({
          deviceId: deviceId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          deviceName: deviceName,
        });
      }

      onLogin();
    };

    checkUser();
  }, [deviceName, onLogin]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
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

export default LoginScreen;
