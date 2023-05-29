import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollsController } from './polls/polls.controller';
import { PollsModule } from './polls/polls.module';
import { PollsService } from './polls/polls.service';

@Module({
  imports: [PollsModule],
  controllers: [AppController, PollsController],
  providers: [AppService,PollsService],
})
export class AppModule {}
