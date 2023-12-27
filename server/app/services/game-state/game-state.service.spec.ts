/* eslint-disable max-lines */
import { TimerGateway } from '@app/gateways/timer.gateway';
import { RecordDto } from '@app/model/dto/record.dto';
import { GameState, QRLPlayerScore } from '@app/model/interfaces/interfaces';
import { PlayerScoreStateService } from '@app/services/player-score-state/player-score-state.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ValidateAnswerService } from '@app/services/validate-answer/validate-answer.service';
import { validGames } from '@app/stubs/game-dto.stub';
import { gameStateStubs } from '@app/stubs/game-state.stub';
import { questionValidStubs } from '@app/stubs/question.stub';
import { FIFTY, FIVE, ONE_HUNDRED, ONE_SECOND_DELAY, SEVENTY_FIVE, SIXTY, THREE_SECOND_DELAY } from '@common/constantes/constantes';
import { GameEvent } from '@common/enum/game.gateway.events';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { TimerState } from '@common/enum/timer.gateway.events';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import { RecordService } from '@app/services/record/record.service';
import { GameStateService } from './game-state.service';

describe('GameStateService', () => {
    let service: GameStateService;
    let eventEmitterMock: EventEmitter2;
    let playerScoreStateService: PlayerScoreStateService;
    let validateAnswerService: ValidateAnswerService;
    let timerService: TimerService;
    let socket: SinonStubbedInstance<Socket>;
    let initializeGameScoreBoardMock;
    let initializePlayerAnswerMock;
    let initializeTimerServiceMock;
    let getStatAnswerMock;
    let testHandlerMock;
    let changeQuestionMock;
    let emitMock;
    let delayMock;
    let addPlayerPointsMock;
    let getCurrentScoreBoardMock;
    let incrementQuestionMock;
    let isLastQuestionMock;
    let finishGameMock;
    let getCurrentQuestionRoomMock;
    let clearAnswerLobbyMock;
    let startTimerRoomMock;
    let deleteScoreRoomMock;
    let deletePlayersRoomMock;
    let deleteTimerMock;
    let updatePlayerAnswerMock;
    let verifyBonusApplyMock;
    let updateSubmitMock;
    let verifyEveryPlayerAnsweredMock;
    let recordService: RecordService;
    let setTimerDurationMock;
    let clearTimerMock;
    let activatePanicMock;
    let addRecordMock;
    let bestScoreMock;
    let isQrlMock;
    const validQuestions = validGames()[0].questions;
    const validGame = validGames()[0];
    const roomId = 'test';
    const playerResult = [
        {
            name: 'foo',
            score: 10,
            bonus: 10,
            rank: 10,
        },
    ];

    beforeEach(async () => {
        playerScoreStateService = createStubInstance(PlayerScoreStateService);
        validateAnswerService = createStubInstance(ValidateAnswerService);
        timerService = createStubInstance(TimerService);
        recordService = createStubInstance(RecordService);
        eventEmitterMock = createStubInstance(EventEmitter2);
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameStateService,
                PlayerScoreStateService,
                ValidateAnswerService,
                TimerService,
                EventEmitter2,
                TimerGateway,
                Logger,
                RecordService,
                {
                    provide: PlayerScoreStateService,
                    useValue: playerScoreStateService,
                },
                {
                    provide: ValidateAnswerService,
                    useValue: validateAnswerService,
                },
                {
                    provide: TimerService,
                    useValue: timerService,
                },
                {
                    provide: EventEmitter2,
                    useValue: eventEmitterMock,
                },
                {
                    provide: Socket,
                    useValue: socket,
                },
                {
                    provide: RecordService,
                    useValue: recordService,
                },
            ],
        }).compile();
        service = module.get<GameStateService>(GameStateService);
        initializeGameScoreBoardMock = jest.fn();
        initializePlayerAnswerMock = jest.fn();
        initializeTimerServiceMock = jest.fn();
        getStatAnswerMock = jest.fn();
        testHandlerMock = jest.fn();
        changeQuestionMock = jest.fn();
        emitMock = jest.fn();
        delayMock = jest.fn();
        addPlayerPointsMock = jest.fn();
        getCurrentScoreBoardMock = jest.fn();
        incrementQuestionMock = jest.fn();
        isLastQuestionMock = jest.fn();
        finishGameMock = jest.fn();
        getCurrentQuestionRoomMock = jest.fn();
        clearAnswerLobbyMock = jest.fn();
        startTimerRoomMock = jest.fn();
        deleteScoreRoomMock = jest.fn();
        deletePlayersRoomMock = jest.fn();
        deleteTimerMock = jest.fn();
        updatePlayerAnswerMock = jest.fn();
        verifyBonusApplyMock = jest.fn();
        updateSubmitMock = jest.fn();
        verifyEveryPlayerAnsweredMock = jest.fn();
        setTimerDurationMock = jest.fn();
        clearTimerMock = jest.fn();
        activatePanicMock = jest.fn();
        bestScoreMock = jest.fn();
        addRecordMock = jest.fn();
        isQrlMock = jest.fn();

        jest.spyOn(recordService, 'addRecord').mockImplementation(addRecordMock);
        jest.spyOn(playerScoreStateService, 'getBestScore').mockImplementation(bestScoreMock);
        jest.spyOn(timerService, 'activatePanic').mockImplementation(activatePanicMock);
        jest.spyOn(timerService, 'clearTimerRoom').mockImplementation(clearTimerMock);
        jest.spyOn(timerService, 'setTimerDuration').mockImplementation(setTimerDurationMock);
        jest.spyOn(service, 'getStatAnswer').mockImplementation(getStatAnswerMock);
        jest.spyOn(validateAnswerService, 'verifyBonusApply').mockImplementation(verifyBonusApplyMock);
        jest.spyOn(validateAnswerService, 'updateSubmit').mockImplementation(updateSubmitMock);
        jest.spyOn(validateAnswerService, 'verifyEveryPlayerAnswered').mockImplementation(verifyEveryPlayerAnsweredMock);
        jest.spyOn(validateAnswerService, 'updatePlayerAnswer').mockImplementation(updatePlayerAnswerMock);
        jest.spyOn(playerScoreStateService, 'deleteScoreRoom').mockImplementation(deleteScoreRoomMock);
        jest.spyOn(timerService, 'deleteTimer').mockImplementation(deleteTimerMock);
        jest.spyOn(validateAnswerService, 'deletePlayersRoom').mockImplementation(deletePlayersRoomMock);
        jest.spyOn(validateAnswerService, 'clearAnswerLobby').mockImplementation(clearAnswerLobbyMock);
        jest.spyOn(timerService, 'startTimerRoom').mockImplementation(startTimerRoomMock);
        jest.spyOn(service, 'getCurrentQuestionRoom').mockImplementation(getCurrentQuestionRoomMock);
        jest.spyOn(service, 'finishGame').mockImplementation(finishGameMock);
        jest.spyOn(playerScoreStateService, 'initializeGameScoreBoard').mockImplementation(initializeGameScoreBoardMock);
        jest.spyOn(validateAnswerService, 'initializePlayerAnswer').mockImplementation(initializePlayerAnswerMock);
        jest.spyOn(timerService, 'initializeTimer').mockImplementation(initializeTimerServiceMock);
        jest.spyOn(service, 'testHandler').mockImplementation(testHandlerMock);
        jest.spyOn(service, 'changeQuestion').mockImplementation(changeQuestionMock);
        jest.spyOn(eventEmitterMock, 'emit').mockImplementation(emitMock);
        jest.spyOn(service, 'delay').mockImplementation(delayMock);
        jest.spyOn(validateAnswerService, 'addPointsPlayer').mockImplementation(addPlayerPointsMock);
        jest.spyOn(service, 'getCurrentScoreBoardRoom').mockImplementation(getCurrentScoreBoardMock);
        jest.spyOn(service, 'incrementQuestion').mockImplementation(incrementQuestionMock);
        jest.spyOn(service, 'isQrl').mockImplementation(isQrlMock);
        jest.spyOn(service, 'isLastQuestion').mockImplementation(isLastQuestionMock);
        jest.spyOn(playerScoreStateService, 'getCurrentScoreBoard').mockImplementation(getCurrentScoreBoardMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a delay of 3 approximately 3 seconds', async () => {
        jest.spyOn(service, 'delay').mockRestore();
        const startTime = Date.now();
        const duration = THREE_SECOND_DELAY;

        await service.delay(duration);

        const endTime = Date.now();
        const delay = endTime - startTime;

        expect(delay).toBeGreaterThanOrEqual(duration - ONE_HUNDRED);
        expect(delay).toBeLessThanOrEqual(duration + ONE_HUNDRED);
    });

    it('should initialize the gameState of a lobby', () => {
        const playerMap = new Map([[socket, 'foo']]);

        jest.useFakeTimers().setSystemTime(new Date('2023-11-09T03:05:27.100Z'));
        service.initializeGameState(roomId, validGame, playerMap, true);

        expect(service.gamesState.has(roomId)).toBeTruthy();
        expect(initializeGameScoreBoardMock).toHaveBeenCalledWith(roomId, playerMap);
        expect(initializePlayerAnswerMock).toHaveBeenCalledWith(roomId, playerMap);
        expect(initializeTimerServiceMock).toHaveBeenCalledWith(roomId);
        expect(JSON.stringify(service.gamesState.get(roomId))).toEqual(JSON.stringify(gameStateStubs()[2]));
    });

    it('isLastQuestion should return true if its the last question', () => {
        jest.spyOn(service, 'isLastQuestion').mockRestore();
        const gameState: GameState = gameStateStubs()[0];
        service.gamesState.set(roomId, gameState);
        const res = service.isLastQuestion(gameState);
        expect(res).toBeTruthy();
    });

    it('isLastQuestion should return false if its  not the last question', () => {
        jest.spyOn(service, 'isLastQuestion').mockRestore();
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        const res = service.isLastQuestion(gameState);
        expect(res).toBeFalsy();
    });

    it('should change question of the room and not call testHandler if not a test', async () => {
        jest.spyOn(service, 'changeQuestionRoom').mockRestore();
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        await service.changeQuestionRoom(roomId);

        expect(emitMock).toHaveBeenCalledWith(GameEvent.ChangeTopBar, roomId);
        expect(testHandlerMock).not.toHaveBeenCalled();
        expect(changeQuestionMock).toHaveBeenCalledWith(roomId, gameState);
        expect(getStatAnswerMock).toHaveBeenCalledWith(roomId);
    });

    it('should change question of the room and call testHandler if a test', async () => {
        const gameState: GameState = gameStateStubs()[2];
        service.gamesState.set(roomId, gameState);

        await service.changeQuestionRoom(roomId);

        expect(emitMock).not.toHaveBeenCalledWith(GameEvent.ChangeTopBar, roomId);
        expect(testHandlerMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(changeQuestionMock).toHaveBeenCalledWith(roomId, gameState);
        expect(getStatAnswerMock).toHaveBeenCalledWith(roomId);
    });

    it('should onWaitVerify() emit canChangeQuestion to client', async () => {
        const gameState: GameState = gameStateStubs()[2];
        service.gamesState.set(roomId, gameState);

        await service.waitVerify(roomId);

        expect(emitMock).toHaveBeenCalledWith(GameEvent.TimerDoneClient, roomId);
        expect(delayMock).toHaveBeenCalledWith(ONE_SECOND_DELAY);
        expect(addPlayerPointsMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(getCurrentScoreBoardMock).toHaveBeenCalledWith(roomId);
        expect(emitMock).toHaveBeenCalledWith(GameEvent.CanChangeQuestion, roomId);
    });

    it('should changeQuestion', () => {
        jest.spyOn(service, 'changeQuestion').mockRestore();
        const gameState: GameState = gameStateStubs()[2];
        service.gamesState.set(roomId, gameState);

        isLastQuestionMock.mockReturnValue(false);

        const continueGameSpy = jest.spyOn(service, 'continueGame');

        service.changeQuestion(roomId, gameState);

        expect(incrementQuestionMock).toHaveBeenCalledWith(gameState);
        expect(isLastQuestionMock).toHaveBeenCalledWith(gameState);
        expect(continueGameSpy).toHaveBeenCalledWith(roomId, gameState);
    });

    it('should endGame if its the lastQuestion', () => {
        jest.spyOn(service, 'changeQuestion').mockRestore();
        const gameState: GameState = gameStateStubs()[2];
        service.gamesState.set(roomId, gameState);
        isLastQuestionMock.mockReturnValue(true);

        const continueGameSpy = jest.spyOn(service, 'continueGame');

        service.changeQuestion(roomId, gameState);

        expect(incrementQuestionMock).toHaveBeenCalledWith(gameState);
        expect(isLastQuestionMock).toHaveBeenCalledWith(gameState);
        expect(continueGameSpy).not.toHaveBeenCalledWith(roomId, gameState);
        expect(finishGameMock).toHaveBeenCalledWith(roomId);
    });

    it('should handle a test mode', async () => {
        jest.spyOn(service, 'testHandler').mockRestore();
        const gameState: GameState = gameStateStubs()[2];
        service.gamesState.set(roomId, gameState);

        await service.testHandler(roomId, gameState.currentQuestion);

        expect(emitMock).toHaveBeenCalledWith(GameEvent.TimerDoneClient, roomId);
        expect(delayMock).toHaveBeenCalledWith(THREE_SECOND_DELAY);
        expect(addPlayerPointsMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(getCurrentScoreBoardMock).toHaveBeenCalledWith(roomId);
    });

    it('should continue the game for a test mode', () => {
        const gameState: GameState = gameStateStubs()[2];
        service.gamesState.set(roomId, gameState);

        service.continueGame(roomId, gameState);

        expect(getCurrentQuestionRoomMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(clearAnswerLobbyMock).toHaveBeenCalledWith(roomId);
        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, gameState.timeQuestion);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Test);
        expect(startTimerRoomMock).not.toHaveBeenCalledWith(roomId, TimerState.Attendre);
    });

    it('should continue the game for a test mode and set the time to a qrl time if current question is a qrl', () => {
        const gameState: GameState = gameStateStubs()[2];
        gameState.currentIndex = 1;
        gameState.currentQuestion = gameState.questions[gameState.currentIndex];
        service.gamesState.set(roomId, gameState);
        jest.spyOn(service, 'isQrl').mockRestore();
        service.continueGame(roomId, gameState);

        expect(getCurrentQuestionRoomMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(clearAnswerLobbyMock).toHaveBeenCalledWith(roomId);
        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, SIXTY);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Test);
        expect(startTimerRoomMock).not.toHaveBeenCalledWith(roomId, TimerState.Attendre);
    });

    it('should continue the game for a normal game mode', () => {
        jest.spyOn(service, 'continueGame').mockRestore();
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        service.continueGame(roomId, gameState);

        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, gameState.timeQuestion);
        expect(getCurrentQuestionRoomMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(clearAnswerLobbyMock).toHaveBeenCalledWith(roomId);
        expect(startTimerRoomMock).not.toHaveBeenCalledWith(roomId, TimerState.Test);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Attendre);
    });

    it('should continue the game for a normal game mode and set the timer to a qrl time if current question is a qrl', () => {
        const gameState: GameState = gameStateStubs()[2];
        gameState.currentIndex = 1;
        gameState.currentQuestion = gameState.questions[gameState.currentIndex];
        gameState.isTest = false;
        service.gamesState.set(roomId, gameState);
        jest.spyOn(service, 'isQrl').mockRestore();
        service.continueGame(roomId, gameState);

        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, SIXTY);
        expect(getCurrentQuestionRoomMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(clearAnswerLobbyMock).toHaveBeenCalledWith(roomId);
        expect(startTimerRoomMock).not.toHaveBeenCalledWith(roomId, TimerState.Test);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Attendre);
    });

    it('should increment the question', () => {
        jest.spyOn(service, 'incrementQuestion').mockRestore();
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        const currentIndex = gameState.currentIndex;
        const currentQuestion = gameState.currentQuestion;

        service.incrementQuestion(gameState);

        expect(gameState.currentIndex).not.toEqual(currentIndex);
        expect(JSON.stringify(gameState.currentQuestion)).not.toEqual(JSON.stringify(currentQuestion));
        expect(gameState.currentIndex).toBe(1);
        expect(JSON.stringify(gameState.currentQuestion)).toEqual(JSON.stringify(gameStateStubs()[1].questions[1]));
    });

    it('should skip a qrl question', () => {
        jest.spyOn(service, 'skipQRL').mockRestore();
        jest.spyOn(service, 'incrementQuestion').mockRestore();
        jest.spyOn(service, 'isQrl').mockRestore();
        const gameState: GameState = gameStateStubs()[3];
        const question = questionValidStubs()[0];

        gameState.questions.push(question);
        service.gamesState.set(roomId, gameState);
        service.skipQRL(gameState);

        expect(gameState.currentIndex).toBe(2);
        expect(JSON.stringify(gameState.currentQuestion)).toEqual(JSON.stringify(question));
    });

    it('should isQrl should return true if its a qrl', () => {
        const gameState: GameState = gameStateStubs()[3];
        service.gamesState.set(roomId, gameState);

        isQrlMock.mockReturnValue(true);

        const res = service.isQrl(gameState);
        expect(res).toBeTruthy();
    });

    it('should isQrl should return false if its a qcm', () => {
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        isQrlMock.mockReturnValue(false);

        const res = service.isQrl(gameState);
        expect(res).toBeFalsy();
    });
    it('should finish the game', () => {
        jest.spyOn(service, 'finishGame').mockRestore();
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        const getFinalResultMock = jest.fn().mockReturnValue(playerResult);
        jest.spyOn(service, 'getFinalResult').mockImplementation(getFinalResultMock);

        const deleteGameRoomMock = jest.fn();
        jest.spyOn(service, 'deleteGameRoom').mockImplementation(deleteGameRoomMock);

        service.finishGame(roomId);

        expect(getFinalResultMock).toHaveBeenCalledWith(roomId);
        expect(emitMock).toBeCalledWith(GameEvent.EndGame, roomId, playerResult);
        expect(emitMock).toBeCalledWith(RoomEvent.RemovePlayerRoom, roomId);
        // expect(deleteGameRoomMock).toHaveBeenCalledWith(roomId);
    });

    it('should getTheCurrenQuestion', () => {
        jest.spyOn(service, 'getCurrentQuestionRoom').mockRestore();
        const question = validQuestions[0];
        const answer = [false, false, false, false];
        const getCurrentAnswerQuestionMock = jest.fn().mockReturnValue(answer);
        jest.spyOn(service, 'getCurrentAnswerQuestion').mockImplementation(getCurrentAnswerQuestionMock);
        service.getCurrentQuestionRoom(roomId, question);

        expect(emitMock).toHaveBeenCalledWith(GameEvent.GiveQuestion, roomId, question, answer);
        expect(getCurrentAnswerQuestionMock).toHaveBeenCalledWith(question);
    });

    it('should get the current answer of the question', () => {
        jest.spyOn(service, 'getCurrentScoreBoardRoom').mockRestore();
        const question = validQuestions[0];

        const res = service.getCurrentAnswerQuestion(question);
        expect(JSON.stringify(res)).toEqual(JSON.stringify([true, false]));
    });

    it('should start the game in test mode', () => {
        jest.spyOn(service, 'startGame').mockRestore();
        service.gamesState.clear();
        const gameState: GameState = gameStateStubs()[2];

        const getGameRoomMock = jest.fn().mockReturnValue(gameState);
        jest.spyOn(service, 'getGameRoom').mockImplementation(getGameRoomMock);

        service.startGame(roomId);

        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, gameState.timeQuestion);
        expect(getGameRoomMock).toHaveBeenCalledWith(roomId);
        expect(getCurrentQuestionRoomMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(getCurrentScoreBoardMock).toHaveBeenCalledWith(roomId);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Test);
    });

    it('should start the game in test mode and give the right time for a qrl', () => {
        jest.spyOn(service, 'startGame').mockRestore();
        service.gamesState.clear();
        const gameState: GameState = gameStateStubs()[2];
        gameState.currentIndex = 1;
        gameState.currentQuestion = gameState.questions[gameState.currentIndex];
        const getGameRoomMock = jest.fn().mockReturnValue(gameState);
        jest.spyOn(service, 'getGameRoom').mockImplementation(getGameRoomMock);
        jest.spyOn(service, 'isQrl').mockRestore();
        service.startGame(roomId);

        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, SIXTY);
        expect(getGameRoomMock).toHaveBeenCalledWith(roomId);
        expect(getCurrentQuestionRoomMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(getCurrentScoreBoardMock).toHaveBeenCalledWith(roomId);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Test);
    });

    it('should start the game in normal mode', () => {
        const gameState: GameState = gameStateStubs()[1];

        const getGameRoomMock = jest.fn().mockReturnValue(gameState);
        jest.spyOn(service, 'getGameRoom').mockImplementation(getGameRoomMock);
        service.startGame(roomId);

        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, gameState.timeQuestion);
        expect(getGameRoomMock).toHaveBeenCalledWith(roomId);
        expect(getCurrentQuestionRoomMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(getCurrentScoreBoardMock).toHaveBeenCalledWith(roomId);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Attendre);
        expect(emitMock).toHaveBeenCalledWith(GameEvent.GiveTotalQuestion, roomId, gameState.totalquestion);
    });

    it('should start the game in normal mode and set to qrl time if current question is a qrl', () => {
        service.gamesState.clear();
        const gameState: GameState = gameStateStubs()[2];
        gameState.currentIndex = 1;
        gameState.currentQuestion = gameState.questions[gameState.currentIndex];
        gameState.isTest = false;
        const getGameRoomMock = jest.fn().mockReturnValue(gameState);
        jest.spyOn(service, 'getGameRoom').mockImplementation(getGameRoomMock);
        jest.spyOn(service, 'isQrl').mockRestore();
        service.startGame(roomId);

        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, SIXTY);
        expect(getGameRoomMock).toHaveBeenCalledWith(roomId);
        expect(getCurrentQuestionRoomMock).toHaveBeenCalledWith(roomId, gameState.currentQuestion);
        expect(getCurrentScoreBoardMock).toHaveBeenCalledWith(roomId);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Attendre);
        expect(emitMock).toHaveBeenCalledWith(GameEvent.GiveTotalQuestion, roomId, gameState.totalquestion);
    });

    it('should finish the timer in a room', () => {
        const finishTimerMock = jest.fn();
        jest.spyOn(timerService, 'finishTimer').mockImplementation(finishTimerMock);
        jest.spyOn(service, 'isQrl').mockReturnValue(false);

        service.finishTimer(roomId);

        expect(finishTimerMock).toHaveBeenCalledWith(roomId);
    });

    it('should startTransitionTimer in a room', () => {
        service.startTransitionTimer(roomId);
        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, FIVE);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.Transition5s);
    });

    it('should startTransitionQuestion on a room', () => {
        service.startTransitionQuestion(roomId);
        expect(setTimerDurationMock).toHaveBeenCalledWith(roomId, 3);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, TimerState.TransitionQuestion);
    });

    it('should update player answer of the room and event an event if every player has submitted', () => {
        const playerAns = [false, true, true, true];
        const timeResquest = 10;
        const gameState: GameState = gameStateStubs()[0];
        service.gamesState.set(roomId, gameState);
        const validateAnswerMock = jest.fn().mockReturnValue(true);
        jest.spyOn(validateAnswerService, 'validatePlayerAnswer').mockImplementation(validateAnswerMock);
        jest.spyOn(service, 'isQrl').mockReturnValue(false);
        verifyEveryPlayerAnsweredMock.mockReturnValue(true);
        socket.data = { username: 'bidon' };
        service.updatePlayerAnswerRoom(roomId, socket, playerAns, timeResquest);

        expect(validateAnswerMock).toHaveBeenCalledWith(roomId, socket.data.username, gameState.currentQuestion);
        expect(verifyBonusApplyMock).toHaveBeenCalledWith(roomId, timeResquest, socket);
        expect(updatePlayerAnswerMock).toHaveBeenCalledWith(roomId, socket, playerAns);
        expect(updateSubmitMock).toHaveBeenCalledWith(roomId, socket);
        expect(verifyEveryPlayerAnsweredMock).toHaveBeenLastCalledWith(roomId);
        expect(emitMock).toHaveBeenCalledWith(GameEvent.EveryPlayerAnswered, roomId);
    });

    it('should update player answer of the room and not throw an event  if every player have not submitted', () => {
        const playerAns = [false, true, true, true];
        const timeResquest = 10;
        const gameState: GameState = gameStateStubs()[0];
        service.gamesState.set(roomId, gameState);
        socket.data = { username: 'bidon' };
        verifyEveryPlayerAnsweredMock.mockReturnValue(false);
        const validateAnswerMock = jest.fn().mockReturnValue(true);
        jest.spyOn(validateAnswerService, 'validatePlayerAnswer').mockImplementation(validateAnswerMock);
        service.updatePlayerAnswerRoom(roomId, socket, playerAns, timeResquest);

        expect(validateAnswerMock).toHaveBeenCalledWith(roomId, socket.data.username, gameState.currentQuestion);
        expect(verifyBonusApplyMock).toHaveBeenCalledWith(roomId, timeResquest, socket);
        expect(updatePlayerAnswerMock).toHaveBeenCalledWith(roomId, socket, playerAns);
        expect(updateSubmitMock).toHaveBeenCalledWith(roomId, socket);
        expect(verifyEveryPlayerAnsweredMock).toHaveBeenLastCalledWith(roomId);
        expect(emitMock).not.toHaveBeenCalledWith(GameEvent.EveryPlayerAnswered, roomId);
    });

    it('should update player answer of the room and update the sameTimeSubmit if time request is infinity', () => {
        const playerAns = [false, true, true, true];
        const timeResquest = Infinity;
        const gameState: GameState = gameStateStubs()[0];
        service.gamesState.set(roomId, gameState);
        socket.data = { username: 'bidon' };

        verifyEveryPlayerAnsweredMock.mockReturnValue(false);
        const validateAnswerMock = jest.fn().mockReturnValue(true);
        jest.spyOn(validateAnswerService, 'validatePlayerAnswer').mockImplementation(validateAnswerMock);

        const updateSameTimeSubmitMock = jest.fn();
        jest.spyOn(validateAnswerService, 'updateSameTimeSubmit').mockImplementation(updateSameTimeSubmitMock);

        service.updatePlayerAnswerRoom(roomId, socket, playerAns, timeResquest);

        expect(updateSameTimeSubmitMock).toHaveBeenCalledWith(roomId);
        expect(validateAnswerMock).toHaveBeenCalledWith(roomId, socket.data.username, gameState.currentQuestion);
        expect(verifyBonusApplyMock).toHaveBeenCalledWith(roomId, timeResquest, socket);
        expect(updatePlayerAnswerMock).toHaveBeenCalledWith(roomId, socket, playerAns);
        expect(updateSubmitMock).toHaveBeenCalledWith(roomId, socket);
        expect(verifyEveryPlayerAnsweredMock).toHaveBeenLastCalledWith(roomId);
        expect(emitMock).not.toHaveBeenCalledWith(GameEvent.EveryPlayerAnswered, roomId);
    });

    it('should only update the player choice for the stats', () => {
        jest.spyOn(service, 'onlyUpdatePlayerChoice').mockRestore();

        const playerChoices = [false, false, false, true];

        service.onlyUpdatePlayerChoice(roomId, socket, playerChoices);

        expect(updatePlayerAnswerMock).toHaveBeenCalledWith(roomId, socket, playerChoices);
        expect(getStatAnswerMock).toHaveBeenCalledWith(roomId);
    });

    it('should update the player status when a player abandon the game', () => {
        const updatePlayerStatusMock = jest.fn();
        jest.spyOn(validateAnswerService, 'updatePlayerStatus').mockImplementation(updatePlayerStatusMock);

        service.playerAbandonGame(roomId, socket);

        expect(updatePlayerStatusMock).toHaveBeenLastCalledWith(roomId, socket);
        expect(getCurrentScoreBoardMock).toHaveBeenLastCalledWith(roomId);
    });

    it('should add the players points in the lobby', () => {
        const question = validQuestions[0];

        service.addPlayerPoints(roomId, question);

        expect(addPlayerPointsMock).toHaveBeenCalledWith(roomId, question);
    });

    it('should get the gameState of the specific room', () => {
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        const game = service.getGameRoom(roomId);

        expect(JSON.stringify(game)).toEqual(JSON.stringify(gameState));
    });

    it('should get the stat answer for the graph', () => {
        jest.spyOn(service, 'getStatAnswer').mockRestore();
        const statAns = [FIFTY, FIFTY, SIXTY, SEVENTY_FIVE];
        const formatPlayerAnswerMock = jest.fn().mockReturnValue(statAns);
        jest.spyOn(validateAnswerService, 'formatPlayerAnswer').mockImplementation(formatPlayerAnswerMock);
        jest.spyOn(service, 'isQrl').mockReturnValue(false);

        service.getStatAnswer(roomId);
        expect(formatPlayerAnswerMock).toHaveBeenCalledWith(roomId);
        expect(emitMock).toHaveBeenCalledWith(GameEvent.GiveStatAnswer, roomId, statAns);
    });

    it('should get the current scoreboard of a room', () => {
        const playerScore = {
            score: 10,
            bonus: 0,
            status: true,
        };
        const scoreboard = new Map([['foo', playerScore]]);
        jest.spyOn(service, 'getCurrentScoreBoardRoom').mockRestore();
        getCurrentScoreBoardMock.mockReturnValue(scoreboard);
        service.getCurrentScoreBoardRoom(roomId);

        expect(getCurrentScoreBoardMock).toHaveBeenCalledWith(roomId);
        expect(emitMock).toHaveBeenCalledWith(GameEvent.GiveScore, roomId, scoreboard);
    });

    it('should get the final result of the game', () => {
        const returnFinalResultMock = jest.fn().mockReturnValue(playerResult);
        jest.spyOn(playerScoreStateService, 'returnFinalResult').mockImplementation(returnFinalResultMock);

        const res = service.getFinalResult(roomId);

        expect(JSON.stringify(res)).toEqual(JSON.stringify(playerResult));
        expect(returnFinalResultMock).toHaveBeenCalledWith(roomId);
    });

    it('should delete a game room when the game is done', () => {
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        service.deleteGameRoom(roomId);

        expect(service.gamesState.has(roomId)).toBeFalsy();
        expect(deletePlayersRoomMock).toHaveBeenCalledWith(roomId);
        expect(deleteScoreRoomMock).toHaveBeenCalledWith(roomId);
        expect(deleteTimerMock).toHaveBeenCalledWith(roomId);
    });

    it('should verify panic mode with the question type and emit an event if eligible to do so', () => {
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);

        service.verifyPanicModeQCM(roomId, 'QCM');

        expect(emitMock).toHaveBeenCalledWith('canEnablePanic', roomId);
    });

    it('should verify panic mode with the question type and emit an event if eligible to do so', () => {
        const gameState: GameState = gameStateStubs()[1];
        gameState.currentQuestion = gameState.questions[1];
        service.gamesState.set(roomId, gameState);

        service.verifyPanicModeQCM(roomId, 'QRL');

        expect(emitMock).toHaveBeenCalledWith('canEnablePanic', roomId);
    });

    it('should verify panic mode with the question type and not emit an event if not eligible to do so', () => {
        const gameState: GameState = gameStateStubs()[1];
        gameState.currentQuestion = gameState.questions[1];
        service.gamesState.set(roomId, gameState);

        service.verifyPanicModeQCM(roomId, 'TEST');

        expect(emitMock).not.toHaveBeenCalledWith('canEnablePanic', roomId);
    });

    it('should pause the timer', () => {
        service.pauseTimer(roomId);
        expect(clearTimerMock).toHaveBeenCalledWith(roomId);
    });

    it('should resume the timer', () => {
        service.resumeTimer(roomId);
        expect(startTimerRoomMock).toHaveBeenCalledWith(roomId, 'attendre');
    });

    it('should activate panic mode', () => {
        service.activatePanic(roomId);
        expect(activatePanicMock).toHaveBeenCalledWith(roomId);
    });

    it('should create a new record of a game', () => {
        const gameState: GameState = gameStateStubs()[1];
        service.gamesState.set(roomId, gameState);
        bestScoreMock.mockReturnValue(ONE_HUNDRED);

        const record: RecordDto = {
            name: gameState.gameName,
            date: gameState.startDate.toISOString(),
            totalPlayer: gameState.totalPlayers,
            bestScore: 100,
        };
        service.createRecord(roomId);

        expect(bestScoreMock).toHaveBeenCalledWith(roomId);
        expect(addRecordMock).toHaveBeenCalledWith(record);
    });

    it('should execute onWaitVerifyQCM method successfully', async () => {
        const game = gameStateStubs()[0];
        jest.spyOn(service.gamesState, 'get').mockReturnValue(game);

        jest.spyOn(validateAnswerService, 'addPointsPlayer').mockImplementation();
        jest.spyOn(service, 'getCurrentScoreBoardRoom').mockImplementation();
        jest.spyOn(eventEmitterMock, 'emit').mockImplementation();

        await service.onWaitVerifyQCM(roomId);

        expect(eventEmitterMock.emit).toHaveBeenCalledWith(GameEvent.TimerDoneClient, roomId);
        expect(service.delay).toHaveBeenCalledWith(ONE_SECOND_DELAY);
        expect(validateAnswerService.addPointsPlayer).toHaveBeenCalledWith(roomId, game.currentQuestion);
        expect(service.getCurrentScoreBoardRoom).toHaveBeenCalledWith(roomId);
        expect(eventEmitterMock.emit).toHaveBeenCalledWith(GameEvent.CanChangeQuestion, roomId);
    });

    it('should execute onWaitVerifyQRL method successfully', async () => {
        const game = gameStateStubs()[0];
        jest.spyOn(service.gamesState, 'get').mockReturnValue(game);

        jest.spyOn(validateAnswerService, 'addPointsPlayerQRL').mockImplementation();
        jest.spyOn(service, 'getCurrentScoreBoardRoom').mockImplementation();
        jest.spyOn(eventEmitterMock, 'emit').mockImplementation();

        await service.onWaitVerifyQRL(roomId);

        expect(service.delay).toHaveBeenCalledWith(ONE_SECOND_DELAY);
        expect(validateAnswerService.addPointsPlayerQRL).toHaveBeenCalledWith(roomId, game.currentQuestion);
        expect(service.getCurrentScoreBoardRoom).toHaveBeenCalledWith(roomId);
        expect(eventEmitterMock.emit).toHaveBeenCalledWith(GameEvent.CanChangeQuestion, roomId);
    });

    it('should finish timer and send QRL answers to org if QRL game', () => {
        const game = gameStateStubs()[0];
        jest.spyOn(service, 'getGameRoom').mockReturnValue(game);

        jest.spyOn(validateAnswerService, 'getPlayerAnswersQRL').mockReturnValue([
            ['player1', 'answer1'],
            ['player2', 'answer2'],
        ]);
        jest.spyOn(eventEmitterMock, 'emit').mockImplementation();
        jest.spyOn(timerService, 'finishTimer').mockImplementation();

        service.finishTimer(roomId);

        expect(timerService.finishTimer).toHaveBeenCalledWith(roomId);

        if (service.isQrl(game)) {
            expect(eventEmitterMock.emit).toHaveBeenCalledWith(GameEvent.SendQRLAnswersToOrg, roomId, ['answer1', 'answer2']);
        } else {
            expect(eventEmitterMock.emit).not.toHaveBeenCalledWith(GameEvent.SendQRLAnswersToOrg, roomId, expect.any(Array));
        }
    });

    it('should finish timer and send QRL answers to org if it is a QRL room', () => {
        jest.spyOn(service, 'isQrl').mockReturnValue(true);
        jest.spyOn(validateAnswerService, 'getPlayerAnswersQRL').mockReturnValue([
            ['player1', 'answer1'],
            ['player2', 'answer2'],
        ]);
        jest.spyOn(eventEmitterMock, 'emit').mockImplementation();
        jest.spyOn(timerService, 'finishTimer').mockImplementation();

        service.finishTimer(roomId);

        expect(service.isQrl).toHaveBeenCalledWith(service.getGameRoom(roomId));
        expect(validateAnswerService.getPlayerAnswersQRL).toHaveBeenCalledWith(roomId);
        expect(eventEmitterMock.emit).toHaveBeenCalledWith(GameEvent.SendQRLAnswersToOrg, roomId, [
            ['player1', 'answer1'],
            ['player2', 'answer2'],
        ]);
        expect(timerService.finishTimer).toHaveBeenCalledWith(roomId);
    });

    it('should update player score for QRL and trigger onWaitVerifyQRL', async () => {
        const playerScores: QRLPlayerScore[] = [
            { player: 'player1', score: 10 },
            { player: 'player2', score: 20 },
        ];

        jest.spyOn(validateAnswerService, 'updatePlayerScoreQRL').mockImplementation();
        jest.spyOn(service, 'onWaitVerifyQRL').mockImplementation();

        service.updatePlayerScoreQRL(roomId, playerScores);

        expect(validateAnswerService.updatePlayerScoreQRL).toHaveBeenCalledWith(roomId, playerScores);
        expect(service.onWaitVerifyQRL).toHaveBeenCalledWith(roomId);
    });

    it('should update player status and trigger events when player abandons game', () => {
        const player = createStubInstance(Socket);

        jest.spyOn(validateAnswerService, 'updatePlayerStatus').mockImplementation();
        jest.spyOn(service, 'getCurrentScoreBoardRoom').mockImplementation();
        jest.spyOn(validateAnswerService, 'verifyEveryPlayerAnswered').mockReturnValue(true);
        jest.spyOn(eventEmitterMock, 'emit').mockImplementation();
        jest.spyOn(service, 'finishTimer').mockImplementation();

        service.playerAbandonGame(roomId, player);

        expect(validateAnswerService.updatePlayerStatus).toHaveBeenCalledWith(roomId, player);
        expect(service.getCurrentScoreBoardRoom).toHaveBeenCalledWith(roomId);
        expect(eventEmitterMock.emit).toHaveBeenCalledWith(GameEvent.EveryPlayerAnswered, roomId);
        expect(service.finishTimer).toHaveBeenCalledWith(roomId);
    });

    it('should return QRL answers for a given room', () => {
        const expectedAnswers: [string, string][] = [
            ['Player1', 'Answer1'],
            ['Player2', 'Answer2'],
        ];

        jest.spyOn(validateAnswerService, 'getPlayerAnswersQRL').mockReturnValue(expectedAnswers);

        const result = service.getQRLAnswers(roomId);

        expect(result).toEqual(expectedAnswers);
        expect(validateAnswerService.getPlayerAnswersQRL).toHaveBeenCalledWith(roomId);
    });

    it('should update player answer for QRL and finish timer if every player answered', () => {
        const playerSocket = createStubInstance<Socket>(Socket);
        const playerAnswer = 'Player1Answer';

        jest.spyOn(validateAnswerService, 'updatePlayerAnswerQRL');
        jest.spyOn(validateAnswerService, 'updateSubmit');
        jest.spyOn(validateAnswerService, 'verifyEveryPlayerAnswered').mockReturnValue(true);
        jest.spyOn(eventEmitterMock, 'emit');
        jest.spyOn(service, 'finishTimer');

        service.updatePlayerAnswerRoomQRL(roomId, playerSocket, playerAnswer);

        expect(validateAnswerService.updatePlayerAnswerQRL).toHaveBeenCalledWith(roomId, playerSocket, playerAnswer);
        expect(validateAnswerService.updateSubmit).toHaveBeenCalledWith(roomId, playerSocket);
        expect(validateAnswerService.verifyEveryPlayerAnswered).toHaveBeenCalledWith(roomId);
        expect(eventEmitterMock.emit).toHaveBeenCalledWith(GameEvent.EveryPlayerAnswered, roomId);
        expect(service.finishTimer).toHaveBeenCalledWith(roomId);
    });
});
