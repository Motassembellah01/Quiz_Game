import { Message } from '@app/model/interfaces/interfaces';
import { ChatService } from '@app/services/chat/chat.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private chatService: ChatService,
        private roomManagerService: RoomManagerService,
    ) {
        this.logger.log('Websocket ChatGateway initialized');
    }

    @SubscribeMessage(ChatEvent.SendMessage)
    sendMessage(socket: Socket, data: Message) {
        this.logger.log('Côté serveur : sendMessage');
        this.chatService.sendMessage(this.server, socket, data);
    }

    @SubscribeMessage(ChatEvent.ChatStateChange)
    changeChatState(socket: Socket, data: [boolean, string]) {
        this.logger.log('Côté serveur : changeChatState');
        const theMessage = {
            id: '',
            sender: 'Système',
            content: '',
            time: new Date(),
        };
        const roomId = this.roomManagerService.getRoomIdBySocketId(socket.id);
        if (this.chatService.getMap() && this.chatService.getMap().get(roomId)) {
            this.chatService
                .getMap()
                .get(roomId)
                .forEach((name, theSocket) => {
                    if (name === data[1]) {
                        if (data[0]) {
                            theMessage.content = 'Vous ne pouvez plus écrire...';
                            theSocket.emit(ChatEvent.NewMessage, JSON.stringify(theMessage));
                        } else {
                            theMessage.content = 'Vous pouvez à nouveau écrire !';
                            theSocket.emit(ChatEvent.NewMessage, JSON.stringify(theMessage));
                        }
                    }
                });
        }
    }

    @SubscribeMessage(ChatEvent.UnblockedRoom)
    unblockChat(socket: Socket) {
        this.logger.log('Côté serveur : UnblockedRoom');
        const theMessage = {
            id: '',
            sender: 'Système',
            content: 'Vous pouvez à nouveau écrire !',
            time: new Date(),
        };
        const roomId = this.roomManagerService.getRoomIdBySocketId(socket.id);
        this.server.to(roomId).emit(ChatEvent.ChatUnblocked, JSON.stringify(theMessage));
    }

    @SubscribeMessage(ChatEvent.MessageSystemAbandon)
    abandonMessageSystem(socket: Socket) {
        const roomId = this.roomManagerService.getRoomIdBySocketId(socket.id);
        const playername = this.roomManagerService.getNameBySocket(socket);
        const theMessage = {
            id: 'abandon',
            sender: 'Système',
            content: `${playername} a abandonné la partie 😭`,
            time: new Date(),
        };
        socket.broadcast.to(roomId).emit(ChatEvent.NewMessage, JSON.stringify(theMessage));
    }

    @OnEvent(ChatEvent.MessageSystemAbandon)
    abandonMessage(socket: Socket) {
        const roomId = this.roomManagerService.getRoomIdBySocketId(socket.id);
        const playername = socket.data.username;
        const theMessage = {
            id: 'abandon',
            sender: 'Système',
            content: `${playername} a abandonné la partie 😭`,
            time: new Date(),
        };
        this.server.to(roomId).emit(ChatEvent.NewMessage, JSON.stringify(theMessage));
    }

    @OnEvent(ChatEvent.BonusPlayer)
    bonusChatEvent(roomId: string, playername: string) {
        this.logger.log('Côté serveur : BonusPlayer in chat');
        const theMessage = {
            id: '',
            sender: 'Bonus',
            content: `attribué à ${playername}`,
            time: new Date(),
        };
        this.server.to(roomId).emit(ChatEvent.NewMessage, JSON.stringify(theMessage));
        const socketPlayer = this.roomManagerService.getSocketIdByName(roomId, playername);
        this.server.to(socketPlayer).emit(ChatEvent.Confetti);
    }
}
