import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { REDISModule, jwtModule } from 'src/config.module';
import { PollsRedisStore } from './polls.redis.store';
import { PollsGateway } from './polls.gateway';

@Module({
  imports: [ConfigModule, REDISModule,jwtModule ],
  controllers: [PollsController],
  providers: [PollsService, ConfigService, PollsRedisStore, PollsGateway],
})
export class PollsModule {}