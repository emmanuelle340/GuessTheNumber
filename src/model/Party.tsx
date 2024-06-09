import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import {Player} from './Player';

const PartyRef = firestore().collection('Parties');

class Party {

    emailPlayersInGame: string[];
    partyInterval: number | null;
    partyCreatorEmail: string;
    partyStatus: Boolean;
    partyId = PartyRef.doc().id

    constructor(
        emailPlayersInGame: string[] = [],
        partyInterval: number | null = null,
        partyCreatorEmail: string = '',
        partyStatus: Boolean = true,
    ) {
        this.emailPlayersInGame = emailPlayersInGame;
        this.partyInterval = partyInterval;
        this.partyCreatorEmail = partyCreatorEmail;
        this.partyStatus = partyStatus;
    }

    // ajoute une partie dans la base de donnée
    public addParty = async () => {
        try {
            PartyRef
                .add({
                    partyId: PartyRef.doc().id,
                    emailPlayersInGame: this.emailPlayersInGame,
                    partyInterval: this.partyInterval,
                    partyCreatorEmail: this.partyCreatorEmail,
                    partyStatus: this.partyStatus,
                })
                .then(() => {
                    console.log('Party added!');
                });
        } catch (error) {
            console.log(error);
        }
    };

    // ajoute un joueur a une partie
    public addPlayer = async (email:string,partyId:string) => {
        try {
            this.emailPlayersInGame.push(email);
            const querySnapshot = await firestore().collection("Parties").where("partyId", '==', partyId).get();
            if (querySnapshot.size > 0) {

                querySnapshot.forEach(async (snapshot) => {
                    await snapshot.ref.update({emailPlayersInGame:this.emailPlayersInGame})
                    console.log("objet mis a jour")
                })
            }
            else{
                console.log("résultat vide")
            }
        } catch (error) {
            console.log(error);
        }
    }

    public getParties = async () => {
        const snapshot = (await firestore().collection('Parties').where('partyStatus',"==",true).get()).docs;
        let partiesList: FirebaseFirestoreTypes.DocumentData[] = []
        snapshot.forEach((partie) => {
            partiesList.push(partie.data() )
        })
        return partiesList;
    };
}
export {Party};
