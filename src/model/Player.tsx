import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
const PlayerRef = firestore().collection('Players');
class Player {
    name: string | null;
    email: string;
    maxScore: number | null;
    constructor(name: string | null, maxScore: number | null, email: string) {
        this.name = name;
        this.email = email;
        this.maxScore = maxScore;
    }

    public addPlayer = async (player: Player) => {
        const playersRef = firestore().collection('Players');
        const playerData = {
            name: player.name,
            email: player.email,
            maxScore: player.maxScore,
        };
        try {
            const querySnapshot = await playersRef.where("email","==",player.email).get();

            if (querySnapshot.size>0) {
                console.log('User already exists');
                console.log(querySnapshot.size)
            } else {
                console.log('User does not exist');
                await playersRef.add(playerData);
                //console.log(querySnapshot)
            }
        } catch (error) {
            console.log(error);
        }
    };
}
export {Player};