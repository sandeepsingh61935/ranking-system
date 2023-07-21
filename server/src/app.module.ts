import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PollsController } from "./polls/polls.controller";
import { PollsModule } from "./polls/polls.module";
import { PollsService } from "./polls/polls.service";
import { REDISModule, jwtModule } from "./config.module";
import { PollsRedisStore } from "./polls/polls.redis.store";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PollsGateway } from "./polls/polls.gateway";
import { SocketIOAdapter } from "./socket.io.adapter";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
  PollsModule,
  REDISModule,
  ConfigModule.forRoot(),
  jwtModule,
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '../../', 'client')
  }),
  ],
  controllers: [AppController, PollsController],
  providers: [AppService, ConfigService, PollsService, PollsRedisStore],
})
export class AppModule { }
