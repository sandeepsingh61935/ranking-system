import { Injectable, Logger } from "@nestjs/common";
import { createPollID, createUserID } from "../utils/ids";
import { PollsRedisStore } from "./polls.redis.store";
import {
  AddParticipantFields,
  CreatePollFields,
  JoinPollFields,
  RejoinPollFields,
} from "../utils/types";
import { JwtService } from "@nestjs/jwt";
import { Poll } from "shared";

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);
  constructor(
    private readonly PollsRedisStore: PollsRedisStore,
    private readonly jwtService: JwtService
  ) { }
  async createPoll(fields: CreatePollFields) {
    const pollID = createPollID();
    const userID = createUserID();

    const createdPoll = await this.PollsRedisStore.createPoll({
      ...fields,
      pollID,
      userID,
    });

    this.logger.debug(
      `Creating token string for pollID: ${createdPoll.id} and userID: ${userID}`
    );

    const signedString = this.jwtService.sign(
      {
        pollID: createdPoll.id,
        name: fields.name,
      },
      {
        subject: userID,
      }
    );

    return {
      poll: createdPoll,
      accessToken: signedString,
    };
  }

  async joinPoll(fields: JoinPollFields) {
    const userID = createUserID();

    this.logger.debug(
      `Fetching poll with ID: ${fields.pollID} for user with ID: ${userID}`
    );

    const joinedPoll = await this.PollsRedisStore.getPoll(fields.pollID);

    this.logger.debug(
      `Creating token string for pollID: ${joinedPoll.id} and userID: ${userID}`
    );

    const signedString = this.jwtService.sign(
      {
        pollID: joinedPoll.id,
        name: fields.name,
      },
      {
        subject: userID,
      }
    );

    return {
      poll: joinedPoll,
      accessToken: signedString,
    };
  }

  async rejoinPoll(fields: RejoinPollFields) {
    this.logger.debug(
      `Rejoining poll with ID: ${fields.pollID} for user with ID: ${fields.userID} with name: ${fields.name}`
    );

    const joinedPoll = await this.PollsRedisStore.addParticipant(fields);

    return joinedPoll;
  }

  async getPoll(pollID: string) {
    return this.PollsRedisStore.getPoll(pollID);
  }

  async removeParticipant(
    pollID: string,
    userID: string,
  ): Promise<Poll | void> {
    const poll = await this.PollsRedisStore.getPoll(pollID);
    if (!poll.hasStarted) {
      const updatedPoll = await this.PollsRedisStore.removeParticipant(
        pollID,
        userID,
      );
      return updatedPoll;
    }
  }

  async addParticipant(addParticipant: AddParticipantFields): Promise<Poll> {
    return this.PollsRedisStore.addParticipant(addParticipant);
  }
}

