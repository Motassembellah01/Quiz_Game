/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { QuizManagementService } from './quiz-management.service';
import { QuizService } from './quiz.service';
import { SharedService } from './shared.service';
import { ValidationService } from './validation.service';
import { OUT_OF_INDEX } from '@common/constantes/constantes';

const quizMock = {
    id: 's0oesm',
    title: 'test',
    duration: 10,
    lastModification: '2023-09-24T04:22:47',
    description: 'testtestest',
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

describe('QuizManagementService', () => {
    let service: QuizManagementService;
    let sharedServiceSpy: jasmine.SpyObj<SharedService>;
    let validationServiceSpy: jasmine.SpyObj<ValidationService>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    beforeEach(() => {
        sharedServiceSpy = jasmine.createSpyObj('SharedService', ['getSharedIsEditMode', 'generateRandomId']);
        validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateQuiz']);
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['addGame', 'modifyGame']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                QuizManagementService,
                ValidationService,
                QuizService,
                SharedService,
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: SharedService, useValue: sharedServiceSpy },
                { provide: ValidationService, useValue: validationServiceSpy },
            ],
        });
        service = TestBed.inject(QuizManagementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the quiz if you call the get quiz', () => {
        service.quiz = quizMock;
        expect(service.getQuiz()).toEqual(quizMock);
    });

    it('should return the indexModified if you call the get IndexModified function ', () => {
        service.indexModified = 1;
        expect(service.getIndexModified()).toEqual(1);
    });

    it('should return -1 as the default indexModified when you call the get IndexModified fucntion', () => {
        expect(service.getIndexModified()).toEqual(OUT_OF_INDEX);
    });

    it('should return the isModified boolean when you call the get isModified function', () => {
        service.isModified = true;
        expect(service.getIsModified()).toBeTrue();
    });

    it('should return false as the default value of the get Ismodified value function', () => {
        expect(service.getIsModified()).toBeFalsy();
    });

    it('should set change the quiz object to the new one when you call the set function', () => {
        const initialQuiz = service.quiz;
        const newQuiz = quizMock;
        service.setQuizData(newQuiz);
        expect(JSON.stringify(initialQuiz)).toEqual(JSON.stringify(initialQuiz));
    });

    it('it should correctly reset the data of the service when the resetData function is called', () => {
        service.isModified = true;
        service.indexModified = 1;
        const newQuiz = quizMock;
        const initialQuiz = service.quiz;
        service.setQuizData(newQuiz);
        service.resetData();
        expect(service.isModified).toBeFalse();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service.indexModified).toEqual(-1);
        expect(JSON.stringify(service.quiz)).toEqual(JSON.stringify(initialQuiz));
    });

    it('it should create a new question if the user is not in modified mode', () => {
        service.isModified = false;
        const initialLenght = service.quiz.questions.length;
        service.createQuestion();
        expect(service.quiz.questions.length).toEqual(initialLenght + 1);
    });

    it('should change the isModified mode to true when creating a new question ', () => {
        service.createQuestion();
        expect(service.isModified).toBeTrue();
    });

    it('should modified the indexModified when creating a new quesiton', () => {
        const initalLenght = service.indexModified;
        service.createQuestion();
        expect(service.indexModified).not.toEqual(initalLenght);
        expect(service.indexModified).toEqual(service.quiz.questions.length - 1);
    });

    it('should alert when trying to delete a question and there is none or only one', () => {
        spyOn(window, 'alert');
        expect(service.quiz.questions.length).toEqual(0);
        service.deleteQuestion();
        expect(window.alert).toHaveBeenCalledWith('Vous ne pouvez pas supprimer une question (minimun 1 question)');
    });

    it('should correctly delete a question if there is at least 2 questions', () => {
        spyOn(service, 'modifyQuestion');
        expect(service.quiz.questions.length).toEqual(0);
        service.setQuizData(quizMock);
        expect(service.quiz.questions.length).toEqual(2);
        service.deleteQuestion();
        expect(service.quiz.questions.length).toEqual(1);
        expect(service.modifyQuestion).toHaveBeenCalled();
    });

    it('should change to modify mode if we are modifying a question', () => {
        service.isModified = false;
        service.setQuizData(quizMock);
        service.modifyQuestion(1);
        expect(service.isModified).toBeTrue();
        expect(service.indexModified).toEqual(1);
    });

    it('if the given index is -1 and its in modify mode it should change the index and modify mode', () => {
        service.isModified = true;
        service.setQuizData(quizMock);
        service.modifyQuestion(-1);
        expect(service.isModified).toBeFalse();
        expect(service.indexModified).toEqual(-1);
    });

    it('should throw an alert if the user tries to click on another question while modifying one already', () => {
        spyOn(window, 'alert');
        service.setQuizData(quizMock);
        service.indexModified = 1;
        service.isModified = true;
        service.modifyQuestion(0);
        expect(window.alert).toHaveBeenCalledWith("Enregistrez d'abord la question en modification");
    });

    it('should update the question in the quiz that has been modified', () => {
        spyOn(service, 'modifyQuestion');
        service.setQuizData(quizMock);
        service.indexModified = 1;
        const newQuestion = {
            type: 'QCM',
            text: 'Quelles sont les couleurs du bâtiment lassonde ?',
            points: 18,
            choices: [
                {
                    text: 'Je sais pas',
                    isCorrect: false,
                },
                {
                    text: 'Multicolore',
                    isCorrect: false,
                },
                {
                    text: 'Rouge - Orange - Vert - Bleu',
                    isCorrect: true,
                },
                {
                    text: 'Rouge - Marron - Vert - Indigo',
                    isCorrect: false,
                },
            ],
        };

        service.updateQuestion(newQuestion);
        expect(JSON.stringify(service.quiz.questions[1])).toEqual(JSON.stringify(newQuestion));
        expect(service.modifyQuestion).toHaveBeenCalledOnceWith(-1);
    });

    it('should update the quiz description , title and duration when called', () => {
        service.updateQuiz(quizMock);
        expect(service.quiz.title).toEqual(quizMock.title);
        expect(service.quiz.description).toEqual(quizMock.description);
        expect(service.quiz.duration).toEqual(quizMock.duration);
    });

    it('should save the quiz succesfully if its valid', () => {
        sharedServiceSpy.getSharedIsEditMode.and.returnValue(false);
        sharedServiceSpy.generateRandomId.and.returnValue('test');
        validationServiceSpy.validateQuiz.and.returnValue(true);
        quizServiceSpy.addGame.and.returnValue(of({}));
        const result = service.saveQuiz();
        expect(result).toBeTruthy();
        expect(sharedServiceSpy.getSharedIsEditMode).toHaveBeenCalled();
        expect(sharedServiceSpy.generateRandomId).toHaveBeenCalled();
        expect(validationServiceSpy.validateQuiz).toHaveBeenCalledWith(service.quiz);
        expect(quizServiceSpy.addGame).toHaveBeenCalledWith(service.quiz);
    });

    it('should not save the quiz to the database if the quiz is not valid', () => {
        validationServiceSpy.validateQuiz.and.returnValue(false);
        sharedServiceSpy.getSharedIsEditMode.and.returnValue(true);
        const result = service.saveQuiz();
        expect(result).toBeFalsy();
    });

    it('should do a modify request to the database if the quiz was modified instead of created', () => {
        validationServiceSpy.validateQuiz.and.returnValue(true);
        sharedServiceSpy.getSharedIsEditMode.and.returnValue(true);
        quizServiceSpy.modifyGame.and.returnValue(of({}));
        const result = service.saveQuiz();
        expect(result).toBeTruthy();
        expect(validationServiceSpy.validateQuiz).toHaveBeenCalledWith(service.quiz);
        expect(sharedServiceSpy.getSharedIsEditMode).toHaveBeenCalled();
        expect(quizServiceSpy.modifyGame).toHaveBeenCalledWith(service.quiz, service.quiz.id);
    });
});
