import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


const SessionScreen = ({ onNext, onBack, createGame }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-back" size={30} />
      </TouchableOpacity>
      <Text style={styles.text}>Session Screen</Text>
      <Button title="Creer une partie" onPress={createGame} />
      <Button title="Rejoindre une partie" onPress={onNext} />
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
