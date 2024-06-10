import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Guess the number</Text>
      <Button title="Commencer" onPress={onNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;
