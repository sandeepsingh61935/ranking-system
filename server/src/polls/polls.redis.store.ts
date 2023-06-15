import { Inject, InternalServerErrorException } from "@nestjs/common";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import { IORedisKey } from "src/redis.module";
import { AddNominationData, AddParticipantFields, AddParticipantRankingsData, CreatePollData } from "../utils/types";
import { Nominations, Poll } from "shared";
import { WsBadRequestException } from "src/exceptions/ws.exceptions";

@Injectable()
export class PollsRedisStore {
  // to use time-to-live from configuration
  private readonly ttl: string;
  private readonly logger = new Logger(PollsRedisStore.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis
  ) {
    this.ttl = configService.get("POLL_DURATION");
  }

  async createPoll({
    votesPerVoter,
    topic,
    pollID,
    userID,
  }: CreatePollData): Promise<Poll> {
    const initialPoll = {
      id: pollID,
      topic,
      votesPerVoter,
      participants: {},
      hasStarted: false,
      adminID: userID,
      nominations: {},
      rankings: {}
    };

    this.logger.log(
      `Creating new poll: ${JSON.stringify(initialPoll, null, 2)} with TTL ${this.ttl
      }`
    );

    const key = `polls:${pollID}`;

    try {
      await this.redisClient
        .multi()
        .set(key, JSON.stringify(initialPoll, null, 2))
        .expire(key, this.ttl)
        .exec();

      return initialPoll;
    } catch (e) {
      this.logger.error(
        `Failed to add poll ${JSON.stringify(initialPoll)}\n${e}`
      );
      throw new InternalServerErrorException();
    }
  }

  async getPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Attempting to get poll with: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.get(key);

      this.logger.verbose(currentPoll);

      // if (currentPoll?.hasStarted) {
      //   throw new BadRequestException('The poll has already started');
      // }

      return JSON.parse(currentPoll);
    } catch (e) {
      this.logger.error(`Failed to get pollID ${pollID}`);
      throw e;
    }
  }

  async addParticipant({
    pollID,
    userID,
    name,
  }: AddParticipantFields): Promise<Poll> {
    this.logger.log(
      `Attempting to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`
    );

    const key = `polls:${pollID}`;

    try {
      let redisStoredValue = await this.redisClient.get(key);
      let pollJSON = JSON.parse(redisStoredValue);
      pollJSON.participants[userID] = name;

      await this.redisClient.set(key, JSON.stringify(pollJSON));

      const poll = pollJSON as Poll;

      this.logger.debug(
        `Current Participants for pollID: ${pollID}:`,
        poll.participants
      );

      return poll;
    } catch (e) {
      this.logger.error(
        `Failed to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`
      );
      throw e;
    }
  }

  async removeParticipant(pollID: string, userID: string): Promise<Poll> {
    this.logger.log(`removing userID: ${userID} from poll: ${pollID}`);

    const key = `polls:${pollID}`;
    try {
      let redisStoredValue = await this.redisClient.get(key);
      let pollJSON = JSON.parse(redisStoredValue);
      delete pollJSON.participants[userID];
      await this.redisClient.set(key, JSON.stringify(pollJSON));
      const poll = pollJSON as Poll;
      return poll;
    } catch (e) {
      this.logger.error(
        `Failed to remove userID: ${userID} from poll: ${pollID}`,
        e
      );
      throw new InternalServerErrorException("Failed to remove participant");
    }
  }

  /**
   * 
   * @param pollID string
   * @param nominationID string
   * @param nomination Nomination 
   * @returns 
   */
  async addNomination({
    pollID,
    nominationID,
    nomination,
  }: AddNominationData): Promise<Poll> {
    this.logger.log(
      `Attempting to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
    );

    const key = `polls:${pollID}`;
    const nominationPath = `.nominations.${nominationID}`;
    const text = nomination.text;
    try {

      let redisStoredValue = await this.redisClient.get(key);
      let pollJSON = JSON.parse(redisStoredValue);
      if (!await this.isNominationUnique(pollJSON.nominations, text)) {
        throw new WsBadRequestException(`Given nomination with text: ${text} already exists`);
      }
      pollJSON.nominations[nominationID] = nomination;

      await this.redisClient.set(key, JSON.stringify(pollJSON));


      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to add a nomination with nominationID/text: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
        e,
      );
      if (e instanceof WsBadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException(
        `Failed to add a nomination with nominationID/text: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
      );
    }
  }

  /**
   * 
   * @param pollID string
   * @param nominationID string
   * @returns updatedPoll Poll
   */
  async removeNomination(pollID: string, nominationID: string): Promise<Poll> {
    this.logger.log(
      `removing nominationID: ${nominationID} from poll: ${pollID}`,
    );

    const key = `polls:${pollID}`;
    const nominationPath = `.nominations.${nominationID}`;

    try {
      let redisStoredValue = await this.redisClient.get(key);
      let pollJSON = JSON.parse(redisStoredValue);
      delete pollJSON.nominations[nominationID];
      await this.redisClient.set(key, JSON.stringify(pollJSON));
      const poll = pollJSON as Poll;
      return poll;
    } catch (e) {

      this.logger.error(
        `Failed to remove nominationID: ${nominationID} from poll: ${pollID}`,
        e,
      );

      throw new InternalServerErrorException(
        `Failed to remove nominationID: ${nominationID} from poll: ${pollID}`,
      );
    }
  }


  async isNominationUnique(nominations: Nominations, text: string): Promise<boolean> {
    for (const key of Object.keys(nominations)) {
      if (nominations[key].text === text) return false;
    }
    return true;
  }

  async removeNominations(pollID: string, nominationIDs: [string]): Promise<Poll> {
    this.logger.log(
      `removing nominationIDs: ${nominationIDs} from poll: ${pollID}`,
    );

    const key = `polls:${pollID}`;
    try {
      let redisStoredValue = await this.redisClient.get(key);
      let pollJSON = JSON.parse(redisStoredValue);
      const nominations = pollJSON.nominations;

      for (const nominationID of Object.keys(nominations)) {
        if (nominationIDs.includes(nominationID))
          delete pollJSON.nominations[nominationID];
      }
      await this.redisClient.set(key, JSON.stringify(pollJSON));
      const poll = pollJSON as Poll;
      return poll;
    }
    catch (e) {
      this.logger.error(
        `Failed to remove nominationIDs: ${nominationIDs} from poll: ${pollID}`,
        e,
      );

      throw new InternalServerErrorException(
        `Failed to remove nominationIDs: ${nominationIDs} from poll: ${pollID}`,
      );
    }
  }
  async startPoll(pollID: string): Promise<Poll> {
    this.logger.log(`setting hasStarted for poll : ${pollID}`);
    const key = `polls:${pollID}`;

    try {
      let redisStoredValue = await this.redisClient.get(key);
      let pollJSON = JSON.parse(redisStoredValue);
      pollJSON.hasStarted = true;
      await this.redisClient.set(key,JSON.stringify(pollJSON));
      return pollJSON as Poll;
    }
    catch(error) {
      this.logger.error(`Failed to set hasStarted for poll: ${pollID}`);
      throw new InternalServerErrorException('Occured whiling setting hasStarted')
    }
  }

  async addParticipantRankings({
    pollID,
    userID,
    rankings,
  }: AddParticipantRankingsData): Promise<Poll> {
    this.logger.log(
      `Attempting to add rankings for userID/name: ${userID} to pollID: ${pollID}`,
      rankings,
    );

    const key = `polls:${pollID}`;
    const rankingsPath = `.rankings.${userID}`;

    try {

      let redisStoredValue = await this.redisClient.get(key);
      let pollJSON = JSON.parse(redisStoredValue);
      pollJSON.rankings[userID] = rankings;
      await this.redisClient.set(
        key,
        JSON.stringify(pollJSON),
      );
      return pollJSON as Poll;
      
    } catch (e) {
      this.logger.error(
        `Failed to add a rankings for userID/name: ${userID}/ to pollID: ${pollID}`,
        rankings,
      );
      throw new InternalServerErrorException(
        'There was an error starting the poll',
      );
    }
  }
}
