import { Message } from '@app/model/interfaces/interfaces';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { messageStub } from '@app/stubs/message.stub';
import { serverStub } from '@app/stubs/server.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let socket: SinonStubbedInstance<Socket>;
    let socket2: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let getRoomIdMock;
    const roomId = 'test';
    const roomManagerService = createStubInstance(RoomManagerService);
    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                RoomManagerService,
                {
                    provide: RoomManagerService,
                    useValue: roomManagerService,
                },
                {
                    provide: Socket,
                    useValue: socket,
                },
                {
                    provide: Socket,
                    useValue: socket2,
                },
            ],
        }).compile();
        service = module.get<ChatService>(ChatService);
        service['server'] = server;
        getRoomIdMock = jest.fn().mockReturnValue('test');
        jest.spyOn(roomManagerService, 'getRoomidBySocket').mockImplementation(getRoomIdMock);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should update the map to the one in the roomManagerService', () => {
        const mapPlayer = new Map();
        mapPlayer.set(roomId, new Map());
        mapPlayer.get(roomId).set(socket, 'foo');
        const roomManagerServiceMock = jest.fn().mockReturnValue(mapPlayer);
        jest.spyOn(roomManagerService, 'getMapPlayers').mockImplementation(roomManagerServiceMock);
        service.updateMap();
        expect(service.ridSocketUsername.has(roomId)).toBeTruthy();
        expect(service.ridSocketUsername.get(roomId).has(socket)).toBeTruthy();
        expect(service.ridSocketUsername.get(roomId).get(socket)).toBe('foo');
    });

    it('should send a message to the room', () => {
        const message: Message = messageStub();

        const getNameBySocketMock = jest.fn().mockReturnValue('bidon');
        jest.spyOn(service, 'getNameBySocket').mockImplementation(getNameBySocketMock);

        serverStub(server, 'test', 'newMessage', message);

        service.sendMessage(server, socket, message);
        expect(getNameBySocketMock).toHaveBeenCalled();
        expect(getRoomIdMock).toHaveBeenCalled();
    });

    it('should get the name by the socket', () => {
        const spyUpdateMap = jest.spyOn(service, 'updateMap');

        const map = new Map();
        map.set('test', new Map());
        map.get('test').set(socket2, 'bidon');

        const roomManagerServiceMock = jest.fn().mockReturnValue(map);
        jest.spyOn(roomManagerService, 'getMapPlayers').mockImplementation(roomManagerServiceMock);

        const res = service.getNameBySocket(socket2);

        expect(res).toBe('bidon');
        expect(getRoomIdMock).toHaveBeenCalled();
        expect(roomManagerServiceMock).toHaveBeenCalled();
        expect(spyUpdateMap).toHaveBeenCalled();
    });

    it('if the sender socket is not a player it should return the name Organisateur', () => {
        const spyUpdateMap = jest.spyOn(service, 'updateMap');

        const map = new Map();
        map.set('test', new Map());
        map.get('test').set(socket2, 'bidon');

        const roomManagerServiceMock = jest.fn().mockReturnValue(map);
        jest.spyOn(roomManagerService, 'getMapPlayers').mockImplementation(roomManagerServiceMock);

        const res = service.getNameBySocket(socket);

        expect(res).toBe('Organisateur');
        expect(getRoomIdMock).toHaveBeenCalled();
        expect(roomManagerServiceMock).toHaveBeenCalled();
        expect(spyUpdateMap).toHaveBeenCalled();
    });

    it('should get the map', () => {
        const theMap = new Map();
        theMap.set('1234', new Map());
        theMap.get('1234').set(socket, 'player1');
        service.ridSocketUsername = theMap;

        const map = service.getMap();

        expect(map).toEqual(theMap);
    });
});
