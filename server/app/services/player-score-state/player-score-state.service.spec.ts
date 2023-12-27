/* eslint-disable max-lines */
import { PlayerScore, UpdatePlayerScore } from '@app/model/interfaces/interfaces';
import { playerResultStubs } from '@app/stubs/player-result.stub';
import { playerScoreStub } from '@app/stubs/player-score.stub';
import { TWENTY } from '@common/constantes/constantes';
import { PlayerResult } from '@common/interfaces/playerResult';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import { PlayerScoreStateService } from './player-score-state.service';

describe('PlayerScoreStateService', () => {
    let service: PlayerScoreStateService;
    let socket: SinonStubbedInstance<Socket>;
    let socket2: SinonStubbedInstance<Socket>;
    const roomId = 'test';
    const points = 10;
    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayerScoreStateService,
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

        service = module.get<PlayerScoreStateService>(PlayerScoreStateService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should intialize the score of game lobby at the start of the game', () => {
        const mapPlayer = new Map();
        mapPlayer.set(socket, 'bidon');
        mapPlayer.set(socket2, 'salut');

        expect(service.playerScores.has(roomId)).toBeFalsy();

        service.initializeGameScoreBoard(roomId, mapPlayer);

        const expectedResult = playerScoreStub()[0];

        expect(service.playerScores.has(roomId)).toBeTruthy();
        expect(service.playerScores.get(roomId).has('bidon')).toBeTruthy();
        expect(service.playerScores.get(roomId).has('salut')).toBeTruthy();
        expect(JSON.stringify(service.playerScores.get(roomId).get('bidon'))).toBe(JSON.stringify(expectedResult));
        expect(JSON.stringify(service.playerScores.get(roomId).get('salut'))).toBe(JSON.stringify(expectedResult));
    });

    it('should update the score of a player', () => {
        const playerScore = playerScoreStub()[1];
        service.playerScores.set(roomId, new Map());
        service.playerScores.get(roomId).set('bidon', playerScore);

        expect(service.playerScores.has(roomId)).toBeTruthy();
        const updatePlayer: UpdatePlayerScore = {
            score: points,
            isBonus: false,
            playerName: 'bidon',
        };
        service.updateScoreBoard(roomId, updatePlayer);

        const playerUpdated = service.playerScores.get(roomId).get('bidon');
        expect(playerUpdated.bonus).toBe(playerScore.bonus);
        expect(playerUpdated.status).toBe(playerScore.status);
        expect(playerUpdated.score).toBe(TWENTY);
    });

    it('should update the score of a player and add the number of bonus he has if he got the bonus', () => {
        const playerScore = playerScoreStub()[1];
        service.playerScores.set(roomId, new Map());
        service.playerScores.get(roomId).set('bidon', playerScore);

        expect(service.playerScores.has(roomId)).toBeTruthy();

        const updatePlayer: UpdatePlayerScore = {
            score: points,
            isBonus: true,
            playerName: 'bidon',
        };

        service.updateScoreBoard(roomId, updatePlayer);

        const playerUpdated = service.playerScores.get(roomId).get('bidon');
        expect(playerUpdated.bonus).toBe(1);
        expect(playerUpdated.status).toBe(playerScore.status);
        expect(playerUpdated.score).toBe(TWENTY);
    });

    it('should update the playerStatus if he quit the game', () => {
        const playerScore = playerScoreStub()[1];
        service.playerScores.set(roomId, new Map());
        service.playerScores.get(roomId).set('bidon', playerScore);

        service.updatePlayerStatus(roomId, 'bidon');
        expect(service.playerScores.get(roomId).get('bidon').status).toBe(false);
    });

    it('should give the current scoreboard of the game without the organisator in it', () => {
        const playerScore = playerScoreStub()[1];
        service.playerScores.set(roomId, new Map());
        service.playerScores.get(roomId).set('bidon', playerScore);
        service.playerScores.get(roomId).set('Organisateur', playerScoreStub()[0]);

        expect(service.playerScores.get(roomId).size).toBe(2);
        expect(service.playerScores.get(roomId).has('Organisateur')).toBeTruthy();

        const res = service.getCurrentScoreBoard(roomId);

        expect(res.size).toBe(1);
        expect(res.has('Organisateur')).toBeFalsy();
        expect(res.has('bidon')).toBeTruthy();
    });

    it('should get the current status of a player', () => {
        const playerScore = playerScoreStub()[1];
        service.playerScores.set(roomId, new Map());
        service.playerScores.get(roomId).set('bidon', playerScore);

        const res = service.getPlayerStatus(roomId, 'bidon');
        expect(res).toBe(true);
    });

    it('should delete the scoreboard of a game lobby', () => {
        const playerScore = playerScoreStub()[1];
        service.playerScores.set(roomId, new Map());
        service.playerScores.get(roomId).set('bidon', playerScore);

        service.deleteScoreRoom(roomId);
        expect(service.playerScores.has(roomId)).toBeFalsy();
    });

    it('should sort the score of the scoreboard lobby in descending order', () => {
        const firstPlayerResult: PlayerResult = playerResultStubs()[0];

        const secondPlayerResult: PlayerResult = playerResultStubs()[1];

        const playerScoreArray: PlayerResult[] = [firstPlayerResult, secondPlayerResult];

        const giveRankMock = jest.fn();
        jest.spyOn(service, 'giveRank').mockImplementation(giveRankMock);

        const sortedPlayerResultArray = service.sortResult(playerScoreArray);

        expect(JSON.stringify(sortedPlayerResultArray[0])).toEqual(JSON.stringify(secondPlayerResult));
        expect(JSON.stringify(sortedPlayerResultArray[1])).toEqual(JSON.stringify(firstPlayerResult));
        expect(giveRankMock).toHaveBeenCalledWith(playerScoreArray);
    });

    it('should sort by alphabetical order if  players have the same score of the scoreboard lobby in descending order', () => {
        const firstPlayerResult: PlayerResult = playerResultStubs()[2];

        const secondPlayerResult: PlayerResult = playerResultStubs()[3];

        const thirdPlayeResult: PlayerResult = playerResultStubs()[4];

        const playerScoreArray: PlayerResult[] = [firstPlayerResult, secondPlayerResult, thirdPlayeResult];

        const giveRankMock = jest.fn();
        jest.spyOn(service, 'giveRank').mockImplementation(giveRankMock);

        const sortedPlayerResultArray = service.sortResult(playerScoreArray);

        expect(JSON.stringify(sortedPlayerResultArray[0])).toEqual(JSON.stringify(secondPlayerResult));
        expect(JSON.stringify(sortedPlayerResultArray[2])).toEqual(JSON.stringify(firstPlayerResult));
        expect(JSON.stringify(sortedPlayerResultArray[1])).toEqual(JSON.stringify(thirdPlayeResult));
        expect(giveRankMock).toHaveBeenCalledWith(playerScoreArray);
    });

    it('should sort by alphabetical order but prioritize score  of the scoreboard lobby in descending order', () => {
        const firstPlayerResult: PlayerResult = playerResultStubs()[5];

        const secondPlayerResult: PlayerResult = playerResultStubs()[3];

        const thirdPlayeResult: PlayerResult = playerResultStubs()[4];

        const playerScoreArray: PlayerResult[] = [firstPlayerResult, secondPlayerResult, thirdPlayeResult];

        const giveRankMock = jest.fn();
        jest.spyOn(service, 'giveRank').mockImplementation(giveRankMock);

        const sortedPlayerResultArray = service.sortResult(playerScoreArray);

        expect(JSON.stringify(sortedPlayerResultArray[0])).toEqual(JSON.stringify(firstPlayerResult));
        expect(JSON.stringify(sortedPlayerResultArray[2])).toEqual(JSON.stringify(thirdPlayeResult));
        expect(JSON.stringify(sortedPlayerResultArray[1])).toEqual(JSON.stringify(secondPlayerResult));
        expect(giveRankMock).toHaveBeenCalledWith(playerScoreArray);
    });

    // eslint-disable-next-line max-len
    it('should keep the same order if two player have the same name and same score event tho its impossible to have two players with the same name', () => {
        const firstPlayerResult: PlayerResult = playerResultStubs()[6];

        const secondPlayerResult: PlayerResult = playerResultStubs()[6];

        const playerScoreArray: PlayerResult[] = [firstPlayerResult, secondPlayerResult];

        const giveRankMock = jest.fn();
        jest.spyOn(service, 'giveRank').mockImplementation(giveRankMock);

        const sortedPlayerResultArray = service.sortResult(playerScoreArray);

        expect(JSON.stringify(sortedPlayerResultArray[0])).toEqual(JSON.stringify(firstPlayerResult));
        expect(JSON.stringify(sortedPlayerResultArray[1])).toEqual(JSON.stringify(secondPlayerResult));
        expect(giveRankMock).toHaveBeenCalledWith(playerScoreArray);
    });

    it('should give the rank to a player based on his score', () => {
        const firstPlayerResult: PlayerResult = playerResultStubs()[0];

        const secondPlayerResult: PlayerResult = playerResultStubs()[1];

        const playerScoreArray: PlayerResult[] = [secondPlayerResult, firstPlayerResult];

        const playerScoreArrayRank: PlayerResult[] = service.giveRank(playerScoreArray);

        expect(playerScoreArrayRank[0].rank).toBe(1);
        expect(playerScoreArrayRank[1].rank).toBe(2);
    });

    it('should return the final result sorted in decreasing order of score and also give the right rank', () => {
        const firstPlayerResult: PlayerScore = playerScoreStub()[1];

        const secondPlayerResult: PlayerScore = playerScoreStub()[2];

        const sortResultSpy = jest.spyOn(service, 'sortResult');
        const giveRankSpy = jest.spyOn(service, 'giveRank');

        service.playerScores.set(roomId, new Map());
        service.playerScores.get('test').set('bidon', firstPlayerResult);
        service.playerScores.get('test').set('salut', secondPlayerResult);

        const res: PlayerResult[] = service.returnFinalResult(roomId);

        expect(JSON.stringify(res[0])).toBe(JSON.stringify(playerResultStubs()[7]));

        expect(JSON.stringify(res[1])).toBe(JSON.stringify(playerResultStubs()[8]));

        expect(sortResultSpy).toHaveBeenCalled();
        expect(giveRankSpy).toHaveBeenCalled();
    });

    it('should get the best score of the lobby', () => {
        const firstPlayerResult: PlayerScore = playerScoreStub()[1];

        const secondPlayerResult: PlayerScore = playerScoreStub()[2];

        const thirdPlayeResult: PlayerScore = playerScoreStub()[0];

        service.playerScores.set(roomId, new Map());
        service.playerScores.get('test').set('bidon', firstPlayerResult);
        service.playerScores.get('test').set('salut', secondPlayerResult);
        service.playerScores.get('test').set('foo', thirdPlayeResult);

        const bestScore = service.getBestScore(roomId);

        expect(bestScore).toBe(secondPlayerResult.score);
    });
});
