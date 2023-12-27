/* eslint-disable max-lines */
// test file
import { CreateQuestionDto } from '@app/model/dto/game/create-question.dto';
import { UpdatePlayerScore } from '@app/model/interfaces/interfaces';
import { PlayerScoreStateService } from '@app/services/player-score-state/player-score-state.service';
import { questionValidStubs } from '@app/stubs/question.stub';
import { BONUS_MULTIPLICATOR, FIFTEEN, ONE_HUNDRED, TEN } from '@common/constantes/constantes';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import { ValidateAnswerService } from './validate-answer.service';

describe('ValidateAnswerService', () => {
    let service: ValidateAnswerService;
    let socket: SinonStubbedInstance<Socket>;
    let socket2: SinonStubbedInstance<Socket>;
    let eventEmitterMock: EventEmitter2;
    const playerScoreStateService = createStubInstance(PlayerScoreStateService);
    let validQuestions: CreateQuestionDto[];
    let updateScoreBoardMock;
    const roomId = 'test';
    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);
        eventEmitterMock = createStubInstance(EventEmitter2);
        validQuestions = questionValidStubs();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ValidateAnswerService,
                PlayerScoreStateService,
                {
                    provide: Socket,
                    useValue: socket,
                },
                {
                    provide: Socket,
                    useValue: socket2,
                },
                {
                    provide: PlayerScoreStateService,
                    useValue: playerScoreStateService,
                },
                {
                    provide: EventEmitter2,
                    useValue: eventEmitterMock,
                },
            ],
        }).compile();

        updateScoreBoardMock = jest.fn();
        jest.spyOn(playerScoreStateService, 'updateScoreBoard').mockImplementation(updateScoreBoardMock);

        service = module.get<ValidateAnswerService>(ValidateAnswerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize the player answers info', () => {
        const player = new Map();
        player.set(socket, 'bidon');
        player.set(socket2, 'foo');

        service.initializePlayerAnswer(roomId, player);

        expect(service.playerBonus.has(roomId)).toBeTruthy();
        expect(service.playerBonus.get(roomId)[0]).toBe('');
        expect(service.playerBonus.get(roomId)[1]).toBe(Infinity);

        expect(service.isPlayerAnswerSubmitted.has(roomId)).toBeTruthy();
        expect(service.isPlayerAnswerSubmitted.get(roomId).get('bidon')).toBe(false);
        expect(service.isPlayerAnswerSubmitted.get(roomId).get('foo')).toBe(false);

        expect(service.playerAnswer.has(roomId)).toBeTruthy();
        expect(JSON.stringify(service.playerAnswer.get(roomId).get('bidon'))).toBe(JSON.stringify([]));
        expect(JSON.stringify(service.playerAnswer.get(roomId).get('foo'))).toBe(JSON.stringify([]));
    });

    it('should clear the answer of the lobby', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [false, true, true, true]);
        service.playerAnswer.get(roomId).set('foo', [true, true, true, true]);

        service.isPlayerAnswerSubmitted.set(roomId, new Map());
        service.isPlayerAnswerSubmitted.get(roomId).set('bidon', true);
        service.isPlayerAnswerSubmitted.get(roomId).set('foo', true);

        service.playerAnswerQRL.set(
            roomId,
            new Map([
                ['test', 'answer'],
                ['test2', 'answer2'],
            ]),
        );

        service.playerScoresQRL.set(
            roomId,
            new Map([
                ['test', 1],
                ['test2', 2],
            ]),
        );

        service.clearAnswerLobby(roomId);

        expect(JSON.stringify(service.playerAnswer.get(roomId).get('bidon'))).toBe(JSON.stringify([]));
        expect(JSON.stringify(service.playerAnswer.get(roomId).get('foo'))).toBe(JSON.stringify([]));

        expect(service.isPlayerAnswerSubmitted.get(roomId).get('bidon')).toBe(false);
        expect(service.isPlayerAnswerSubmitted.get(roomId).get('foo')).toBe(false);

        expect(service.playerBonus.get(roomId)[0]).toBe('');
        expect(service.playerBonus.get(roomId)[1]).toBe(Infinity);

        expect(service.playerScoresQRL.get(roomId).get('test')).toBe(1);
        expect(service.playerScoresQRL.get(roomId).get('test2')).toBe(1);

        expect(service.playerAnswerQRL.get(roomId).get('test')).toBe('');
        expect(service.playerAnswerQRL.get(roomId).get('test2')).toBe('');
    });

    it('should verify that every player in a lobby answered', () => {
        service.isPlayerAnswerSubmitted.set(roomId, new Map());
        service.isPlayerAnswerSubmitted.get(roomId).set('bidon', true);
        service.isPlayerAnswerSubmitted.get(roomId).set('foo', true);

        const res = service.verifyEveryPlayerAnswered(roomId);

        expect(res).toBeTruthy();
    });

    it('should verify that every player in a lobby answered and not count organisateur ', () => {
        service.isPlayerAnswerSubmitted.set(roomId, new Map());
        service.isPlayerAnswerSubmitted.get(roomId).set('bidon', true);
        service.isPlayerAnswerSubmitted.get(roomId).set('organisteur', true);

        const res = service.verifyEveryPlayerAnswered(roomId);

        expect(res).toBeTruthy();
    });

    it('should verify that every player in a lobby answered', () => {
        const getPlayerStatusMock = jest.fn().mockReturnValue(true);
        jest.spyOn(playerScoreStateService, 'getPlayerStatus').mockImplementation(getPlayerStatusMock);

        service.isPlayerAnswerSubmitted.set(roomId, new Map());
        service.isPlayerAnswerSubmitted.get(roomId).set('bidon', true);
        service.isPlayerAnswerSubmitted.get(roomId).set('foo', false);

        const res = service.verifyEveryPlayerAnswered(roomId);

        expect(res).toBeFalsy();
        expect(getPlayerStatusMock).toHaveBeenCalled();
    });

    it('should verify if the bonus apply when there is more than 1 player  and apply if best time', () => {
        service.playerAnswer.set(roomId, new Map([['bidon', []]]));
        service.playerAnswer.get(roomId).set('foo', []);
        const time = Date.now();
        service.playerBonus.set(roomId, ['', Infinity]);
        socket.data = { username: 'bidon' };
        service.verifyBonusApply(roomId, time, socket);

        expect(service.playerBonus.get(roomId)[0]).toBe('bidon');
        expect(service.playerBonus.get(roomId)[1]).toBe(time);
    });

    it('should give the bonus if the player is the only one in the lobby', () => {
        service.playerAnswer.set(roomId, new Map([['bidon', []]]));
        const time = Date.now();
        service.playerBonus.set(roomId, ['', Infinity]);
        socket.data = { username: 'bidon' };
        service.verifyBonusApply(roomId, time, socket);
        expect(service.playerAnswer.get(roomId).size).toBe(1);
        expect(service.playerBonus.get(roomId)[0]).toBe('bidon');
        expect(service.playerBonus.get(roomId)[1]).toBe(time);
    });

    it('should verify if the bonus apply to the player submission and not give it if two player answer at the same time', () => {
        service.playerAnswer.set(roomId, new Map([['bidon', []]]));
        service.playerAnswer.get(roomId).set('foo', []);
        service.countSameSubmitTime.set(roomId, 1);
        const time = Infinity;
        service.playerBonus.set(roomId, ['bidon', time]);
        socket.data = { username: 'bidon' };
        service.verifyBonusApply(roomId, time, socket);
        expect(service.playerAnswer.get(roomId).size).toBe(2);
        expect(service.playerBonus.get(roomId)[0]).toBe('');
        expect(service.playerBonus.get(roomId)[1]).toBe(time);
    });

    // eslint-disable-next-line max-len
    it('should verify if the bonus apply to the player submission and give it if two player answer at the same time but one is wrong and the other is right', () => {
        service.playerAnswer.set(roomId, new Map([['bidon', []]]));
        service.playerAnswer.get(roomId).set('foo', []);
        service.countSameSubmitTime.set(roomId, 0);
        const time = Infinity;
        service.playerBonus.set(roomId, ['bidon', time]);
        socket.data = { username: 'bidon' };
        service.verifyBonusApply(roomId, time, socket);
        expect(service.playerAnswer.get(roomId).size).toBe(2);
        expect(service.playerBonus.get(roomId)[0]).toBe('bidon');
        expect(service.playerBonus.get(roomId)[1]).toBe(time);
    });

    it('should update the player answer', () => {
        const answer = [true, false, true, false];
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', []);
        socket.data = { username: 'bidon' };
        service.updatePlayerAnswer(roomId, socket, answer);

        expect(JSON.stringify(service.playerAnswer.get(roomId).get('bidon'))).toEqual(JSON.stringify(answer));
    });

    it('should submit state of a player when he submit', () => {
        service.isPlayerAnswerSubmitted.set(roomId, new Map());
        service.isPlayerAnswerSubmitted.get(roomId).set('bidon', false);
        socket.data = { username: 'bidon' };
        service.updateSubmit(roomId, socket);

        expect(service.isPlayerAnswerSubmitted.get(roomId).get('bidon')).toBeTruthy();
    });

    it('should update the player status when he leave the game', () => {
        const updatePlayerStatusMock = jest.fn();

        jest.spyOn(playerScoreStateService, 'updatePlayerStatus').mockImplementation(updatePlayerStatusMock);
        socket.data = { username: 'bidon' };
        service.updatePlayerStatus(roomId, socket);

        expect(updatePlayerStatusMock).toHaveBeenCalledWith(roomId, 'bidon');
    });

    it('should validate the player answer ', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false, true, false]);

        const transformQuestionAnswerMock = jest.fn().mockReturnValue([true, false, true, false]);
        jest.spyOn(service, 'transformQuestionAnswer').mockImplementation(transformQuestionAnswerMock);

        const res = service.validatePlayerAnswer(roomId, 'bidon', validQuestions[0]);

        expect(transformQuestionAnswerMock).toHaveBeenCalledWith(validQuestions[0]);
        expect(res).toBeTruthy();
    });

    it('should validate the player answer ', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false, false, false]);

        const transformQuestionAnswerMock = jest.fn().mockReturnValue([true, false, true, false]);
        jest.spyOn(service, 'transformQuestionAnswer').mockImplementation(transformQuestionAnswerMock);

        const res = service.validatePlayerAnswer(roomId, 'bidon', validQuestions[0]);

        expect(transformQuestionAnswerMock).toHaveBeenCalledWith(validQuestions[0]);
        expect(res).toBeFalsy();
    });

    it('should format the player answers for the graph', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false, false, false]);
        service.playerAnswer.get(roomId).set('foo', [true, false, false, false]);
        service.playerAnswer.get(roomId).set('zoo', [true, true, false, false]);

        const res = service.formatPlayerAnswer(roomId);

        expect(JSON.stringify(res)).toEqual(JSON.stringify([3, 1, 0, 0]));
    });

    it('should transform the question answer before verifying it', () => {
        const question: CreateQuestionDto = validQuestions[0];

        const transformedAns = service.transformQuestionAnswer(question);

        expect(JSON.stringify(transformedAns)).toEqual(JSON.stringify([true, false]));
    });

    it('should add the points to the players if they have the right answer', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false]);
        service.playerAnswer.get(roomId).set('foo', [true, false]);
        service.playerAnswer.get(roomId).set('zoo', [true, false]);
        service.playerBonus.set(roomId, ['', Infinity]);
        service.addPointsPlayer(roomId, validQuestions[0]);

        expect(updateScoreBoardMock).toHaveBeenCalledTimes(3);
    });

    it('should add the points to the players if they have the right answer and apply the bonus if they have it', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false]);
        service.playerBonus.set(roomId, ['bidon', FIFTEEN]);

        service.addPointsPlayer(roomId, validQuestions[0]);
        const updatePlayer: UpdatePlayerScore = {
            score: validQuestions[0].points * BONUS_MULTIPLICATOR,
            isBonus: true,
            playerName: 'bidon',
        };
        expect(updateScoreBoardMock).toHaveBeenCalledWith(roomId, updatePlayer);
    });

    it('should not add the points to the players if they have the wrong answer', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false]);
        service.playerBonus.set(roomId, ['', Infinity]);

        service.addPointsPlayer(roomId, validQuestions[0]);

        expect(updateScoreBoardMock).not.toHaveBeenCalledWith();
    });
    it('should delete the players room answer info when the game is done', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false]);

        service.playerBonus.set(roomId, ['', Infinity]);

        service.isPlayerAnswerSubmitted.set(roomId, new Map());
        service.isPlayerAnswerSubmitted.get(roomId).set('bidon', true);
        service.deletePlayersRoom(roomId);

        expect(service.playerAnswer.has(roomId)).toBeFalsy();
        expect(service.isPlayerAnswerSubmitted.has(roomId)).toBeFalsy();
        expect(service.playerBonus.has(roomId)).toBeFalsy();
    });

    it('should count the number of players that did not answer for the bonus return true if one person answer and everybody else did not ', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false, true, false]);
        service.playerAnswer.get(roomId).set('foo', [false, false, false, false]);

        const res = service.countPlayerNotAnswered(roomId);

        expect(res).toBeTruthy();
    });

    it('should count the number of players that did not answer for the bonus return false if more than one person answer', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false, true, false]);
        service.playerAnswer.get(roomId).set('foo', [false, false, false, false]);
        service.playerAnswer.get(roomId).set('baba', [false, false, true, false]);

        const res = service.countPlayerNotAnswered(roomId);

        expect(res).toBeFalsy();
    });

    it('should count the number of players that did not answer for the bonus return true and work with different array lenght ', () => {
        service.playerAnswer.set(roomId, new Map());
        service.playerAnswer.get(roomId).set('bidon', [true, false]);
        service.playerAnswer.get(roomId).set('foo', [false, false]);

        const res = service.countPlayerNotAnswered(roomId);

        expect(res).toBeTruthy();
    });

    it('should add to a room the count the number of answer that arrive at the same time and have the right answer', () => {
        service.countSameSubmitTime.set(roomId, 0);
        service.updateSameTimeSubmit(roomId);

        expect(service.countSameSubmitTime.get(roomId)).toBe(1);
    });

    it('should get player answer qrl', () => {
        service.playerAnswerQRL.set(
            roomId,
            new Map([
                ['test', 'answer'],
                ['test2', 'answer2'],
            ]),
        );
        const res = service.getPlayerAnswersQRL(roomId);
        expect(JSON.stringify(res)).toEqual(
            JSON.stringify([
                ['test', 'answer'],
                ['test2', 'answer2'],
            ]),
        );
    });

    it('should add points to the players on a qrl question', () => {
        service.playerScoresQRL.set(
            roomId,
            new Map([
                ['test', 1],
                ['test2', 2],
            ]),
        );
        service.addPointsPlayerQRL(roomId, validQuestions[0]);
        expect(updateScoreBoardMock).toHaveBeenCalledTimes(2);
    });

    it('should call the update scoreboard with the right information when adding points to qrl', () => {
        service.playerScoresQRL.set(roomId, new Map([['test', 1]]));
        service.addPointsPlayerQRL(roomId, validQuestions[0]);
        const expectedPoints = validQuestions[0].points * (1 / ONE_HUNDRED);
        const updatePlayer: UpdatePlayerScore = {
            score: expectedPoints,
            isBonus: false,
            playerName: 'test',
        };
        expect(updateScoreBoardMock).toHaveBeenCalledWith(roomId, updatePlayer);
    });

    it('should update the score of a player during a qrl question', () => {
        service.playerScoresQRL.set(
            roomId,
            new Map([
                ['test', 0],
                ['test2', 0],
            ]),
        );
        service.updatePlayerScoreQRL(roomId, [
            { player: 'test', score: 10 },
            { player: 'test2', score: 15 },
        ]);
        expect(service.playerScoresQRL.get(roomId).get('test')).toEqual(TEN);
        expect(service.playerScoresQRL.get(roomId).get('test2')).toEqual(FIFTEEN);
    });

    it('should update the answer of a player during a qrl', () => {
        service.playerAnswerQRL.set(roomId, new Map([['test', '']]));
        socket.data = { username: 'test' };
        service.updatePlayerAnswerQRL(roomId, socket, 'answer');
        expect(service.playerAnswerQRL.get(roomId).get('test')).toEqual('answer');
    });
});
