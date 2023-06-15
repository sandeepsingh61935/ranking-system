import { Request } from 'express';
import { Nomination } from 'shared';
import { Socket } from 'socket.io';
// service types
export type CreatePollFields = {
    topic: string;
    votesPerVoter: number;
    name: string;
  };
  
  export type JoinPollFields = {
    pollID: string;
    name: string;
  };
  
  export type RejoinPollFields = {
    pollID: string;
    userID: string;
    name: string;
  };
  
  export type AddParticipantFields = {
    pollID: string;
    userID: string;
    name: string;
  };
  
  export type AddNominationFields = {
    pollID: string;
    userID : string;
    text: string;
  }
  
  // repository types
  export type CreatePollData = {
    pollID: string;
    topic: string;
    votesPerVoter: number;
    userID: string;
  };
  
  export type AddNominationData = {
    pollID: string;
    nominationID : string;
    nomination: Nomination;
  }
  export type RemoveNominationFields = {
    pollID: string;
    nominationID: string
  }
  
// auth-guard type
export type AuthPayload = {
  userID: string;
  pollID: string;
  name: string;
};

type AuthHeader = { headers : {authorization : string}};

export type RequestWithAuth = Request & AuthPayload;
export type AuthRequest = Request & AuthHeader ;
export type SocketWithAuth = Socket & AuthPayload & AuthHeader;
