import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/game/create-question.dto';
import { invalidGames, validGames } from '@app/stubs/game-dto.stub';
import { questionInvalidStubs, questionValidStubs } from '@app/stubs/question.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { NUMBER_ITERATION } from '@common/constantes/constantes';

describe('ValidationService', () => {
    let service: ValidationService;
    let validQuestions: CreateQuestionDto[];
    let wrongQuestions: CreateQuestionDto[];
    let validGame: CreateGameDto[];
    let invalidGame: CreateGameDto[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ValidationService],
        }).compile();

        service = module.get<ValidationService>(ValidationService);
        validQuestions = questionValidStubs();
        wrongQuestions = questionInvalidStubs();
        validGame = validGames();
        invalidGame = invalidGames();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate a random id', () => {
        const idset = new Set();
        let isIdUnique = true;
        for (let i = 0; i < NUMBER_ITERATION; i++) {
            const id = service.generateRandomId();
            if (idset.has(id)) {
                isIdUnique = false;
            } else {
                idset.add(id);
            }
        }
        expect(isIdUnique).toEqual(true);
    });

    it('should be a number of points valid', () => {
        const validQuestion = validQuestions[0];
        const result = service.validatePointValid(validQuestion);
        expect(result).toBeTruthy();
    });

    it('should not be a number of points valid for a question', () => {
        const wrongQuestion = wrongQuestions[0];
        const result = service.validatePointValid(wrongQuestion);
        expect(result).toBeFalsy();
    });

    it('should be a valid number of choices in a qcm', () => {
        const validQuestion = validQuestions[0];
        const result = service.validateNumberChoices(validQuestion);
        expect(result).toBeTruthy();
    });

    it('should be a valid number of choices in a qcm', () => {
        const validQuestion = validQuestions[2];
        const result = service.validateNumberChoices(validQuestion);
        expect(result).toBeTruthy();
    });

    it('1 choice should not be a valid number of choices in a qcm', () => {
        const wrongQuestion = wrongQuestions[1];
        const result = service.validateNumberChoices(wrongQuestion);
        expect(result).toBeFalsy();
    });

    it('should be valid choices answers for question', () => {
        const validChoices = validQuestions[0].choices;
        const result = service.validateChoicesAnswer(validChoices);
        expect(result).toBeTruthy();
    });

    it('should be valid choices answers for question', () => {
        const validChoices = validQuestions[2].choices;
        const result = service.validateChoicesAnswer(validChoices);
        expect(result).toBeTruthy();
    });

    it('should be valid choices answers for question', () => {
        const validChoices = validQuestions[3].choices;
        const result = service.validateChoicesAnswer(validChoices);
        expect(result).toBeTruthy();
    });

    it('should not be valid choices answers distribution for qcm', () => {
        const wrongChoices = wrongQuestions[1].choices;
        const result = service.validateChoicesAnswer(wrongChoices);
        expect(result).toBeFalsy();
    });

    it('should not be valid choices answers distribution for qcm', () => {
        const wrongChoices = wrongQuestions[2].choices;
        const result = service.validateChoicesAnswer(wrongChoices);
        expect(result).toBeFalsy();
    });

    it('should not be valid choices answers distribution for qcm', () => {
        const wrongChoices = wrongQuestions[3].choices;
        const result = service.validateChoicesAnswer(wrongChoices);
        expect(result).toBeFalsy();
    });

    it('should be a valid game that pass the validation questions', () => {
        const result = service.validateQuestions(validGame[0]);
        expect(result).toBeTruthy();
    });

    it('a game with only a qrl should pass the validation questionsa', () => {
        const result = service.validateQuestions(validGame[1]);
        expect(result).toBeTruthy();
    });

    it('should not pass the validation for questions', () => {
        const result = service.validateQuestions(invalidGame[0]);
        expect(result).toBeFalsy();
    });

    it('should not pass the validation for questions', () => {
        const result = service.validateQuestions(invalidGame[1]);
        expect(result).toBeFalsy();
    });

    it('should not pass the validation for questions', () => {
        const result = service.validateQuestions(invalidGame[2]);
        expect(result).toBeFalsy();
    });

    it('should change a null and or no presence of value of choice.isCorrect to false', () => {
        service.changeChoices(validQuestions);
        expect(validQuestions[5].choices[0].isCorrect).toEqual(false);
        expect(validQuestions[4].choices[0].isCorrect).toEqual(false);
    });
});
