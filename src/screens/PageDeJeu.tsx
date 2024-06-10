import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

const PageDeJeu = ({onBack}) => {
  const [myNumber, setMyNumber] = useState('');
  const [proposal, setProposal] = useState('');

  const handleMyNumberChange = () => {
    // Logic to change the number (could be implemented later)
    Toast.show({
      type: 'info',
      text1: 'Changer le nombre',
      text2: 'Fonctionnalité à implémenter',
    });
  };

  const handleProposalSubmit = () => {
    if (isNaN(proposal) || proposal === '') {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez entrer un nombre valide',
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Proposition soumise',
      text2: `Votre proposition: ${proposal}`,
    });
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.topSection}>
        <Text style={styles.title}>Mon nombre</Text>
        <Button title="Changer" onPress={handleMyNumberChange} />
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.subtitle}>Ma proposition:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={proposal}
          onChangeText={setProposal}
          placeholder="Entrez votre proposition"
        />
        <Button title="je valide ma proposition" onPress={handleProposalSubmit} />
      </View>

      <View style={styles.topSection}>
        <Text style={styles.title}></Text>
        <Button title="Se deconnecter" onPress={onBack} />
      </View>

      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    width: '100%',
  },
});

export default PageDeJeu;
