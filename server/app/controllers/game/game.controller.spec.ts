import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameController } from '@app/controllers/game/game.controller';

describe('gameController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getAllQuiz should get return all games', async () => {
        const fakeQuizes = [new Game(), new Game()];
        gameService.getAllGames.resolves(fakeQuizes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(fakeQuizes);
            return res;
        };

        await controller.getAllQuiz(res);
    });

    it('should return an error NOT_FOUND when service unable to get data from database', async () => {
        gameService.getAllGames.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getAllQuiz(res);
    });

    it('should return true if the game exist in the database', async () => {
        gameService.gameExist.resolves(true);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (bool) => {
            expect(bool).toEqual(true);
            return res;
        };

        await controller.isGameExist(res, '1');
    });

    it('should return a false if the game does not exist in the database', async () => {
        gameService.gameExist.resolves(false);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (bool) => {
            expect(bool).toEqual(false);
            return res;
        };

        await controller.isGameExist(res, '1');
    });

    it('should return an error NOT_FOUND when service unable to get data from database', async () => {
        gameService.gameExist.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.isGameExist(res, '1');
    });

    it('should return all the visible games in the database from the service', async () => {
        const fakeGames = [new Game(), new Game(), new Game()];
        gameService.getAllVisibleGame.resolves(fakeGames);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(fakeGames);
            return res;
        };
        await controller.getAllVisibleGames(res);
    });

    it('should return an error NOT_FOUND when service unable to get visible games from the service', async () => {
        gameService.getAllVisibleGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getAllVisibleGames(res);
    });

    it('should return true if the game exist in the database', async () => {
        gameService.getTitle.resolves(true);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (bool) => {
            expect(bool).toEqual(true);
            return res;
        };

        await controller.getTitleUnique('test', res);
    });

    it('should return a false if the game does not exist in the database', async () => {
        gameService.getTitle.resolves(false);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (bool) => {
            expect(bool).toEqual(false);
            return res;
        };

        await controller.getTitleUnique('test', res);
    });

    it('should return an error NOT_FOUND when service unable to get data from database', async () => {
        gameService.getTitle.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getTitleUnique('test', res);
    });

    it('should return a NO_CONTENT code if the game has been deleted from the service', async () => {
        gameService.deleteGame.resolves(true);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        await controller.deleteGame('test', res);
    });

    it('should return a NOt_FOUND code if the game to be deleted by the service does not exist', async () => {
        gameService.deleteGame.resolves(false);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.deleteGame('test', res);
    });

    it('should return a INTERNAL_SERVER_ERROR code if service was unable to process the request', async () => {
        gameService.deleteGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.deleteGame('test', res);
    });

    it('should update the visibility of the game when service called', async () => {
        gameService.updateVisibility.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        await controller.updateVisibility('test', res);
    });

    it('should return a NOT_FOUND code if service was unable to find the game to updateVisibility', async () => {
        gameService.updateVisibility.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.updateVisibility('test', res);
    });

    it('should modify a game when the service is called', async () => {
        gameService.modifyGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        await controller.modifyGame(new Game(), 'test', res);
    });

    it('should return a NOT_FOUND code if service was unable to find the game to modify', async () => {
        gameService.modifyGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.modifyGame(new Game(), 'test', res);
    });

    it('should add a game when the service is called', async () => {
        gameService.addGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;
        await controller.addGame(new Game(), res);
    });

    it('should return a BAD_REQUEST code if service was unable to add the game', async () => {
        gameService.addGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addGame(new Game(), res);
    });

    it('should create a game from a file when the service is called', async () => {
        gameService.createGameFromFile.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.createGameFromFile(new Game(), res);
    });

    it('should return a BAD_REQUEST code if service was unable to create the game from the file', async () => {
        gameService.createGameFromFile.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.createGameFromFile(new Game(), res);
    });
});
