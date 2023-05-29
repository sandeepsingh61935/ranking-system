import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { REDISModule } from 'src/config.module';

@Module({
  imports: [ConfigModule, REDISModule ],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}