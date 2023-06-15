export type Participants = {
    [participantID: string]: string;
  }
export type Nomination = {
  userID: string;
  text: string;
} 
type NominationID = string;
/**
 * {
 *  'User1' : ['2','3','1'],
 *  'User2' : ['3','1','2']
 * }
 */
export type Rankings = {
  [userID: string] : NominationID[]
}
/**
 * Nominations = {
 *  
 *  "2342isdf" : {
 *    "userID": "user1"  ,
 *    "text" : "mcdonald's"
 *  },
 * "2342isdf" : {
 *    "userID": "user1"  ,
 *    "text" : "mcdonald's"
 *  }
 * }
 */
export type Nominations = {
  [nominationID: NominationID] : Nomination
}
  export type Poll = {
    id: string;
    topic: string;
    votesPerVoter: number;
    participants: Participants;
    adminID: string;
    hasStarted: boolean;
    nominations: Nominations;
    rankings: Rankings;
  }