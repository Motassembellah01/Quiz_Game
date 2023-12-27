import { TimerEvent } from '@common/enum/timer.gateway.events';
import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway({ cors: true })
@Injectable()
export class TimerGateway {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger) {
        this.logger.log('Websocket TimerGateway initialized');
    }

    sendTimerValue(roomId: string, time: number) {
        this.server.to(roomId).emit(TimerEvent.TimerTick, time);
    }
}
