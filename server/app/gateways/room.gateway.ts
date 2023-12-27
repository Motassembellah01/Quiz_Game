/* eslint-disable prettier/prettier */
import { DataPlayerJoin } from '@app/model/interfaces/interfaces';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { TimerEvent } from '@common/enum/timer.gateway.events';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class RoomGateway {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private roomManagerService: RoomManagerService,
        private gameStateService: GameStateService,
    ) {
        this.logger.log('Websocket RoomGateway initialized');
    }

    @SubscribeMessage(RoomEvent.CreateRoom)
    createRoom(socket: Socket) {
        this.logger.log('Côté serveur : createRoom');
        this.roomManagerService.createRoom(socket, this.server);
    }

    @SubscribeMessage(RoomEvent.DeleteRoom)
    deleteRoom(socket: Socket, roomID: string) {
        this.logger.log('Côté serveur : deleteRoom');
        this.roomManagerService.deleteRoom(socket, this.server, roomID);
    }

    @SubscribeMessage(RoomEvent.JoinGame)
    joinGame(socket: Socket, data: DataPlayerJoin) {
        const player = data as DataPlayerJoin;
        this.logger.log('Côté serveur : joinGame');
        this.roomManagerService.joinGame(socket, this.server, player);
    }

    @SubscribeMessage(RoomEvent.LeaveRoom)
    leaveGame(socket: Socket) {
        this.logger.log('Côté serveur : leaveGame');
        const roomId = this.getRoomId(socket);
        this.roomManagerService.leaveRoom(socket, this.server, roomId);
    }

    @SubscribeMessage(RoomEvent.RemovePlayer)
    removePlayer(socket: Socket, data: DataPlayerJoin) {
        this.logger.log('Côté serveur : RemovePlayer');
        this.roomManagerService.removePlayer(socket, this.server, data);
    }

    @SubscribeMessage(RoomEvent.LockRoom)
    lockRoom(socket: Socket, data: string) {
        this.logger.log('Côté serveur : LockRoom');
        this.roomManagerService.lockRoom(socket, this.server, data);
    }

    @SubscribeMessage(RoomEvent.Start)
    start(socket: Socket, data) {
        this.logger.log('Côté serveur : Start');
        this.roomManagerService.getAllPlayers(socket, this.server, data.roomID);
        const map = this.roomManagerService.getSocketMap(data.roomID);
        this.gameStateService.initializeGameState(data.roomID, data.quiz, map, false);
        this.gameStateService.startTransitionTimer(data.roomID);
        this.server.to(data.roomID).emit(RoomEvent.DisplayTimer);
    }

    @OnEvent(TimerEvent.TimerHit0)
    onTimerHit0(roomId: string) {
        this.server.to(roomId).emit(RoomEvent.RoutePlayer, roomId);
    }

    getRoomId(socket: Socket) {
        return this.roomManagerService.getRoomidBySocket(socket);
    }
}
