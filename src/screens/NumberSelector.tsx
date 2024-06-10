import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

const NumberSelector = forwardRef(({ onNext }, ref) => {
  const [number, setNumber] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(null);

  const handleInputChange = (value) => {
    setNumber(value);
  };

  const handleSubmit = () => {
    if (isNaN(number) || number === '') {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez entrer un nombre valide',
      });
      return;
    }
    setSelectedNumber(number);
    if (onNext) {
      onNext();
    }
  };

  // Permet d'exposer certaines fonctions ou valeurs à l'extérieur du composant
  useImperativeHandle(ref, () => ({
    clearSelectedNumber: () => setSelectedNumber(null), // Fonction pour effacer le nombre sélectionné
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisir un nombre</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={number}
        onChangeText={handleInputChange}
        placeholder="Entrez un nombre"
      />
      <Button title="Je choisi ce nombre" onPress={handleSubmit} />
      {selectedNumber !== null && (
        <Text style={styles.result}>Vous avez choisi le nombre: {selectedNumber}</Text>
      )}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
  },
  result: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default NumberSelector;
