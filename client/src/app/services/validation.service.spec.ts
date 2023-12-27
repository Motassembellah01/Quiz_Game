import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { QuizService } from '@app/services/quiz.service';
import { Choice, Question, Quiz } from '@common/interfaces/quiz';
import { ValidationService } from './validation.service';
import SpyObj = jasmine.SpyObj;

describe('ValidationService', () => {
    let service: ValidationService;
    let quizServiceSpy: SpyObj<QuizService>;
    let mockChoices: Choice[];
    let mockQuestions: Question[];
    let secondMockQuestions: Question[];
    let mockQuiz: Quiz;

    beforeEach(async () => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['getQuizzes']);
        mockChoices = [
            {
                text: 'Yes',
                isCorrect: true,
            },
            {
                text: 'No',
                isCorrect: false,
            },
        ];

        mockQuestions = [
            {
                choices: undefined,
                points: 30,
                text: 'a question',
                type: 'QRL',
            },
            {
                choices: mockChoices,
                points: 40,
                text: 'another question',
                type: 'QCM',
            },
        ];

        secondMockQuestions = [
            {
                choices: mockChoices,
                points: 30,
                text: undefined,
                type: 'QCM',
            },
            {
                choices: mockChoices,
                points: 40,
                text: 'Second question',
                type: 'QCM',
            },
            {
                choices: mockChoices,
                points: undefined,
                text: 'Second question',
                type: 'QCM',
            },
        ];

        mockQuiz = {
            title: 'this is my quiz',
            id: 'jsnako293jds',
            duration: 30,
            description: 'a small description',
            lastModification: '2023-09-24T16:22:30',
            visibility: false,
            questions: mockQuestions,
        };

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [],
            providers: [ValidationService, { provide: QuizService, useValue: quizServiceSpy }],
        }).compileComponents();

        service = TestBed.inject(ValidationService);
        quizServiceSpy = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validateTitle should return true when title is unique in database', () => {
        service.bdQuizList = [mockQuiz];
        const title = 'Unique title';
        const result = service.validateTitle(title);
        expect(result).toBeTruthy();
    });

    it('validateTitle should return true when title is unique in database', () => {
        service.bdQuizList = [mockQuiz];
        const title = mockQuiz.title;
        const result = service.validateTitle(title);
        expect(result).toBeFalsy();
    });

    it('validateChoicesAnswer should return true when there is a right and a wrong choice', () => {
        const result = service.validateChoicesAnswer(mockChoices);
        expect(result).toBeTruthy();
    });

    it('validateChoicesAnswer should return false when there is no wrong choice', () => {
        mockChoices[1].isCorrect = true;
        const result = service.validateChoicesAnswer(mockChoices);
        expect(result).toBeFalsy();
    });

    it('isEmptyChoices should return true when there is an empty choice text', () => {
        mockChoices[0].text = '';
        const result = service.isEmptyChoices(mockChoices);
        expect(result).toBeTruthy();
    });

    it('isEmptyChoices should return false when there is no empty choice text', () => {
        const result = service.isEmptyChoices(mockChoices);
        expect(result).toBeFalsy();
    });

    it('isUniqueChoices should return true when there is no duplicate choice text', () => {
        const spy = spyOn(service, 'removeDuplicates').and.returnValue([mockChoices[0].text, mockChoices[1].text]);
        const result = service.isUniqueChoices(mockChoices);
        expect(spy).toHaveBeenCalled();
        expect(result).toBeTruthy();
    });

    it('isUniqueChoices should return false when there is duplicate choice text', () => {
        mockChoices[0].text = mockChoices[1].text;
        const spy = spyOn(service, 'removeDuplicates').and.returnValue([mockChoices[0].text]);
        const result = service.isUniqueChoices(mockChoices);
        expect(spy).toHaveBeenCalled();
        expect(result).toBeFalsy();
    });

    it('removeDuplicates should return array with no duplicate choice text', () => {
        const array: string[] = ['1', '2', '3', '2', '4', '1', '5'];
        const result = service.removeDuplicates(array);
        expect(result).toEqual(['1', '2', '3', '4', '5']);
    });

    it('Should validate choices and return true', () => {
        const isValidChoices = service.validateChoices(mockChoices);
        expect(isValidChoices).toBe(true);
    });

    it('validateQuestion should return true', () => {
        const isValidateQuestions = service.validateQuestion(mockQuestions[0]);

        expect(isValidateQuestions).toBeTrue();
    });

    it('validateQuestion should return false because QRL text is missing', () => {
        mockQuestions[0].text = undefined;
        const isValidateQuestions = service.validateQuestion(mockQuestions[0]);

        expect(isValidateQuestions).toBeFalse();
    });

    it('validateQuestion should return false because text question is undefined', () => {
        const isValidateQuestions = service.validateQuestion(secondMockQuestions[0]);

        expect(isValidateQuestions).toBeFalse();
    });

    it('validateQuestion should return false because choices are not validate', () => {
        secondMockQuestions[0].text = 'First question';

        const validateChoicesSpy = spyOn(service, 'validateChoices').and.returnValue(false);

        const isValidateQuestions = service.validateQuestion(secondMockQuestions[0]);

        expect(validateChoicesSpy).toHaveBeenCalled();
        expect(isValidateQuestions).toBeFalse();
    });

    it('validateQuestion should return false because points are not validate', () => {
        const isValidateQuestions = service.validateQuestion(secondMockQuestions[2]);
        expect(isValidateQuestions).toBeFalse();
    });

    it('validateQuestions should return true', () => {
        const spy = spyOn(service, 'validateQuestion').and.returnValue(true);
        const result = service.validateQuestions(mockQuestions);
        expect(spy).toHaveBeenCalled();
        expect(result).toBeTruthy();
    });

    it('validateQuestions should return false', () => {
        const spy = spyOn(service, 'validateQuestion').and.returnValue(false);
        const result = service.validateQuestions(mockQuestions);
        expect(spy).toHaveBeenCalled();
        expect(result).toBeFalsy();
    });

    it('validateQuiz should return true and call validateQuestions', () => {
        const spy = spyOn(service, 'validateQuestions').and.returnValue(true);
        const result = service.validateQuiz(mockQuiz);
        expect(spy).toHaveBeenCalled();
        expect(result).toBeTruthy();
    });

    it('validateQuiz should return false and call validateQuestions', () => {
        mockQuiz.description = '';
        const result = service.validateQuiz(mockQuiz);
        expect(result).toBeFalsy();
    });
});
