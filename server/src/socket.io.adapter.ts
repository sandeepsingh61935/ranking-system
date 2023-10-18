import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Namespace, Server, ServerOptions } from 'socket.io';
import { SocketWithAuth } from './utils/types';
import { PollsModule } from './polls/polls.module';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = parseInt(this.configService.get('CLIENT_PORT'));

    const cors = {
      origin: [
        `http://localhost:${clientPort}`,
        `http://127.0.0.1:${clientPort}`,
        `http://peakrater.duckdns.org:${clientPort}`,
        `http://54.144.198.82:${clientPort}`,
        `ws://54.144.198.82:${clientPort}`
      ],
      methods: ["POST","GET"]
    };

    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors
    };

    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port,optionsWithCORS);
    server.of('polls').use(createTokenMiddleware(jwtService, this.logger));

    return server;
  }
}


const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket: SocketWithAuth, next) => {
    const token =  socket.handshake.auth?.token;
    logger.debug(`Validating auth token before connection: ${token}`); 

    try {
      const payload = jwtService.verify(token);
      socket.userID = payload.sub;
      socket.pollID = payload.pollID;
      socket.name = payload.name;
      next();
    } catch {
      next(new Error('FORBIDDEN'));
    }
  };