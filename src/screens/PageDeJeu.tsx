import React, { createContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo, { getUniqueId } from 'react-native-device-info';
import GlobalVariables from '../../GlobalVariables';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Créer le contexte
//const DeviceIdContext = createContext()

const PageDeJeu = ({ onBack }) => {
  const [secretNumber, setSecretNumber] = useState(null);
  const [proposal, setProposal] = useState('');
  const [waitingMessage, setWaitingMessage] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [proposalCount, setProposalCount] = useState(0);
  const [comparisonResults, setComparisonResults] = useState([]);
  
  const [isEliminated, setIsEliminated] = useState(false);

  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
  
    const checkUser = async () => {
      try {
        const uniqueId = await DeviceInfo.getUniqueId();
        const storedDeviceId = await AsyncStorage.getItem("deviceId");

        if (storedDeviceId !== uniqueId) {
          await AsyncStorage.setItem("deviceId", uniqueId);
        }

        setDeviceId(uniqueId);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'ID de l'appareil : ", error);
      }
    };
    checkUser();
  }, []);
  

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
              const allSecretNumbersAvailable = lastRound.LesPropositions.every(
                prop => prop.secretNumber !== -1
              );
  
              if (allSecretNumbersAvailable) {
                setIsButtonDisabled(false);
              } else {
                setIsButtonDisabled(true);
              }
  
              const allProposalsSubmitted = lastRound.LesPropositions.every(
                prop => (prop.deviceId === deviceId) || (prop.proposition !== -1)
              );
  
              if (allProposalsSubmitted) {
                setWaitingMessage(false);
              } else {
                setWaitingMessage(true);
              }

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

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('ParticipantsElimines')
      .where('gameId', '==', GlobalVariables.globalString)
      .onSnapshot(querySnapshot => {
        let eliminated = false;
  
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const DeviceIdEliminatedParticipants = data.DeviceIdEliminatedParticipants;
  
          DeviceIdEliminatedParticipants.forEach(participant => {
            
            if (participant.elimine === deviceId) {
              eliminated = true;
            }
          });
        });
  
        setIsEliminated(eliminated);
  
        if (eliminated) {
          Alert.alert('Vous êtes éliminé', 'Bye Bye.', [
            { text: 'OK', onPress: () => onBack() }
          ]);
        }
      }, error => {
        console.error('Erreur lors de la vérification du statut d\'élimination : ', error);
      });
  
    return () => unsubscribe();
  }, [GlobalVariables.globalString, deviceId]);
  

  useEffect(() => {

    const gameDocRef = firestore().collection('Games').doc(GlobalVariables.globalString);

    const unsubscribe = gameDocRef.onSnapshot(docSnapshot => {
      if (docSnapshot.exists) {
        const gameData = docSnapshot.data();
        const participants = gameData.GameParticipantDeviceId || [];

        if (participants.length === 1 && participants[0] === deviceId) {
          // L'utilisateur est le seul participant
          Alert.alert('Vous etes le gagnant', 'Felicitations.', [
            { text: 'OK', onPress: () => onBack() }
          ]);
          
        }
      } else {
        console.error('Game document does not exist');
        
      }
    }, error => {
      console.error('Error listening to game document: ', error);
      
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
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
  
        if (proposalCount !== unRound.length) {
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
  
            const allSubmitted = updatedUnRound[lastRoundIndex].LesPropositions.every(
              prop => prop.proposition !== -1
            );
  
            if (allSubmitted) {
              setWaitingMessage(false);
            } else {
              setWaitingMessage(true);
            }
  
            setIsButtonDisabled(!allSubmitted);
  
            comparaison();
  
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
      for (const doc of snapshot.docs) {
        const roundData = doc.data();
        const unRound = roundData.unRound;

        if (unRound && unRound.length > 0) {
          const lastRoundIndex = unRound.length - 1;
          const lastRound = unRound[lastRoundIndex];
          const lesPropositions = lastRound.LesPropositions;

          if (lesPropositions) {
            const userProposition = lesPropositions.find(proposition => proposition.deviceId === deviceId);

            if (userProposition) {
              const comparisonResults = await Promise.all(lesPropositions.filter(proposition => proposition.deviceId !== deviceId)
                .map(async proposition => {
                  let comparison = '';
                  if (userProposition.proposition > proposition.secretNumber) {
                    comparison = 'plus grande';
                  } else if (userProposition.proposition < proposition.secretNumber) {
                    comparison = 'plus petite';
                  } else {
                    comparison = 'égale';
                    await updateParticipantsElimines(gameId, proposition.deviceId, deviceId);
                  }
                  const participantDoc = await firestore()
                    .collection("Players")
                    .doc(proposition.deviceId)
                    .get();
                  let deviceName = '';
                  if (participantDoc.exists) {
                    deviceName = participantDoc.data().deviceName;
                  }
                  return {
                    deviceName: deviceName,
                    secretNumber: proposition.secretNumber,
                    comparison: comparison,
                  };
                }));
              setComparisonResults(comparisonResults);
            }
          } else {
            console.warn('LesPropositions is undefined in the last round.');
          }
        } else {
          console.warn('unRound is empty or undefined.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la comparaison des propositions :', error);
    }
  };

  const updateParticipantsElimines = async (gameId, eliminatedDeviceId, deviceId) => {
    const participantsRef = firestore().collection('ParticipantsElimines');

    try {
      const snapshot = await participantsRef.where('gameId', '==', gameId).get();

      if (!snapshot.empty) {
        const participantDoc = snapshot.docs[0];
        await participantDoc.ref.update({
          DeviceIdEliminatedParticipants: firestore.FieldValue.arrayUnion({ elimine: eliminatedDeviceId, par: deviceId })
        });

        console.log('Données mises à jour avec succès.');
      } else {
        await participantsRef.add({
          gameId: gameId,
          DeviceIdEliminatedParticipants: [{ elimine: eliminatedDeviceId, par: deviceId }]
        });

        console.log('Nouveau document créé avec succès.');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données :', error);
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
          //editable={!waitingMessage}
        />
        <Button
          title="Je valide ma proposition"
          onPress={handleProposalSubmit}
          //disabled={isButtonDisabled || waitingMessage}
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
               Votre proposition est {result.comparison} que le nombre de  {result.deviceName}
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
