import React, { useEffect, useState } from 'react';
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
  const [comparisonResults, setComparisonResults] = useState([]);



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
      setProposalCount(prevCount => prevCount + 1);
  
      const deviceId = await DeviceInfo.getUniqueId();
      const gameId = GlobalVariables.globalString;
      const roundsCollectionRef = firestore().collection('Round');
      const roundsQuery = roundsCollectionRef.where('gameId', '==', gameId);
  
      const querySnapshot = await roundsQuery.get();
      querySnapshot.forEach(doc => {
        const roundData = doc.data();
        const roundId = doc.id;
        const unRound = roundData.unRound;
  
        if (unRound.length !== proposalCount) {
          const newProposals = unRound[unRound.length - 1].LesPropositions.map(proposition => ({
            deviceId: proposition.deviceId,
            secretNumber: proposition.secretNumber,
            proposition: -1,
          }));
          unRound.push({ LesPropositions: newProposals });
  
          roundsCollectionRef.doc(roundId).update({ unRound }).then(() => {
            console.log('UnRound étendu avec succès.');
          }).catch(error => {
            console.error('Erreur lors de l\'extension de unRound :', error);
          });
        }
  
        const lastRoundIndex = unRound.length - 1;
        const lastRound = unRound[lastRoundIndex];
        const propositionIndex = lastRound.LesPropositions.findIndex(prop => prop.deviceId === deviceId);
  
        if (propositionIndex !== -1) {
          const updatedUnRound = [...unRound];
          updatedUnRound[lastRoundIndex].LesPropositions[propositionIndex].proposition = parseInt(proposal, 10);
  
          roundsCollectionRef.doc(roundId).update({ unRound: updatedUnRound }).then(() => {
            console.log('Proposition mise à jour avec succès.');
            Toast.show({
              type: 'success',
              text1: 'Proposition soumise',
              text2: `Votre proposition: ${proposal}`,
            });
            comparaison(); // Déclenche la comparaison après la mise à jour
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
    } catch (error) {
      console.error('Erreur lors de la récupération de deviceId :', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Erreur lors de la récupération de l\'identifiant du périphérique.',
      });
    }
  };
  

  const comparaison = async () => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const gameId = GlobalVariables.globalString;
      const roundsCollectionRef = firestore().collection('Round');
      const roundsQuery = roundsCollectionRef.where('gameId', '==', gameId);

      const snapshot = await roundsQuery.get();
      snapshot.forEach(doc => {
        const roundData = doc.data();
        const unRound = roundData.unRound;

        if (unRound && unRound.length > 0) {
          const lastRoundIndex = unRound.length - 1; // Récupérer le dernier index de unRound
          const lastRound = unRound[lastRoundIndex];
          const lesPropositions = lastRound.LesPropositions;

          if (lesPropositions) {
            const userProposition = lesPropositions.find(proposition => proposition.deviceId === deviceId);

            if (userProposition) {
              const comparisonResults = lesPropositions.filter(proposition => proposition.deviceId !== deviceId)
                .map(proposition => {
                  let comparison = '';
                  if (userProposition.proposition > proposition.secretNumber) {
                    comparison = 'plus grand';
                  } else if (userProposition.proposition < proposition.secretNumber) {
                    comparison = 'plus petit';
                  } else {
                    comparison = 'égal';
                  }
                  return {
                    deviceId: proposition.deviceId,
                    secretNumber: proposition.secretNumber,
                    comparison: comparison,
                  };
                });
              setComparisonResults(comparisonResults);
            }
          } else {
            console.warn('LesPropositions is undefined in the last round.');
          }
        } else {
          console.warn('unRound is empty or undefined.');
        }
      });

    } catch (error) {
      console.error('Erreur lors de la comparaison des propositions :', error);
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

      <View style={styles.comparisonSection}>
        <Text style={styles.subtitle}>Résultats de la comparaison :</Text>
        <View>
          {comparisonResults.map((result, index) => (
            <Text key={index}>
              Pour {result.deviceId}: {result.comparison} par rapport à votre proposition de {result.secretNumber}.
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.topSection}>
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
  comparisonSection: {
    marginTop: 16,
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
