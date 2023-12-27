import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Question } from '@common/interfaces/quiz';
import { QrlFormComponent } from './qrl-form.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TEN } from '@common/constantes/constantes';

describe('QrlFormComponent', () => {
    let component: QrlFormComponent;
    let fixture: ComponentFixture<QrlFormComponent>;

    const mockQuestion: Question = {
        text: 'Une question',
        points: 50,
        type: '',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QrlFormComponent],
            providers: [FormBuilder],
            imports: [ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' })],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(QrlFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create empty form', () => {
        component.ngOnInit();
        expect(component.qrlForm.value.text).toEqual('');
        expect(component.qrlForm.value.points).toEqual('');
    });

    it('should fill form with recieved question', () => {
        expect(component.question.text).toEqual('');
        expect(component.question.points).toEqual(TEN);
        component.questionReceiver = mockQuestion;
        component.ngOnChanges();
        expect(component.question.text).toEqual(mockQuestion.text);
        expect(component.question.points).toEqual(mockQuestion.points);
    });

    it('should submit question and send it to createQuizPage', () => {
        component.qrlForm.setValue({
            text: mockQuestion.text,
            points: mockQuestion.points,
        });
        const spy = spyOn(component.questionEmitter, 'emit');
        component.onSubmitQRL();
        expect(component.question.text).toEqual(mockQuestion.text);
        expect(component.question.points).toEqual(mockQuestion.points);
        expect(spy).toHaveBeenCalled();
    });

    it('should send signal to createQuizPage', () => {
        const spy = spyOn(component.deleteEmitter, 'emit');
        component.deleteQuestion();
        expect(spy).toHaveBeenCalled();
    });
});
