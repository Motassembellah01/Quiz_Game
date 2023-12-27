import { ChatService } from '@app/services/chat/chat.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { serverStubFirstCallNoRes, serverStubWithoutRes } from '@app/stubs/server.stub';

interface Message {
    id: string;
    sender: string;
    content: string;
    time: Date;
}

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let chatService: SinonStubbedInstance<ChatService>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let eventEmitterMock: jest.Mocked<EventEmitter2>;
    let getRoomIdMock;
    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        chatService = createStubInstance(ChatService);
        roomManagerService = createStubInstance(RoomManagerService);
        eventEmitterMock = {
            emit: jest.fn(),
        } as unknown as jest.Mocked<EventEmitter2>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: Socket,
                    useValue: socket,
                },
                {
                    provide: ChatService,
                    useValue: chatService,
                },
                {
                    provide: RoomManagerService,
                    useValue: roomManagerService,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
        getRoomIdMock = jest.fn().mockReturnValue('test');
        jest.spyOn(roomManagerService, 'getRoomIdBySocketId').mockImplementation(getRoomIdMock);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should send message by calling message service and also logging a message', () => {
        const message: Message = {
            id: '123',
            sender: 'test',
            content: 'test',
            time: new Date(),
        };

        logger.log.resetHistory();
        gateway.sendMessage(socket, message);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(chatService.sendMessage.calledOnce).toBeTruthy();
        expect(chatService.sendMessage.calledWith(server, socket, message)).toBeTruthy();
    });

    it('should emit ChatBlocked event on event ChatStateChange', () => {
        const roomId = '1234';
        const username = 'player1';
        const data: [boolean, string] = [true, username];
        const socketName = new Map();
        socketName.set(socket, username);

        const theMap = new Map();
        theMap.set(roomId, socketName);

        const getMapMock = jest.fn();
        jest.spyOn(chatService, 'getMap').mockImplementation(getMapMock);
        getMapMock.mockReturnValue(theMap);

        const getMock = jest.fn();
        jest.spyOn(chatService.getMap(), 'get').mockImplementation(getMock);
        getMock.mockReturnValue(socketName);

        gateway.changeChatState(socket, data);

        expect(getRoomIdMock).toHaveBeenCalled();
    });

    it('should emit ChatUnblocked event on event ChatStateChange', () => {
        const roomId = '1234';
        const username = 'player1';
        const data: [boolean, string] = [false, username];
        const socketName = new Map();
        socketName.set(socket, username);

        const theMap = new Map();
        theMap.set(roomId, socketName);

        const getMapMock = jest.fn();
        jest.spyOn(chatService, 'getMap').mockImplementation(getMapMock);
        getMapMock.mockReturnValue(theMap);

        const getMock = jest.fn();
        jest.spyOn(chatService.getMap(), 'get').mockImplementation(getMock);
        getMock.mockReturnValue(socketName);

        gateway.changeChatState(socket, data);

        expect(getRoomIdMock).toHaveBeenCalled();
    });

    it('should emit ChatUnblocked event on UnblockedRoom event', () => {
        const roomId = 'test';
        (server.to as SinonStub).withArgs(roomId).callsFake(() => {
            return {
                emit: (event: string) => {
                    expect(event).toEqual(ChatEvent.ChatUnblocked);
                },
            };
        });
        const socketName = new Map();
        socketName.set(socket, 'username');

        const theMap = new Map();
        theMap.set(roomId, socketName);

        const getMapMock = jest.fn();
        jest.spyOn(chatService, 'getMap').mockImplementation(getMapMock);
        getMapMock.mockReturnValue(theMap);

        gateway.unblockChat(socket);
    });

    it('should emit abandon message when player leave the game', () => {
        Object.defineProperty(socket, 'broadcast', {
            value: {
                to: jest.fn().mockReturnThis(),
                emit: jest.fn(),
            },
            writable: true,
        });
        const roomId = '1234';
        const playername = 'player1';

        const theMessage = {
            id: 'abandon',
            sender: 'Système',
            content: `${playername} a abandonné la partie 😭`,
            time: new Date(),
        };

        const getRoomIdBySocketIdMock = jest.fn();
        jest.spyOn(roomManagerService, 'getRoomIdBySocketId').mockImplementation(getRoomIdBySocketIdMock);
        getRoomIdBySocketIdMock.mockReturnValue(roomId);

        const getNameBySocketMock = jest.fn();
        jest.spyOn(roomManagerService, 'getNameBySocket').mockImplementation(getNameBySocketMock);
        getNameBySocketMock.mockReturnValue(playername);

        const broadcastSpy = jest.spyOn(socket.broadcast, 'to');

        gateway.abandonMessageSystem(socket);

        expect(getRoomIdBySocketIdMock).toHaveBeenCalledWith(socket.id);
        expect(getNameBySocketMock).toHaveBeenCalledWith(socket);
        expect(broadcastSpy).toHaveBeenCalled();

        // You can also check the content of the emitted message if needed
        const emittedMessage = theMessage;
        expect(emittedMessage.sender).toBe('Système');
        expect(emittedMessage.content).toBe(`${playername} a abandonné la partie 😭`);
    });

    it('should emit NewMessage event on MessageSystemAbandon event', () => {
        Object.defineProperty(socket, 'data', {
            value: {
                username: jest.fn(),
            },
            writable: true,
        });
        const roomId = '1234';
        eventEmitterMock.emit('MessageSystemAbandon', socket);

        const getRoomIdBySocketIdMock = jest.fn();
        jest.spyOn(roomManagerService, 'getRoomIdBySocketId').mockImplementation(getRoomIdBySocketIdMock);
        getRoomIdBySocketIdMock.mockReturnValue(roomId);

        serverStubFirstCallNoRes(server, roomId, 'newMessage');

        gateway.abandonMessage(socket);
    });

    it('should emit NewMessage and Confetti events on BonusPlayer event', () => {
        const roomId = '1234';
        const playername = 'player1';
        eventEmitterMock.emit('BonusPlayer', roomId, playername);

        serverStubWithoutRes(server, roomId, 'newMessage');

        const getSocketIdByNameMock = jest.fn();
        jest.spyOn(roomManagerService, 'getSocketIdByName').mockImplementation(getSocketIdByNameMock);
        getSocketIdByNameMock.mockReturnValue(socket);

        serverStubWithoutRes(server, socket, 'Confetti');

        gateway.bonusChatEvent(roomId, playername);
    });
});
