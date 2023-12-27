import { RoomGateway } from '@app/gateways/room.gateway';
import { TimerGateway } from '@app/gateways/timer.gateway';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { PlayerScoreStateService } from '@app/services/player-score-state/player-score-state.service';
import { RecordService } from '@app/services/record/record.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { RoomService } from '@app/services/room/room.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ValidateAnswerService } from '@app/services/validate-answer/validate-answer.service';
import { validGames } from '@app/stubs/game-dto.stub';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';

describe('RoomGateway', () => {
    let gateway: RoomGateway;
    let roomManagerService: RoomManagerService;
    let gameStateService: GameStateService;
    let recordService: RecordService;
    let logger: Logger;
    let eventEmitterMock: jest.Mocked<EventEmitter2>;
    let server: Server;

    const socket = {
        emit: jest.fn(),
        join: jest.fn(),
        leave: jest.fn(),
        rooms: jest.fn(),
    } as unknown as Socket;

    const mockDataPlayer = {
        roomCode: '1234',
        username: 'Grégory',
    };

    const mockQuiz = validGames()[3];

    beforeEach(async () => {
        eventEmitterMock = {
            emit: jest.fn(),
        } as unknown as jest.Mocked<EventEmitter2>;

        server = {
            to: jest.fn(() => ({
                emit: jest.fn(), // Assurez-vous de renvoyer un autre objet avec une méthode emit
            })),
        } as unknown as Server;

        logger = createStubInstance(Logger);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomGateway,
                TimerGateway,
                RoomManagerService,
                RoomService,
                GameStateService,
                PlayerScoreStateService,
                ValidateAnswerService,
                TimerService,
                EventEmitter2,
                RecordService,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: RecordService,
                    useValue: recordService,
                },
            ],
        }).compile();

        gateway = module.get<RoomGateway>(RoomGateway);
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
        gameStateService = module.get<GameStateService>(GameStateService);
        logger = module.get<Logger>(Logger);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should call createRoom', () => {
        const createRoomSpy = jest.fn();
        jest.spyOn(roomManagerService, 'createRoom').mockImplementation(createRoomSpy);
        gateway.createRoom(socket);
        expect(createRoomSpy).toHaveBeenCalledWith(socket, server);
    });

    it('should call DeleteRoom', () => {
        const deleteRoomSpy = jest.fn();
        jest.spyOn(roomManagerService, 'deleteRoom').mockImplementation(deleteRoomSpy);
        gateway.deleteRoom(socket, mockDataPlayer.roomCode);
        expect(deleteRoomSpy).toHaveBeenCalledWith(socket, server, mockDataPlayer.roomCode);
    });

    it('should call joinGame', () => {
        const joinGameSpy = jest.fn();
        jest.spyOn(roomManagerService, 'joinGame').mockImplementation(joinGameSpy);
        gateway.joinGame(socket, mockDataPlayer);
        expect(joinGameSpy).toHaveBeenCalledWith(socket, server, mockDataPlayer);
    });

    it('should call leaveGame', () => {
        const leaveRoomSpy = jest.fn();
        jest.spyOn(roomManagerService, 'leaveRoom').mockImplementation(leaveRoomSpy);
        gateway.leaveGame(socket);
        expect(leaveRoomSpy).toHaveBeenCalled();
    });

    it('should call removePlayer', () => {
        const removePlayerSpy = jest.fn();
        jest.spyOn(roomManagerService, 'removePlayer').mockImplementation(removePlayerSpy);
        gateway.removePlayer(socket, mockDataPlayer);
        expect(removePlayerSpy).toHaveBeenCalledWith(socket, server, mockDataPlayer);
    });

    it('should call lockRoom', () => {
        const lockRoomSpy = jest.fn();
        jest.spyOn(roomManagerService, 'lockRoom').mockImplementation(lockRoomSpy);
        gateway.lockRoom(socket, mockDataPlayer.roomCode);
        expect(lockRoomSpy).toHaveBeenCalled();
    });

    it('should call start', () => {
        const dataGame = {
            roomID: mockDataPlayer.roomCode,
            quiz: mockQuiz,
            players: [],
        };
        const getAllPlayersSpy = jest.fn();
        jest.spyOn(roomManagerService, 'getAllPlayers').mockImplementation(getAllPlayersSpy);
        const getSocketMapSpy = jest.fn();
        jest.spyOn(roomManagerService, 'getSocketMap').mockImplementation(getSocketMapSpy);
        const initializeGameStateSpy = jest.fn();
        jest.spyOn(gameStateService, 'initializeGameState').mockImplementation(initializeGameStateSpy);
        const startTransitionTimerSpy = jest.fn();
        jest.spyOn(gameStateService, 'startTransitionTimer').mockImplementation(startTransitionTimerSpy);
        gateway.start(socket, dataGame);
        expect(getAllPlayersSpy).toHaveBeenCalledWith(socket, server, dataGame.roomID);
        expect(getSocketMapSpy).toHaveBeenCalledWith(dataGame.roomID);
        expect(initializeGameStateSpy).toHaveBeenCalled();
        expect(startTransitionTimerSpy).toHaveBeenCalledWith(dataGame.roomID);
        expect(server.to).toBeCalledWith(dataGame.roomID);
    });

    it('should call onTimerHit0', () => {
        eventEmitterMock.emit('timerHit0', mockDataPlayer.roomCode);
        gateway.onTimerHit0(mockDataPlayer.roomCode);
        expect(server.to).toHaveBeenCalledWith(mockDataPlayer.roomCode);
    });

    it('should call getRoomId', () => {
        const value = gateway.getRoomId(socket);
        expect(value).toEqual(Array.from(socket.rooms)[1]);
    });
});
