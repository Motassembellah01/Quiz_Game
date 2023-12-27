import { ORGANISATOR } from '@app/model/constants';
import { Message } from '@app/model/interfaces/interfaces';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class ChatService {
    ridSocketUsername: Map<string, Map<io.Socket, string>> = new Map();

    constructor(private roomManagerService: RoomManagerService) {
        this.ridSocketUsername = this.roomManagerService.getMapPlayers();
    }

    sendMessage(server: io.Server, socket: io.Socket, message: Message) {
        const messageToSend = message;
        messageToSend.sender = this.getNameBySocket(socket);
        const roomId = this.roomManagerService.getRoomidBySocket(socket);
        server.to(roomId).emit(ChatEvent.NewMessage, JSON.stringify(messageToSend));
    }

    getNameBySocket(socket: io.Socket): string {
        const roomId = this.roomManagerService.getRoomidBySocket(socket);
        let theName = ORGANISATOR;
        this.updateMap();
        this.ridSocketUsername.get(roomId).forEach((name, socketId) => {
            if (socketId === socket) {
                theName = name;
            }
        });

        return theName;
    }

    getMap() {
        return this.ridSocketUsername;
    }

    updateMap() {
        this.ridSocketUsername = this.roomManagerService.getMapPlayers();
    }
}
