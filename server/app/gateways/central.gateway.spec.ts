import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from 'eventemitter2';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { CentralGateway } from './central.gateway';

describe('CentralGateway', () => {
    let gateway: CentralGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let eventEmitter: SinonStubbedInstance<EventEmitter2>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        roomManagerService = createStubInstance(RoomManagerService);
        eventEmitter = createStubInstance(EventEmitter2);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CentralGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: Socket,
                    useValue: socket,
                },
                {
                    provide: RoomManagerService,
                    useValue: roomManagerService,
                },
                {
                    provide: EventEmitter2,
                    useValue: eventEmitter,
                },
            ],
        }).compile();

        gateway = module.get<CentralGateway>(CentralGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('hello message should be sent on connection', () => {
        gateway.handleConnection(socket);
        expect(server.emit.calledWith('hello', `from ${socket.id}`)).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        socket.data = { username: 'bidon' };
        logger.log.resetHistory();
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should emit the correct event when the organizer leaves', () => {
        const roomid = 'someRoomId';
        socket.data = { username: 'Organisateur' };
        const spy = jest.fn().mockReturnValue(roomid);
        jest.spyOn(roomManagerService, 'getRoomIdBySocketId').mockImplementation(spy);

        gateway.handleDisconnect(socket);

        expect(spy).toHaveBeenCalledWith(socket.id);
        expect(eventEmitter.emit.calledTwice).toBeTruthy();
        expect(eventEmitter.emit.calledWith(GameEvent.OrganisatorLeft, roomid)).toBeTruthy();
    });

    it('should emit the correct event when player abandons', () => {
        const roomid = 'someRoomId';
        const playerName = 'PlayerName';
        socket.data = { username: playerName };
        const spy = jest.fn().mockReturnValue(roomid);
        jest.spyOn(roomManagerService, 'getRoomIdBySocketId').mockImplementation(spy);

        gateway.handleDisconnect(socket);
        expect(spy).toHaveBeenCalledWith(socket.id);
        expect(eventEmitter.emit.calledTwice).toBeTruthy();
        expect(eventEmitter.emit.calledWith(GameEvent.PlayerAbandon, socket, roomid)).toBeTruthy();
    });
});
