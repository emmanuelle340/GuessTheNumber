import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import GlobalVariables from '../../GlobalVariables';

const PageDeJeu = ({ onBack }) => {
  const [secretNumber, setSecretNumber] = useState(null);
  const [proposal, setProposal] = useState('');
  const [waitingMessage, setWaitingMessage] = useState(false);
  const [proposalCount, setProposalCount] = useState(0); // État pour compter les propositions

  useEffect(() => {
    const fetchSecretNumber = async () => {
      try {
        const deviceId = await DeviceInfo.getUniqueId();
        const gameId = GlobalVariables.globalString;
        const roundsCollectionRef = firestore().collection('Round');
        const roundsQuery = roundsCollectionRef.where('gameId', '==', gameId);
        const unsubscribe = roundsQuery.onSnapshot(snapshot => {
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.unRound && data.unRound.length > 0) {
              const lastRound = data.unRound[data.unRound.length - 1];
              lastRound.LesPropositions.forEach(proposition => {
                if (proposition.deviceId === deviceId) {
                  setSecretNumber(proposition.secretNumber);
                }
              });
            }
          });
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching secret number:', error);
      }
    };

    fetchSecretNumber();
  }, []);

  const handleProposalSubmit = async () => {
    if (isNaN(proposal) || proposal === '') {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez entrer un nombre valide',
      });
      return;
    }
    Toast.show({
      type:'success',
      text1: 'Proposition soumise',
      text2: `Votre proposition: ${proposal}`,
    });

    try{
      // Mettre à jour le compteur de propositions
      setProposalCount(prevCount => prevCount + 1);
      const deviceId = await DeviceInfo.getUniqueId();
      const gameId = GlobalVariables.globalString;
      const roundsCollectionRef = firestore().collection('Round');
      const roundsQuery = roundsCollectionRef.where('gameId', '==', gameId);
      const unsubscribe = roundsQuery.onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.unRound && data.unRound.length > 0) {
            const lastRound = data.unRound[data.unRound.length - 1];
            lastRound.LesPropositions.forEach(proposition => {
              if (proposition.deviceId === deviceId) {
  
                // Vous pouvez ajouter d'autres logiques ici en fonction de vos besoins
              }
            });
          }
        });
      });
  
      // Mettre à jour le compteur de propositions
      setProposalCount(prevCount => prevCount + 1);
    }catch (error) {

    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Mon nombre: {secretNumber !== null ? secretNumber : 'En attente'}</Text>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.subtitle}>Ma proposition:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={proposal}
          onChangeText={setProposal}
          placeholder="Entrez votre proposition"
          editable={!waitingMessage}
        />
        <Button
          title="Je valide ma proposition"
          onPress={handleProposalSubmit}
          disabled={waitingMessage}
        />
        {waitingMessage && (
          <Text style={styles.waitingMessage}>En attente du choix des autres joueurs...</Text>
        )}
        <Text>Nombre de propositions soumises : {proposalCount}</Text>
      </View>

      <View style={styles.topSection}>
        <Text style={styles.title}></Text>
        <Button title="Se déconnecter" onPress={onBack} />
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
  waitingMessage: {
    marginTop: 8,
    fontSize: 16,
    fontStyle: 'italic',
    color: 'gray',
  },
});

export default PageDeJeu;
