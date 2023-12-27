import { ORGANISATOR } from '@app/model/constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { CentralEvent } from '@common/enum/central.gateway.event';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { GameEvent } from '@common/enum/game.gateway.events';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class CentralGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private roomManagerService: RoomManagerService,
        private eventEmitter: EventEmitter2,
    ) {
        this.logger.log('Websocket central initialized');
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        this.server.emit(CentralEvent.Hello, `from ${socket.id}`);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        this.server.emit(CentralEvent.Bye, `from ${socket.id}`);
        this.eventEmitter.emit(ChatEvent.MessageSystemAbandon, socket);
        const roomid = this.roomManagerService.getRoomIdBySocketId(socket.id);
        if (socket.data.username === ORGANISATOR) this.eventEmitter.emit(GameEvent.OrganisatorLeft, roomid);
        else if (socket.data.username !== '') {
            this.eventEmitter.emit(GameEvent.PlayerAbandon, socket, roomid);
            this.roomManagerService.playerQuitLobby({ roomCode: roomid, username: socket.data.username }, this.server, socket);
        }
    }
}
