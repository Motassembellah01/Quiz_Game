import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { QcmFormManagerService } from '@app/services/qcm-form-manager.service';
import { ValidationService } from '@app/services/validation.service';
import { Question } from '@common/interfaces/quiz';
import { QcmFormComponent } from './qcm-form.component';
import SpyObj = jasmine.SpyObj;
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TEN } from '@common/constantes/constantes';

describe('QcmFormComponent', () => {
    let component: QcmFormComponent;
    let fixture: ComponentFixture<QcmFormComponent>;
    let validationServiceSpy: SpyObj<ValidationService>;
    let qcmFormManagerSpy: SpyObj<QcmFormManagerService>;

    const mockQuestion: Question = {
        text: 'Une question',
        points: 50,
        choices: [
            {
                text: 'choix 1',
                isCorrect: true,
            },
            {
                text: 'choix 2',
                isCorrect: false,
            },
        ],
        type: 'QCM',
    };

    beforeEach(() => {
        validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateChoices']);
        qcmFormManagerSpy = jasmine.createSpyObj('QcmFormManagerService', ['createChoiceQcm', 'deleteChoiceQcm', 'reorderChoices']);
        TestBed.configureTestingModule({
            declarations: [QcmFormComponent],
            providers: [
                { provide: ValidationService, useValue: validationServiceSpy },
                { provide: QcmFormManagerService, useValue: qcmFormManagerSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [FormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(QcmFormComponent);
        component = fixture.componentInstance;
        validationServiceSpy = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
        qcmFormManagerSpy = TestBed.inject(QcmFormManagerService) as jasmine.SpyObj<QcmFormManagerService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fill form with recieved question', () => {
        expect(component.question.text).toEqual('');
        expect(component.question.points).toEqual(TEN);
        expect(component.question.choices).toEqual([
            {
                isCorrect: false,
                text: '',
            },
            {
                isCorrect: false,
                text: '',
            },
        ]);
        component.questionReceiver = mockQuestion;
        component.ngOnChanges();
        expect(component.question).toEqual(mockQuestion);
    });

    it('should submit question and send it to createQuizPage', () => {
        component.question = mockQuestion;
        const form: NgForm = {
            value: {
                text: 'Ceci est un texte',
                points: 10,
            },
            valid: true,
            resetForm: jasmine.createSpy('resetForm'),
            ...jasmine.createSpyObj('NgForm', ['resetForm', 'reset']),
        };

        const questionEmitterSpy = spyOn(component.questionEmitter, 'emit');
        validationServiceSpy.validateChoices.and.returnValue(true);

        component.onSubmitQCM(form);

        expect(component.question).toEqual(mockQuestion);
        expect(validationServiceSpy.validateChoices).toHaveBeenCalled();
        expect(questionEmitterSpy).toHaveBeenCalled();
    });

    it('should not submit question and throw an alert - 1', () => {
        component.question = mockQuestion;
        const form: NgForm = {
            value: {
                text: 'Ceci est un texte',
                points: null,
            },
            valid: false,
            resetForm: jasmine.createSpy('resetForm'),
            ...jasmine.createSpyObj('NgForm', ['resetForm', 'reset']),
        };

        const questionEmitterSpy = spyOn(component.questionEmitter, 'emit');
        const windowAlert = spyOn(window, 'alert');
        validationServiceSpy.validateChoices.and.returnValue(true);

        component.onSubmitQCM(form);

        expect(windowAlert).toHaveBeenCalled();
        expect(validationServiceSpy.validateChoices).toHaveBeenCalled();
        expect(questionEmitterSpy).not.toHaveBeenCalled();
    });

    it('should not submit question and throw an alert - 2', () => {
        component.question = mockQuestion;
        const form: NgForm = {
            value: {
                text: 'Ceci est un texte',
                points: null,
            },
            valid: false,
            resetForm: jasmine.createSpy('resetForm'),
            ...jasmine.createSpyObj('NgForm', ['resetForm', 'reset']),
        };

        const questionEmitterSpy = spyOn(component.questionEmitter, 'emit');
        const windowAlert = spyOn(window, 'alert');
        validationServiceSpy.validateChoices.and.returnValue(false);

        component.onSubmitQCM(form);

        expect(windowAlert).toHaveBeenCalled();
        expect(validationServiceSpy.validateChoices).toHaveBeenCalled();
        expect(questionEmitterSpy).not.toHaveBeenCalled();
        expect(component.isComplete).toBeFalse();
    });

    it('should send signal to createQuizPage', () => {
        const spy = spyOn(component.deleteEmitter, 'emit');
        component.deleteQuestion();
        expect(spy).toHaveBeenCalled();
    });

    it('should call createChoiceQcm and set new value of question', () => {
        qcmFormManagerSpy.createChoiceQcm.and.returnValue(mockQuestion);
        component.createChoice(mockQuestion);
        expect(qcmFormManagerSpy.createChoiceQcm).toHaveBeenCalled();
        expect(component.question).toEqual(mockQuestion);
    });

    it('should call deleteChoiceQcm and set new value of question', () => {
        qcmFormManagerSpy.deleteChoiceQcm.and.returnValue(mockQuestion);
        component.deleteChoice(mockQuestion, 0);
        expect(qcmFormManagerSpy.deleteChoiceQcm).toHaveBeenCalled();
        expect(component.question).toEqual(mockQuestion);
    });

    it('should call reorderChoices and set new value of choices', () => {
        qcmFormManagerSpy.reorderChoices.and.returnValue(mockQuestion.choices);
        component.reorderChoices(mockQuestion.choices, 0, 'down');
        expect(qcmFormManagerSpy.reorderChoices).toHaveBeenCalled();
        expect(component.question.choices).toEqual(mockQuestion.choices);
    });
});
