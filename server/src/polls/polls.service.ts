import { Injectable, Logger } from '@nestjs/common';
import { createPollID, createUserID } from '../utils/ids';
import { PollsRedisStore } from './polls.redis.store';
import { CreatePollFields, JoinPollFields, RejoinPollFields } from './types';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);
  constructor(private readonly PollsRedisStore: PollsRedisStore) {}
  async createPoll(fields: CreatePollFields) {
    const pollID = createPollID();
    const userID = createUserID();

    const createdPoll = await this.PollsRedisStore.createPoll({
      ...fields,
      pollID,
      userID,
    });

    // TODO - create an accessToken based off of pollID and userID

    return {
      poll: createdPoll,
      // accessToken
    };
  }

  async joinPoll(fields: JoinPollFields) {
    const userID = createUserID();

    this.logger.debug(
      `Fetching poll with ID: ${fields.pollID} for user with ID: ${userID}`,
    );

    const joinedPoll = await this.PollsRedisStore.getPoll(fields.pollID);

    // TODO - create access Token

    return {
      poll: joinedPoll,
      // accessToken: signedString,
    };
  }

  async rejoinPoll(fields: RejoinPollFields) {
    this.logger.debug(
      `Rejoining poll with ID: ${fields.pollID} for user with ID: ${fields.userID} with name: ${fields.name}`,
    );

    const joinedPoll = await this.PollsRedisStore.addParticipant(fields);

    return joinedPoll;
  }
}