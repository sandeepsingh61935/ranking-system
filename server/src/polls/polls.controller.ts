import { Body, Controller, Logger, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './polls.dtos';
import { PollsService } from './polls.service';
import { PollsAuthGuard } from './polls.auth.guard';
import { RequestWithAuth } from 'src/utils/types';

@Controller('polls')
@UsePipes(new ValidationPipe())
export class PollsController {
  private readonly logger = new Logger(PollsController.name);

  constructor(private pollsService: PollsService) {}

  @Post()
  async create(@Body() createPollDto: CreatePollDto) {
    const result = await this.pollsService.createPoll(createPollDto);
    return result;
  }

  @Post('/join')
  async join(@Body() joinPollDto: JoinPollDto) {
    const result = await this.pollsService.joinPoll(joinPollDto);
    return result;
  }
  @UseGuards(PollsAuthGuard)
  @Post('/rejoin')
  async rejoin(@Req() req) {
    const { sub: userID , name, pollID } = req.body;
    const result = await this.pollsService.rejoinPoll({
      name,
      pollID,
      userID,
    });
    return result;
  }
}