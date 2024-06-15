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
  
    try {
      // Mettre à jour le compteur de propositions
      setProposalCount(prevCount => prevCount + 1);
  
      const deviceId = await DeviceInfo.getUniqueId();
      const gameId = GlobalVariables.globalString;
      const roundsCollectionRef = firestore().collection('Round');
      const roundsQuery = roundsCollectionRef.where('gameId', '==', gameId);
  
      roundsQuery.get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const roundData = doc.data();
          const roundId = doc.id;
          let unRound = roundData.unRound;
  
          // Vérifier la taille de unRound par rapport à proposalCount
          if (unRound.length !== proposalCount) {
            // Ajouter un nouvel élément à unRound avec propositions initialisées à -1
            const newProposals = unRound[unRound.length - 1].LesPropositions.map(proposition => ({
              deviceId: proposition.deviceId,
              secretNumber: proposition.secretNumber,
              proposition: -1,
            }));
            unRound.push({ LesPropositions: newProposals });
  
            // Mettre à jour la collection Round dans Firestore avec unRound étendu
            roundsCollectionRef.doc(roundId).update({ unRound }).then(() => {
              console.log('UnRound étendu avec succès.');
            }).catch(error => {
              console.error('Erreur lors de l\'extension de unRound :', error);
            });
          }
  
          // Mettre à jour la proposition dans la dernière occurrence de unRound avec le bon deviceId
          const lastRoundIndex = unRound.length - 1;
          const lastRound = unRound[lastRoundIndex];
          const propositionIndex = lastRound.LesPropositions.findIndex(prop => prop.deviceId === deviceId);
  
          if (propositionIndex !== -1) {
            // Mettre à jour la proposition dans LesPropositions
            const updatedUnRound = [...unRound];
            updatedUnRound[lastRoundIndex].LesPropositions[propositionIndex].proposition = parseInt(proposal, 10);
  
            // Mettre à jour la collection Round dans Firestore avec unRound mis à jour
            roundsCollectionRef.doc(roundId).update({ unRound: updatedUnRound }).then(() => {
              console.log('Proposition mise à jour avec succès.');
              Toast.show({
                type: 'success',
                text1: 'Proposition soumise',
                text2: `Votre proposition: ${proposal}`,
              });
            }).catch(error => {
              console.error('Erreur lors de la mise à jour de la proposition :', error);
              Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Erreur lors de la mise à jour de la proposition.',
              });
            });
          }
        });
      }).catch(error => {
        console.error('Erreur lors de la récupération du round :', error);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Erreur lors de la récupération des données de la partie.',
        });
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de deviceId :', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Erreur lors de la récupération de l\'identifiant du périphérique.',
      });
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
