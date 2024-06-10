import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';

const PartyRef = firestore().collection('Parties');

class Party {
    deviceIdsInGame: string[];
    partyInterval: number | null;
    partyCreatorDeviceId: string;
    partyStatus: Boolean;
    partyId = PartyRef.doc().id;

    constructor(
        deviceIdsInGame: string[] = [],
        partyInterval: number | null = null,
        partyCreatorDeviceId: string = '',
        partyStatus: Boolean = true,
    ) {
        this.deviceIdsInGame = deviceIdsInGame;
        this.partyInterval = partyInterval;
        this.partyCreatorDeviceId = partyCreatorDeviceId;
        this.partyStatus = partyStatus;
    }

    // Add a party to the database
    public addParty = async () => {
        try {
            await PartyRef.add({
                partyId: this.partyId,
                deviceIdsInGame: this.deviceIdsInGame,
                partyInterval: this.partyInterval,
                partyCreatorDeviceId: this.partyCreatorDeviceId,
                partyStatus: this.partyStatus,
            });
            console.log('Party added!');
        } catch (error) {
            console.error('Error adding party:', error);
        }
    };

    // Add a player to a party
    public addPlayer = async (deviceId: string, partyId: string) => {
        try {
            this.deviceIdsInGame.push(deviceId);
            const querySnapshot = await PartyRef.where('partyId', '==', partyId).get();
            if (querySnapshot.size > 0) {
                querySnapshot.forEach(async (snapshot) => {
                    await snapshot.ref.update({ deviceIdsInGame: this.deviceIdsInGame });
                    console.log('Player added to the party');
                });
            } else {
                console.log('No matching party found');
            }
        } catch (error) {
            console.error('Error adding player to party:', error);
        }
    };

    // Get active parties
    public getParties = async () => {
        try {
            const snapshot = await PartyRef.where('partyStatus', '==', true).get();
            const partiesList: FirebaseFirestoreTypes.DocumentData[] = [];
            snapshot.forEach((partie) => {
                partiesList.push(partie.data());
            });
            return partiesList;
        } catch (error) {
            console.error('Error getting parties:', error);
            return [];
        }
    };
}

export { Party };
