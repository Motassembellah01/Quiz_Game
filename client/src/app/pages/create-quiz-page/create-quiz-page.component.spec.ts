/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuizManagementService } from '@app/services/quiz-management.service';
import { SharedService } from '@app/services/shared.service';
import { CreateQuizPageComponent } from './create-quiz-page.component';
import SpyObj = jasmine.SpyObj;

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

const defaultQuiz = {
    duration: 10,
    id: '',
    lastModification: '',
    questions: [],
    title: 'Nouveau quiz',
    description: '',
    visibility: false,
};

describe('CreateQuizPageComponent', () => {
    let component: CreateQuizPageComponent;
    let fixture: ComponentFixture<CreateQuizPageComponent>;
    let sharedServiceSpy: jasmine.SpyObj<SharedService>;
    let quizManagementSpy: jasmine.SpyObj<QuizManagementService>;
    let routerSpy: SpyObj<Router>;

    beforeEach(async () => {
        sharedServiceSpy = jasmine.createSpyObj('SharedService', ['getSharedIsEditMode', 'getSharedSelectedGame', 'setSharedIsEditMode']);
        quizManagementSpy = jasmine.createSpyObj('QuizManagementService', [
            'setQuizData',
            'getIsModified',
            'resetData',
            'createQuestion',
            'deleteQuestion',
            'modifyQuestion',
            'updateQuestion',
            'updateQuiz',
            'saveQuiz',
            'getIndexModified',
            'getQuiz',
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [CreateQuizPageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: QuizManagementService, useValue: quizManagementSpy },
                { provide: SharedService, useValue: sharedServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatTabGroup, useValue: {} },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(CreateQuizPageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should save the quiz and leave', fakeAsync(() => {
        quizManagementSpy.saveQuiz.and.returnValue(true);
        routerSpy.navigate.and.stub();
        component.saveQuiz();
        tick(100);
        expect(quizManagementSpy.saveQuiz).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
    }));

    it('should be able to leave the page when done', fakeAsync(() => {
        routerSpy.navigate.and.stub();
        component.leave();
        tick(100);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
    }));

    it('should update the quiz by calling the quiz management service and update local data to reflect the service data', () => {
        quizManagementSpy.updateQuiz.and.returnValue(quizMock);
        spyOn(component, 'updateLocalData');
        component.updateQuiz(quizMock);
        expect(quizManagementSpy.updateQuiz).toHaveBeenCalledOnceWith(quizMock);
        expect(component.updateLocalData).toHaveBeenCalled();
    });

    it('should update a question when the function is called by calling the service', () => {
        quizManagementSpy.updateQuestion.and.stub();
        component.updateQuestion(quizMock.questions[0]);
        expect(quizManagementSpy.updateQuestion).toHaveBeenCalledWith(quizMock.questions[0]);
    });

    it('should modify the question when calling the service and updating the local data', () => {
        quizManagementSpy.modifyQuestion.and.stub();
        spyOn(component, 'updateLocalData');
        component.modifyQuestion(1);
        expect(quizManagementSpy.modifyQuestion).toHaveBeenCalledWith(1);
        expect(component.updateLocalData).toHaveBeenCalled();
    });

    it('should delete the question by calling the service', () => {
        quizManagementSpy.deleteQuestion.and.stub();
        component.deleteQuestion();
        expect(quizManagementSpy.deleteQuestion).toHaveBeenCalled();
    });

    it('should create a question by calling the service and then updating the local quiz to the service quiz update', () => {
        quizManagementSpy.createQuestion.and.stub();
        quizManagementSpy.getQuiz.and.returnValues(quizMock);
        spyOn(component, 'updateLocalData');
        component.createQuestion();
        expect(JSON.stringify(component.quiz)).toEqual(JSON.stringify(quizMock));
        expect(component.updateLocalData).toHaveBeenCalled();
        expect(quizManagementSpy.createQuestion).toHaveBeenCalled();
        expect(quizManagementSpy.getQuiz).toHaveBeenCalled();
    });

    it('should updatea the local data of the component to the service data', () => {
        component.indexModified = -1;
        quizManagementSpy.getIndexModified.and.returnValue(0);
        component.updateLocalData();
        expect(component.indexModified).toEqual(0);
    });

    it('it should reset the data in sharedService and quiz-management when the page is destroyed', () => {
        quizManagementSpy.resetData.and.stub();
        component.ngOnDestroy();
        expect(quizManagementSpy.resetData).toHaveBeenCalled();
        expect(sharedServiceSpy.setSharedIsEditMode).toHaveBeenCalledWith(false);
    });

    it('should initialize data on the ngOnInit if the use is in edit mode', () => {
        sharedServiceSpy.getSharedIsEditMode.and.returnValues(true);
        sharedServiceSpy.getSharedSelectedGame.and.returnValue(quizMock);
        component.ngOnInit();
        expect(sharedServiceSpy.getSharedIsEditMode).toHaveBeenCalled();
        expect(JSON.stringify(component.quiz)).toEqual(JSON.stringify(quizMock));
        expect(quizManagementSpy.setQuizData).toHaveBeenCalledWith(component.quiz);
    });

    it('should get the default quiz by the service if not in edit mode', () => {
        sharedServiceSpy.getSharedIsEditMode.and.returnValues(false);
        quizManagementSpy.getQuiz.and.returnValue(defaultQuiz);
        component.ngOnInit();
        expect(component.quiz).toEqual(defaultQuiz);
    });

    it('should update the quiz by calling the quiz management service and update local data to reflect the service data', fakeAsync(() => {
        const mockTabGroup = jasmine.createSpyObj('MatTabGroup', ['']);

        component.tabGroup = mockTabGroup;

        component.updateQuiz(quizMock);

        expect(mockTabGroup.selectedIndex).toEqual(1);
    }));

    it('should update a question when the function is called by calling the service', () => {
        const mockTabGroup = jasmine.createSpyObj('MatTabGroup', ['']);

        component.tabGroup = mockTabGroup;

        component.updateQuestion(quizMock.questions[0]);

        expect(mockTabGroup.selectedIndex).toEqual(2);
    });

    it('should modify the question when calling the service and update tabGroup if available', () => {
        const mockTabGroup: Partial<MatTabGroup> = {
            selectedIndex: -1,
        };

        component.tabGroup = mockTabGroup as MatTabGroup;

        component.modifyQuestion(1);

        expect(quizManagementSpy.modifyQuestion).toHaveBeenCalledWith(1);

        expect(mockTabGroup.selectedIndex).toBe(1);
    });

    it('should get the isModified variable', () => {
        quizManagementSpy.getIsModified.and.returnValue(true);
        expect(component.isModified).toBeTruthy();
    });
});
