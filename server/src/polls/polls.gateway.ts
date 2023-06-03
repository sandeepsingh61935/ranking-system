import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';


@WebSocketGateway({
    namespace: 'polls'
})
export class PollsGateway implements OnGatewayInit {
    private readonly logger = new Logger(PollsGateway.name);

    constructor() {}
    afterInit() : void{
        this.logger.log('WS Gateway Initialized');
    }

}


