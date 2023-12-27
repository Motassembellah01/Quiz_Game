import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from '@app/services/validation.service';
import { environment } from 'src/environments/environment';
import { QuizFormComponent } from './quiz-form.component';

const mockQuiz = {
    id: '1a2b3c',
    title: 'Questionnaire sur le JS',
    duration: 10,
    lastModification: '2018-11-13T20:20:39+00:00',
    description: 'Ce questionnaire permet de tester vos connaissances en JS.',
    visibility: true,
    questions: [
        {
            type: 'QCM',
            text: 'Question 1',
            points: 40,
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                },
                {
                    text: 'this',
                    isCorrect: true,
                },
                {
                    text: 'int',
                    isCorrect: false,
                },
            ],
        },
        {
            type: 'QCM',
            text: 'Question 2',
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
        {
            type: 'QCM',
            text: 'Question 3',
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

const baseUrl: string = environment.serverUrl;
const serviceURL = '/api/games';

describe('QuizFormComponent', () => {
    let component: QuizFormComponent;
    let fixture: ComponentFixture<QuizFormComponent>;
    let httpMock: HttpTestingController;
    let validationService: ValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizFormComponent],
            providers: [FormBuilder, ValidationService],
            imports: [ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }), HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(QuizFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        httpMock = TestBed.inject(HttpTestingController);
        validationService = TestBed.inject(ValidationService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        const req = httpMock.expectOne(`${baseUrl}${serviceURL}`);

        expect(component).toBeTruthy();

        req.flush({});
    });

    it('should emit quiz when onSubmitQuiz is called with valid data', () => {
        component.quizForm.setValue({
            title: 'Nouveau quiz',
            description: 'Description',
            duration: 10,
        });

        const req = httpMock.expectOne(`${baseUrl}${serviceURL}`);

        const emitSpy = spyOn(component.quizEmitter, 'emit');
        spyOn(validationService, 'validateTitle').and.returnValue(true);

        component.onSubmitQuiz('submit');

        expect(emitSpy).toHaveBeenCalledWith(component.quiz);

        req.flush({});
    });

    it('ngOnInit should init quizForm with a title, a description and a duration', () => {
        const declaredQuizForm = component.quizForm;
        component.isEditMode = false;
        component.ngOnInit();

        const req = httpMock.expectOne(`${baseUrl}${serviceURL}`);

        expect(component.quizForm).not.toEqual(declaredQuizForm);
        expect(component.quizForm.value.title).toEqual('');
        expect(component.quizForm.value.description).toEqual('');
        expect(component.quizForm.value.duration).toEqual('');

        req.flush({});
    });

    it('ngOnInit should init quizForm with attributes of an existing quiz on edit mode', () => {
        const req = httpMock.expectOne(`${baseUrl}${serviceURL}`);
        component.isEditMode = true;
        component.quizReciever = mockQuiz;

        component.ngOnInit();

        expect(component.quizForm.get('title')?.value).toEqual(mockQuiz.title);
        expect(component.quizForm.get('description')?.value).toEqual(mockQuiz.description);
        expect(component.quizForm.get('duration')?.value).toEqual(mockQuiz.duration);

        req.flush({});
    });

    it('should not emit quiz when onSubmitQuiz is called with invalid data', () => {
        const req = httpMock.expectOne(`${baseUrl}${serviceURL}`);

        const emitSpy = spyOn(component.quizEmitter, 'emit');
        spyOn(validationService, 'validateTitle').and.returnValue(true);

        component.quizForm.setValue({
            title: '',
            description: 'Description',
            duration: 20,
        });

        component.onSubmitQuiz('submit');

        expect(emitSpy).not.toHaveBeenCalled();

        req.flush({});
    });

    it('should not emit quiz when onSubmitQuiz is called with invalid title', () => {
        const req = httpMock.expectOne(`${baseUrl}${serviceURL}`);

        component.isEditMode = false;

        const emitSpy = spyOn(component.quizEmitter, 'emit');
        const validationServiceSpy = spyOn(validationService, 'validateTitle').and.returnValue(false);

        component.quizForm.setValue({
            title: mockQuiz.title,
            description: mockQuiz.description,
            duration: mockQuiz.duration,
        });

        component.onSubmitQuiz('submit');

        expect(emitSpy).not.toHaveBeenCalled();

        expect(validationServiceSpy).toHaveBeenCalledWith(mockQuiz.title);

        req.flush({});
    });

    it('should call router.navigate if action is to leave', () => {
        const req = httpMock.expectOne(`${baseUrl}${serviceURL}`);

        const routerSpy = spyOn(component.router, 'navigate').and.stub();
        component.onSubmitQuiz('leave');
        expect(routerSpy).toHaveBeenCalledOnceWith(['/admin']);

        req.flush({});
    });
});
