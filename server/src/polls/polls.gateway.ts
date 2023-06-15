import { BadRequestException, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { PollsService } from './polls.service';
import { SocketWithAuth } from '../utils/types';
import { WsCatchAllFilter } from 'src/exceptions/ws.catch.*.filters';
import { WsBadRequestException } from 'src/exceptions/ws.exceptions';
import { GatewayAdminGuard } from './gateway.admin.guard';
import { NominationDto } from './polls.dtos';

@WebSocketGateway({
  namespace: 'polls'
})
@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PollsGateway.name);
  constructor(private readonly pollsService: PollsService) { }

  @WebSocketServer() io: Namespace;

  // Gateway initialized (provided in module and instantiated)
  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  async handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Socket connected with userID: ${client.userID}, pollID: ${client.pollID}, and name: "${client.name}"`,
    );

    this.logger.log(`WS Client with id: ${client.id} connected!`);
    this.logger.log(`Total clients connected to socket: ${sockets.size}`);
    const roomName = client.pollID;
    await client.join(roomName);
    
    const connectedClients = this.io.adapter.rooms.get(roomName)?.size ?? 0;

    this.logger.log(`UserId : ${client.userID} joined room with name: ${roomName}`);
    this.logger.debug(`Total clients connected to room ${roomName}:${connectedClients}`);
    
    const newParticipant = await this.pollsService.addParticipant({
      userID: client.userID,
      name : client.name,
      pollID: client.pollID
    });

    this.io.to(roomName).emit('poll_updated',newParticipant);
  }

  async handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    const {userID, pollID } = client;

    const updatedPoll = await this.pollsService.removeParticipant(pollID,userID);
    // room => client.pollId. every clients is connected to this room. 
    // so, after freeing a client. log certain messages. 
    const roomName = client.pollID;
    const connectedClients = this.io.adapter.rooms.get(roomName)?.size ?? 0;

    this.logger.log(`UserId : ${client.userID} left room: ${roomName}`);
    this.logger.debug(`Total clients connected to room ${roomName}:${connectedClients}`);
    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);

    // updatedPoll undefined means the poll has already started.
    // And the current user is something unable to connect to the socket.
    // So, this is done to avoid broadcast to all clients.
    if(updatedPoll) {
      this.io.to(roomName).emit('poll_updated',updatedPoll);
    }
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_participant')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.logger.debug(
      `Attempting to remove participant ${id} from poll ${client.pollID}`,
    );

    const updatedPoll = await this.pollsService.removeParticipant(
      client.pollID,
      id,
    );
    if (updatedPoll) {
      this.io.emit('poll_updated', updatedPoll);
    }
  }

  @SubscribeMessage('nominate')
  async nominate(
    @MessageBody() nomination: NominationDto,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to add nomination for user ${client.userID} to poll ${client.pollID}\n${nomination.text}`,
    );

    const updatedPoll = await this.pollsService.addNomination({
      pollID: client.pollID,
      userID: client.userID,
      text: nomination.text,
    });

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_nomination')
  async removeNomination(
    @MessageBody('id') nominationID: string,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to remove nomination ${nominationID} from poll ${client.pollID}`,
    );

    const updatedPoll = await this.pollsService.removeNomination(
      client.pollID,
      nominationID,
    );

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  
  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_nominations')
  async removeNominations(
    @MessageBody('ids') nominationIDs: [string],
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to remove nominations ${nominationIDs} from poll ${client.pollID}`,
    );

    const updatedPoll = await this.pollsService.removeNominations(
      client.pollID,
      nominationIDs,
    );

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('start_vote')
  async startVote(@ConnectedSocket() client: SocketWithAuth) {
    this.logger.debug(`Attempting to start voting for poll: ${client.pollID}`);

    const updatedPoll = await this.pollsService.startPoll(client.pollID);

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @SubscribeMessage('submit_rankings')
  async submitRankings(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody('rankings') rankings: string[],
  ): Promise<void> {
    this.logger.debug(
      `Submitting votes for user: ${client.userID} belonging to pollID: "${client.pollID}"`,
    );

    const updatedPoll = await this.pollsService.submitRankings({
      pollID: client.pollID,
      userID: client.userID,
      rankings,
    });

    // an enhancement might be to not send ranking data to clients,
    // but merely a list of the participants who have voted since another
    // participant getting this data could lead to cheating
    // we may add this while working on the client
    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }
}