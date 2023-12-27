import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SideQuizListComponent } from './side-quiz-list.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

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

const secondMockQuiz = {
    duration: 10,
    id: '',
    lastModification: '',
    questions: [],
    title: 'Nouveau quiz',
    description: '',
    visibility: false,
};

describe('SideQuizListComponent', () => {
    let component: SideQuizListComponent;
    let fixture: ComponentFixture<SideQuizListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SideQuizListComponent],
            providers: [FormBuilder],
            imports: [ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' })],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(SideQuizListComponent);
        component = fixture.componentInstance;
        component.quiz = mockQuiz;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit modified index when modifyQuestion is called', () => {
        const index = 2;
        const emitSpy = spyOn(component.modifiedIndex, 'emit');

        component.modifyQuestion(index);

        expect(emitSpy).toHaveBeenCalledWith(index);
    });

    it('should change question order (down) when changeOrderQuestion is called', () => {
        component.changeOrderQuestion(1, 'down');

        expect(component.quiz.questions[1].text).toBe('Question 3');
        expect(component.quiz.questions[2].text).toBe('Question 2');
        component.changeOrderQuestion(1, 'down');
    });

    it('should change question order (up) when changeOrderQuestion is called', () => {
        component.changeOrderQuestion(1, 'up');

        expect(component.quiz.questions[0].text).toBe('Question 2');
        expect(component.quiz.questions[1].text).toBe('Question 1');

        component.changeOrderQuestion(1, 'up');
    });

    it('should not change question order if direction is invalid', () => {
        component.changeOrderQuestion(2, '');

        expect(component.quiz.questions[0].text).toBe('Question 1');
        expect(component.quiz.questions[1].text).toBe('Question 2');
        expect(component.quiz.questions[2].text).toBe('Question 3');
    });

    it('should not change question order if questions are undefined', () => {
        component.quiz = secondMockQuiz;
        component.changeOrderQuestion(0, 'up');

        expect(secondMockQuiz.questions[0]).toBeUndefined();
    });
});
