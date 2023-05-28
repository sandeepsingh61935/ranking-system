import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollsController } from './polls/polls.controller';
import { PollsModule } from './polls/polls.module';

@Module({
  imports: [PollsModule],
  controllers: [AppController, PollsController],
  providers: [AppService],
})
export class AppModule {}
