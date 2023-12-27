import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { ValidationService } from '@app/services/validation/validation.service';
import { GameService } from './game.service';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@common/constantes/constantes';

describe('QuizesService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let validationService: ValidationService;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [GameService, ValidationService],
        }).compile();

        service = module.get<GameService>(GameService);
        validationService = module.get<ValidationService>(ValidationService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        // The database get auto populated in the constructor
        // We want to make sur we close the connection after the database got
        // populated. So we add small delay
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAllGames should get all the games in the database', async () => {
        await gameModel.create(fakeGame);
        await gameModel.create(fakeGame2);
        expect((await service.getAllGames()).length).toEqual(2);
    });

    it('should return all visibile game from the database', async () => {
        await gameModel.create(fakeGame);
        await gameModel.create(fakeGame2);
        expect((await service.getAllVisibleGame()).length).toEqual(1);
    });

    it('should return no game since there is no visible game in the databse', async () => {
        await gameModel.create(fakeGame);
        await gameModel.create(fakeGame);
        expect((await service.getAllVisibleGame()).length).toEqual(0);
    });

    it('should find the game with an id to see if it exists in the database', async () => {
        await gameModel.create(fakeGame);
        expect(await service.gameExist(fakeGame.id)).toBeTruthy();
    });

    it('should false if the game with the given id does not exist in the databse', async () => {
        await gameModel.create(fakeGame);
        expect(await service.gameExist('test')).toBeFalsy();
    });

    it('should add a game to the database', async () => {
        await service.addGame(fakeGame);
        expect((await gameModel.find()).length).toEqual(1);
    });

    it('should delete a game from the databse given the id', async () => {
        await gameModel.create(fakeGame);
        await service.deleteGame(fakeGame.id);
        expect((await gameModel.find()).length).toEqual(0);
    });

    it('should update the visibility of an existing game in the db', async () => {
        await gameModel.create(fakeGame);
        const oldVisibility = fakeGame.visibility;
        await service.updateVisibility(fakeGame.id);
        const updatedVisibility = (await gameModel.findOne({ id: fakeGame.id })).visibility;
        expect(updatedVisibility).toBe(!oldVisibility);
    });

    it('should get all game titles from the database', async () => {
        const titles = ['Questionnaire sur log2990', 'test'];
        await gameModel.create(fakeGame);
        await gameModel.create(fakeGame2);
        const databaseTitle = await service.getAllGameTitles();
        expect(titles.toString()).toEqual(databaseTitle.toString());
    });

    it('should get a determine ff a certain game exist based on his title', async () => {
        await gameModel.create(fakeGame);
        const targetTitle = await service.getTitle(fakeGame.title);
        expect(targetTitle).toEqual(true);
    });

    it('should get all the game ids in the database', async () => {
        const ids = ['asdfadsdfadsfasdfasdffads', 's0oesm'];
        await gameModel.create(fakeGame);
        await gameModel.create(fakeGame2);
        const databseIds = await service.getAllGameId();
        expect(databseIds.toString()).toEqual(ids.toString());
    });

    it('should modify an existing game in the database', async () => {
        await gameModel.create(fakeGame);
        await service.modifyGame(fakeGame1Update, fakeGame.id);
        const isDifferent = fakeGame.title !== fakeGame1Update.title;
        expect(isDifferent).toEqual(true);
    });

    it('it should validate the title is unique', async () => {
        await gameModel.create(fakeGame);
        const res = await service.validateTitle(fakeGame2);
        expect(res).toBeFalsy();
    });

    it('it should validate the title is not unique', async () => {
        await gameModel.create(fakeGame);
        const res = await service.validateTitle(fakeGame);
        expect(res).toBeTruthy();
    });

    it('should validate the id to make sure it is unique', async () => {
        const mockIds = ['existingId1', 'existingId2'];
        jest.spyOn(service, 'getAllGameId').mockResolvedValue(mockIds);

        jest.spyOn(validationService, 'generateRandomId').mockReturnValue('newRandomId');

        fakeGame.id = 'existingId1';

        await service.validateId(fakeGame);

        expect(fakeGame.id).toBe('newRandomId');
    });

    it('should throw an exception for invalid questions', async () => {
        jest.spyOn(validationService, 'validateQuestions').mockReturnValue(false);
        fakeGame.title = 'Unique Title';

        await expect(service.createGameFromFile(fakeGame)).rejects.toThrowError('questions invalides');
    });

    it('should create an id if its not there', async () => {
        delete fakeGame.id;
        const spyId = jest.spyOn(validationService, 'generateRandomId');
        await service.createGameFromFile(fakeGame);
        expect(spyId).toHaveBeenCalled();
    });

    it('should throw httpexception if the title is not unique in the databse', async () => {
        jest.spyOn(service, 'validateTitle').mockReturnValue(Promise.resolve(true));
        await service.addGame(fakeGame);
        fakeGame2.title = fakeGame.title;
        try {
            await service.createGameFromFile(fakeGame2);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.response).toEqual("le titre du jeu n'est pas unique");
            expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
    });
});
const fakeGame = {
    id: 'asdfadsdfadsfasdfasdffads',
    title: 'Questionnaire sur log2990',
    duration: 10,
    lastModification: '2018-11-13T20:20:39',
    description: 'hi',
    visibility: false,
    questions: [
        {
            type: 'QCM',
            text: 'Quelle est la date de remise du sprint1 ?',
            points: 40,
            choices: [
                {
                    text: '2 octobre',
                    isCorrect: false,
                },
                {
                    text: '3 octobre',
                    isCorrect: true,
                },
                {
                    text: '4 octobre',
                    isCorrect: false,
                },
                {
                    text: '5 octobre',
                    isCorrect: false,
                },
            ],
        },
        {
            type: 'QCM',
            text: 'Si on fait aucun tests peut-on avoir des points?',
            points: 20,
            choices: [
                {
                    text: 'Non',
                    isCorrect: true,
                },
                {
                    text: 'Oui',
                    isCorrect: false,
                },
            ],
        },
    ],
};

const fakeGame1Update = {
    id: 'asdfadsdfadsfasdfasdffads',
    title: 'log2990',
    duration: 10,
    lastModification: '2018-11-13T20:20:39',
    description: 'hi',
    visibility: false,
    questions: [
        {
            type: 'QCM',
            text: 'Quelle est la date de remise du sprint1 ?',
            points: 40,
            choices: [
                {
                    text: '2 octobre',
                    isCorrect: false,
                },
                {
                    text: '3 octobre',
                    isCorrect: true,
                },
                {
                    text: '4 octobre',
                    isCorrect: false,
                },
                {
                    text: '5 octobre',
                    isCorrect: false,
                },
            ],
        },
        {
            type: 'QCM',
            text: 'Si on fait aucun tests peut-on avoir des points?',
            points: 20,
            choices: [
                {
                    text: 'Non',
                    isCorrect: true,
                },
                {
                    text: 'Oui',
                    isCorrect: false,
                },
            ],
        },
    ],
};

const fakeGame2 = {
    id: 's0oesm',
    title: 'test',
    duration: 10,
    lastModification: '2023-09-24T04:22:47',
    description: 'testtestest',
    visibility: true,
    questions: [
        {
            type: 'QCM',
            text: 'bjdafdfg grsfd grsdf',
            points: 10,
            choices: [
                {
                    text: 'ok',
                    isCorrect: true,
                },
                {
                    text: 'psa',
                    isCorrect: false,
                },
            ],
        },
        {
            type: 'QRL',
            text: 'okokokokkkkkkkkkkkkk',
            points: 10,
            choices: [],
        },
    ],
};
