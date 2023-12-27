/* eslint-disable max-lines */
import { CentralGateway } from '@app/gateways/central.gateway';
import { GameGateway } from '@app/gateways/game.gateway';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { PlayerScoreStateService } from '@app/services/player-score-state/player-score-state.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { RoomService } from '@app/services/room/room.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ValidateAnswerService } from '@app/services/validate-answer/validate-answer.service';
import { validGames } from '@app/stubs/game-dto.stub';
import { playerResultStubs } from '@app/stubs/player-result.stub';
import { playerScoreStub } from '@app/stubs/player-score.stub';
import {
    serverStub,
    serverStubCallWhitoutData,
    serverStubFirstCall,
    serverStubFirstCallNoRes,
    serverStubNoStringify,
    serverStubSecondCall,
    serverStubThirdCall,
    serverStubCallNoStringify,
    serverStubSecondCallNoRes,
    serverStubSecondCallNoStringify,
    serverStubWithoutRes,
    serverStubFirstCallNoStringify,
} from '@app/stubs/server.stub';
import { DATE } from '@common/constantes/constantes';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStub, SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { TimerGateway } from './timer.gateway';
import { gameStateStubs } from '@app/stubs/game-state.stub';
import { ChartData } from '@common/interfaces/chartData';
import { QRLPlayerScore } from '@app/model/interfaces/interfaces';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let socket: SinonStubbedInstance<Socket>;
    let gameStateService: GameStateService;
    let roomManagerService: RoomManagerService;
    let logger: SinonStubbedInstance<Logger>;
    let eventEmitterMock: jest.Mocked<EventEmitter2>;
    let server: Server;
    let getRoomIdMock;
    const roomId = 'test';
    const validGame = validGames();

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        gameStateService = createStubInstance(GameStateService);
        roomManagerService = createStubInstance(RoomManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                TimerGateway,
                GameStateService,
                RoomManagerService,
                CentralGateway,
                PlayerScoreStateService,
                ValidateAnswerService,
                TimerService,
                RoomService,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: Socket,
                    useValue: socket,
                },
                {
                    provide: GameStateService,
                    useValue: gameStateService,
                },
                {
                    provide: RoomManagerService,
                    useValue: roomManagerService,
                },
                {
                    provide: EventEmitter2,
                    useValue: eventEmitterMock,
                },
            ],
        }).compile();

        eventEmitterMock = {
            emit: jest.fn(),
        } as unknown as jest.Mocked<EventEmitter2>;
        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
        getRoomIdMock = jest.fn().mockReturnValue('test');
        jest.spyOn(roomManagerService, 'getRoomidBySocket').mockImplementation(getRoomIdMock);
        logger.log.resetHistory();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should on startGame() log and give the game to the gameState service to start the game ', () => {
        const body = {
            roomID: 'test',
        };
        const startGameMock = jest.fn();
        jest.spyOn(gameStateService, 'startGame').mockImplementation(startGameMock);
        logger.log.resetHistory();
        gateway.onStartGame(body);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(startGameMock).toHaveBeenCalledWith(body.roomID);
    });

    it('should start the test game with onStartTestGame()', () => {
        const body = validGame[0];

        const startGameMock = jest.fn();
        jest.spyOn(gameStateService, 'startGame').mockImplementation(startGameMock);
        const initializeGameStateMock = jest.fn();
        jest.spyOn(gameStateService, 'initializeGameState').mockImplementation(initializeGameStateMock);
        gateway.onStartTestGame(body, socket);

        expect(logger.log.calledOnce).toBeTruthy();
        expect(initializeGameStateMock).toHaveBeenCalledWith('test', body, expect.objectContaining(new Map([[socket, 'testeur']])), true);
        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(startGameMock).toHaveBeenCalledWith('test');
    });

    it('should update the player answers onPlayerAnswer()', () => {
        const updatePlayerAnswerRoomMock = jest.fn();
        jest.spyOn(gameStateService, 'updatePlayerAnswerRoom').mockImplementation(updatePlayerAnswerRoomMock);

        const dateMock = jest.fn(() => DATE);

        Date.now = dateMock;

        const getNameBySocketMock = jest.fn();
        jest.spyOn(roomManagerService, 'getNameBySocket').mockImplementation(getNameBySocketMock);
        getNameBySocketMock.mockReturnValue('Organisateur');

        serverStubCallWhitoutData(server, roomId, 'SubmitForColor');

        const answer = [true, false, false, true];
        gateway.onPlayerAnswer(answer, socket);
        expect(updatePlayerAnswerRoomMock).toHaveBeenCalledWith('test', socket, answer, DATE);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(dateMock).toHaveBeenCalled();
    });

    it('should update the player answers onPlayerAnswerQRL()', () => {
        const updatePlayerAnswerRoomQRLMock = jest.fn();
        jest.spyOn(gameStateService, 'updatePlayerAnswerRoomQRL').mockImplementation(updatePlayerAnswerRoomQRLMock);

        const getNameBySocketMock = jest.fn();
        jest.spyOn(roomManagerService, 'getNameBySocket').mockImplementation(getNameBySocketMock);
        getNameBySocketMock.mockReturnValue('Allan');

        serverStubCallWhitoutData(server, roomId, 'SubmitForColor');

        const answer = 'lmao';
        gateway.onPlayerAnswerQRL(answer, socket);
        expect(updatePlayerAnswerRoomQRLMock).toHaveBeenCalledWith('test', socket, answer);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
    });

    it('should finish game and delete the room when the organisator quit', () => {
        const deleteGameRoom = jest.fn();
        jest.spyOn(gameStateService, 'deleteGameRoom').mockImplementation(deleteGameRoom);
        serverStubWithoutRes(server, roomId, 'orgLeft');

        gateway.onOrganisatorLeft(socket);

        expect(deleteGameRoom).toHaveBeenCalledWith('test');
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should change the question on onChangeQuestion()', () => {
        const finishTimerMock = jest.fn();
        jest.spyOn(gameStateService, 'finishTimer').mockImplementation(finishTimerMock);

        const startTransitionQuestionMock = jest.fn();
        jest.spyOn(gameStateService, 'startTransitionQuestion').mockImplementation(startTransitionQuestionMock);

        const getGameMock = jest.fn();
        jest.spyOn(gameStateService, 'getGameRoom').mockImplementation(getGameMock);

        jest.spyOn(gameStateService, 'isQrl').mockReturnValue(false);

        const changeTopBarMock = jest.fn();
        jest.spyOn(gateway, 'changeTopBar').mockImplementation(changeTopBarMock);

        serverStubWithoutRes(server, socket.id, 'ResetStates');

        gateway.onChangeQuestion(socket);

        expect(finishTimerMock).toHaveBeenCalledWith('test');
        expect(startTransitionQuestionMock).toHaveBeenCalledWith('test');
        expect(changeTopBarMock).toHaveBeenCalledWith('test');
    });

    it('should onShowResult() emit the routePlayer event to the clients in the room', () => {
        serverStubFirstCallNoRes(server, roomId, 'gameResult');

        serverStubSecondCallNoRes(server, roomId, 'routePlayerResult');

        gateway.onShowResult(socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
    });

    it('should on playerAnswerTest() update the player answer', () => {
        const updatePlayerAnswerRoomMock = jest.fn();
        jest.spyOn(gameStateService, 'updatePlayerAnswerRoom').mockImplementation(updatePlayerAnswerRoomMock);

        const dateMock = jest.fn(() => DATE);
        Date.now = dateMock;

        jest.spyOn(roomManagerService, 'getRoomidBySocket').mockImplementation(getRoomIdMock);
        getRoomIdMock.mockReturnValue(roomId);

        const getNameBySocketMock = jest.fn();
        jest.spyOn(roomManagerService, 'getNameBySocket').mockImplementation(getNameBySocketMock);
        getNameBySocketMock.mockReturnValue('Organisateur');

        serverStubCallWhitoutData(server, roomId, 'SubmitForColor');

        const answer = [true, false, false, true];
        gateway.onPlayerAnswerTest(answer, socket);

        expect(updatePlayerAnswerRoomMock).toHaveBeenCalled();
        expect(logger.log.calledOnce).toBeTruthy();
        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(dateMock).toHaveBeenCalled();
    });

    it('should playerNoSubmit() update the player answer at the end of the timer if the client did not submit ', () => {
        const answer = [true, false, false, true];
        const updatePlayerAnswerRoomMock = jest.fn();
        jest.spyOn(gameStateService, 'updatePlayerAnswerRoom').mockImplementation(updatePlayerAnswerRoomMock);

        serverStubCallWhitoutData(server, roomId, 'SubmitForColor');

        gateway.playerAnswerNoSubmit(answer, socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(updatePlayerAnswerRoomMock).toHaveBeenCalledWith('test', socket, answer, Infinity);
    });

    it('should onJoinTestRoom() join the tester in a test room', () => {
        const number = jest.spyOn(global.Math, 'random').mockReturnValue(1);
        const room = 'test' + number;
        gateway.onJoinTestRoom(socket);
        expect(logger.log.calledTwice).toBeTruthy();
        expect(socket.join.calledWith(room));
        expect(socket.join.calledOnce).toBeTruthy();
    });

    it('should onLeaveTest() delete the test room and remove the test room of the socket', () => {
        const deleteGameRoomMock = jest.fn();
        jest.spyOn(gameStateService, 'deleteGameRoom').mockImplementation(deleteGameRoomMock);

        gateway.onLeaveTestRoom(socket);

        expect(logger.log.calledOnce).toBeTruthy();
        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(socket.leave.calledOnce).toBeTruthy();
        expect(socket.leave.calledWith('test'));
        expect(deleteGameRoomMock).toHaveBeenCalledWith('test');
    });

    it('should onSubmitTestRoom() finish the timer of the room', () => {
        const finishTimerMock = jest.fn();
        jest.spyOn(gameStateService, 'finishTimer').mockImplementation(finishTimerMock);

        gateway.onsubmitTestRoom(socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(finishTimerMock).toHaveBeenCalledWith('test');
    });

    it('should onSelectChoice() updateTheplayeChoice', () => {
        const choices = [false, false, true, true];
        const name = 'testeur';

        const onlyUpdatePlayerChoiceMock = jest.fn();
        jest.spyOn(gameStateService, 'onlyUpdatePlayerChoice').mockImplementation(onlyUpdatePlayerChoiceMock);

        const getNameBySocketMock = jest.fn();
        jest.spyOn(roomManagerService, 'getNameBySocket').mockImplementation(getNameBySocketMock);
        getNameBySocketMock.mockReturnValue('Organisateur');

        serverStubCallNoStringify(server, roomId, 'UpdateColor', name);

        gateway.onSelectChoice(choices, socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(onlyUpdatePlayerChoiceMock).toHaveBeenCalledWith('test', socket, choices);
    });

    it('should onPlayerAbandon() should abandon the player', () => {
        const playerAbandonGameMock = jest.fn();
        jest.spyOn(gameStateService, 'playerAbandonGame').mockImplementation(playerAbandonGameMock);

        gateway.onPlayerAbandon(socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(playerAbandonGameMock).toHaveBeenCalledWith('test', socket);
    });

    it('should onPlayerLeft() should leave the player', () => {
        gateway.onPlayerLeft(socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(socket.leave.calledOnce).toBeTruthy();
        expect(socket.leave.calledWith('test'));
    });

    it('should changeTopBar emit the changeTopBar event to the client', () => {
        serverStubWithoutRes(server, roomId, 'changeTopBar');

        gateway.changeTopBar(roomId);
    });

    it('should getScoreBoard() give the current scoreBoard to the room', () => {
        const map = new Map([['foo', playerScoreStub()[1]]]);
        logger.log.resetHistory();
        const getSocketIdByNameMock = jest.fn().mockReturnValue('1234');
        jest.spyOn(roomManagerService, 'getSocketIdByName').mockImplementation(getSocketIdByNameMock);
        jest.spyOn(gameStateService, 'getGameRoom').mockReturnValue(gameStateStubs()[1]);

        serverStub(server, roomId, 'giveScores', [['foo', playerScoreStub()[1]]]);
        serverStub(server, '1234', 'givePlayerScore', playerScoreStub()[1].score);

        gateway.getScoreBoard(roomId, map);
        expect(getSocketIdByNameMock).toHaveBeenCalledWith('test', 'foo');
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should getCurrentQuestion() give the current question and its answer to the client', () => {
        const questions = validGame[0].questions[0];
        const answer = [true, true, true, true];
        serverStubCallWhitoutData(server, roomId, 'ResetStates');
        serverStubSecondCall(server, roomId, 'giveCurrentQuestion', questions);
        serverStubThirdCall(server, roomId, 'giveCurrentQuestionAnswers', answer);

        gateway.getCurrentQuestion(roomId, questions, answer);

        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should getStatAnswer to give the stat for the graph', () => {
        const hostId = 'test';
        const stats = [0, 1, 2, 3];
        serverStub(server, hostId, 'giveCurrentStatAnswer', stats);

        gateway.getStatAnswer(hostId, stats);

        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should onTimerDone() emit to the client the timerDoneClient event', () => {
        serverStubWithoutRes(server, roomId, 'timerDoneClient');

        gateway.onTimerDone(roomId);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should onGameDone() emit the gameResult and gameDone event', () => {
        const playerResult = [playerResultStubs()[4]];
        serverStubFirstCall(server, roomId, 'gameResult', playerResult);

        serverStubSecondCallNoStringify(server, roomId, 'gameDone', roomId);

        gateway.onGameDone(roomId, playerResult);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should onChangeQuestion() emit to the client the canChangeQuestion event', () => {
        serverStubWithoutRes(server, roomId, 'canChangeQuestion');

        gateway.canChangeQuestion(roomId);
    });

    it('should everyPlayerAnswered() emit to the client the event everyPlayerAnswered', () => {
        serverStubWithoutRes(server, roomId, 'everyPlayerAnswered');

        gateway.everyPlayerAnswered(roomId);
    });

    it('should giveTotalQuestion() give to the client the total amount of question in the game', () => {
        const totalQuestion = 3;
        serverStubNoStringify(server, roomId, 'giveTotalQuestion', totalQuestion);

        gateway.giveTotalQuestion(roomId, totalQuestion);
    });

    it('should execute abandon functions when player refresh the page', () => {
        (server.to as SinonStub).withArgs(socket, roomId).callsFake(() => {
            return {
                emit: (event: string, client: Socket, room: string) => {
                    expect(event).toEqual('playerAbandon');
                    expect(client).toEqual(socket);
                    expect(room).toEqual(roomId);
                },
            };
        });

        const playerAbandonGameMock = jest.fn();
        jest.spyOn(gameStateService, 'playerAbandonGame').mockImplementation(playerAbandonGameMock);
        const abandonRemoveSocketMock = jest.fn();
        jest.spyOn(roomManagerService, 'abandonRemoveSocket').mockImplementation(abandonRemoveSocketMock);

        gateway.onPlayerAbandonRefresh(socket, roomId);

        expect(playerAbandonGameMock).toHaveBeenCalledWith(roomId, socket);
        expect(abandonRemoveSocketMock).toHaveBeenCalledWith(roomId, socket);
    });

    it('should send orgLeft event when the organizer refresh the page', () => {
        serverStubWithoutRes(server, roomId, 'orgLeft');
        const clearRoomMock = jest.fn();
        jest.spyOn(roomManagerService, 'clearRoom').mockImplementation(clearRoomMock);
        const deleteGameRoomMock = jest.fn();
        jest.spyOn(gameStateService, 'deleteGameRoom').mockImplementation(deleteGameRoomMock);

        gateway.onOrganisatorLeftRefresh(roomId);

        expect(roomManagerService.clearRoom).toHaveBeenCalledWith(roomId);
        expect(gameStateService.deleteGameRoom).toHaveBeenCalledWith(roomId);
    });

    it('should onPauseTimer() pause the timer', () => {
        const pauseTimerMock = jest.fn();
        jest.spyOn(gameStateService, 'pauseTimer').mockImplementation(pauseTimerMock);

        gateway.onPauseTimer(socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(pauseTimerMock).toHaveBeenCalledWith(roomId);
    });

    it('should onResumeTimer() resume the timer', () => {
        const resumeTimerMock = jest.fn();
        jest.spyOn(gameStateService, 'resumeTimer').mockImplementation(resumeTimerMock);

        gateway.onResumeTimer(socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(resumeTimerMock).toHaveBeenCalledWith(roomId);
    });

    it('should enablePanic() enable panic mode', () => {
        const enablePanicMock = jest.fn();
        jest.spyOn(gameStateService, 'activatePanic').mockImplementation(enablePanicMock);

        gateway.enablePanic(socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(enablePanicMock).toHaveBeenCalledWith(roomId);
    });

    it('should on the event canEnablePanic unlock the panic mode button', () => {
        serverStubWithoutRes(server, roomId, 'canActivatePanicMode');
        gateway.activatePanic(roomId);
    });

    it('should emit the sorted list on event SortPlayer', () => {
        const body = [
            [
                { name: 'b', score: 0, status: true, chat: true, interaction: false, submit: false },
                { name: 'a', score: 0, status: true, chat: true, interaction: false, submit: false },
            ],
        ];
        serverStubCallWhitoutData(server, socket.id, 'PlayerListSorted');
        gateway.sortPlayer(JSON.stringify(body), socket);
    });

    it('should emit the type of sort on event TypeOfSort', () => {
        const body: [string, boolean] = ['Name', true];
        serverStubCallWhitoutData(server, roomId, 'Sorting');
        gateway.changeSorting(body, socket);

        expect(getRoomIdMock).toHaveBeenCalled();
    });

    it('should emit QRLAnswers when askQRLAnswers() is called', () => {
        const playerAnswers = [
            ['Allan', 'hello'],
            ['Gab', 'hello2'],
        ];

        const getQRLMock = jest.fn().mockReturnValue(playerAnswers);
        jest.spyOn(gameStateService, 'getQRLAnswers').mockImplementation(getQRLMock);

        serverStubNoStringify(server, socket.id, 'askQRLAnswersResponse', playerAnswers);
        gateway.askQRLAnswers(socket);

        expect(getRoomIdMock).toHaveBeenCalledWith(socket);
        expect(getQRLMock).toHaveBeenCalledWith('test');
    });

    it('should emit QRLAnswers when giveOrgQRLAnswers() is called', () => {
        const playerAnswers = [
            ['Allan', 'hello'],
            ['Gab', 'hello2'],
        ] as [string, string][];

        serverStubNoStringify(server, roomId, 'SendQRLAnswersToOrg', playerAnswers);
        gateway.giveOrgQRLAnswers(roomId, playerAnswers);
    });

    it('should send graph when giveGraph() is called', () => {
        const mockChart = [
            { labels: ['one', 'two'], stat: [1, 2], colors: ['red', 'blue'], title: 'hi' },
            { labels: ['two', 'three'], stat: [2, 3], colors: ['blue', 'red'] },
        ] as ChartData[];
        serverStub(server, roomId, 'sendGraphs', mockChart);
        gateway.giveGraph(mockChart, socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('should update the scores and send the qrl to the player when updateQRLScores() is called', () => {
        const mockPlayerScores = [
            { player: 'Allan', score: 10 },
            { player: 'Gab', score: 20 },
        ] as QRLPlayerScore[];

        const socketByIdMock = jest.fn().mockReturnValue('mockId');
        const socketByIdSpy = jest.spyOn(roomManagerService, 'getSocketIdByName').mockImplementation(socketByIdMock);
        const updatePlayerScoreQRLMock = jest.fn();
        jest.spyOn(gameStateService, 'updatePlayerScoreQRL').mockImplementation(updatePlayerScoreQRLMock);

        serverStubFirstCallNoStringify(server, 'mockId', 'QRLScore', mockPlayerScores[0].score);
        serverStubSecondCallNoStringify(server, 'mockId', 'QRLScore', mockPlayerScores[1].score);
        gateway.updateQRLScores(mockPlayerScores, socket);

        expect(updatePlayerScoreQRLMock).toHaveBeenCalledWith(roomId, mockPlayerScores);
        expect(socketByIdSpy).toBeCalledTimes(2);
    });

    it('should change the color with UpdateColor with testeur if name is Organisateur when onFirsrtIneraction() is called', () => {
        const getNameBySocketMock = jest.spyOn(roomManagerService, 'getNameBySocket').mockReturnValue('Organisateur');
        serverStubNoStringify(server, roomId, 'UpdateColor', 'testeur');
        gateway.onFirstInteractionQRL(socket);
        expect(getNameBySocketMock).toHaveBeenCalledWith(socket);
    });

    it('should change the color with UpdateColor with correct name when onFirsrtIneraction() is called', () => {
        const getNameBySocketMock = jest.spyOn(roomManagerService, 'getNameBySocket').mockReturnValue('Allan');
        serverStubNoStringify(server, roomId, 'UpdateColor', 'Allan');
        gateway.onFirstInteractionQRL(socket);
        expect(getNameBySocketMock).toHaveBeenCalledWith(socket);
    });

    it('should send the ActivePlayer event when onPlayerActive() is called', () => {
        serverStubWithoutRes(server, roomId, 'ActivePlayer');
        gateway.onPlayerActive(socket);
    });

    it('should send the IdlePlayer event when onPlayerIdle() is called', () => {
        serverStubWithoutRes(server, roomId, 'IdlePlayer');
        gateway.onPlayerIdle(socket);
    });
});
