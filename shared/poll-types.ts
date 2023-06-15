export type Participants = {
    [participantID: string]: string;
  }
export type Nomination = {
  userID: string;
  text: string;
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
  [nominationID: string] : Nomination
}
  export type Poll = {
    id: string;
    topic: string;
    votesPerVoter: number;
    participants: Participants;
    adminID: string;
    hasStarted: boolean;
    nominations: Nominations;
  }