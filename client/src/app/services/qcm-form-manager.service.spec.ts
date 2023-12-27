import { TestBed } from '@angular/core/testing';

import { QcmFormManagerService } from './qcm-form-manager.service';
import { Choice, Question } from '@common/interfaces/quiz';

describe('QcmFormManagerService', () => {
    let service: QcmFormManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QcmFormManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a new choice for a question', () => {
        const question: Question = {
            choices: [],
            type: '',
        };

        const updatedQuestion = service.createChoiceQcm(question);

        expect(updatedQuestion?.choices?.length).toBe(1);
        expect(updatedQuestion?.choices?.[0].isCorrect).toBe(false);
        expect(updatedQuestion?.choices?.[0].text).toBe('');
    });

    it('should not create a new choice if there are already 4 choices', () => {
        const question: Question = {
            choices: [
                { isCorrect: false, text: 'Choice 1' },
                { isCorrect: true, text: 'Choice 2' },
                { isCorrect: false, text: 'Choice 3' },
                { isCorrect: false, text: 'Choice 4' },
            ],
            type: '',
        };

        expect(service.createChoiceQcm(question)).toBe(undefined); // No new choice added
    });

    it('should not delete a choice of an undefined question.choices', () => {
        const question: Question = {
            choices: undefined,
            type: '',
        };

        expect(service.createChoiceQcm(question)).toBe(undefined);
    });

    it('should delete a choice from a question', () => {
        const question: Question = {
            choices: [
                { isCorrect: false, text: 'Choice 1' },
                { isCorrect: true, text: 'Choice 2' },
                { isCorrect: false, text: 'Choice 3' },
            ],
            type: '',
        };

        const updatedQuestion = service.deleteChoiceQcm(question, 1);

        expect(updatedQuestion?.choices?.length).toBe(2);
        expect(updatedQuestion?.choices?.[0].text).toBe('Choice 1');
        expect(updatedQuestion?.choices?.[1].text).toBe('Choice 3');
    });

    it('should not delete a choice if there are only 2 choices', () => {
        const question: Question = {
            choices: [
                { isCorrect: false, text: 'Choice 1' },
                { isCorrect: true, text: 'Choice 2' },
            ],
            type: '',
        };

        expect(service.deleteChoiceQcm(question, 0)).toBe(undefined); // No choice deleted
    });

    it('should not delete a choice of an undefined question.choices', () => {
        const question: Question = {
            choices: undefined,
            type: '',
        };

        expect(service.deleteChoiceQcm(question, 0)).toBe(undefined); // No choice deleted
    });

    it('should reorder choices : Choice 3 switch with Choice 2', () => {
        const choices: Choice[] = [
            { isCorrect: false, text: 'Choice 1' },
            { isCorrect: true, text: 'Choice 2' },
            { isCorrect: false, text: 'Choice 3' },
        ];

        const updatedChoices = service.reorderChoices(choices, 2, 'up');

        expect(updatedChoices?.length).toBe(3);
        expect(updatedChoices?.[0].text).toBe('Choice 1');
        expect(updatedChoices?.[1].text).toBe('Choice 3');
        expect(updatedChoices?.[2].text).toBe('Choice 2');
    });

    it('should not reorder choices upwards if index is 0', () => {
        const choices: Choice[] = [
            { isCorrect: false, text: 'Choice 1' },
            { isCorrect: true, text: 'Choice 2' },
            { isCorrect: false, text: 'Choice 3' },
        ];

        const updatedChoices = service.reorderChoices(choices, 0, 'up');

        expect(updatedChoices).toBeUndefined();
    });

    it('should reorder choices : Choice 2 switch with Choice 3', () => {
        const choices: Choice[] = [
            { isCorrect: false, text: 'Choice 1' },
            { isCorrect: true, text: 'Choice 2' },
            { isCorrect: false, text: 'Choice 3' },
        ];

        const updatedChoices = service.reorderChoices(choices, 1, 'down');

        expect(updatedChoices?.length).toBe(3);
        expect(updatedChoices?.[0].text).toBe('Choice 1');
        expect(updatedChoices?.[1].text).toBe('Choice 3');
        expect(updatedChoices?.[2].text).toBe('Choice 2');
    });

    it('should not reorder choices downwards if index is choices.length - 1', () => {
        const choices: Choice[] = [
            { isCorrect: false, text: 'Choice 1' },
            { isCorrect: true, text: 'Choice 2' },
            { isCorrect: false, text: 'Choice 3' },
        ];

        const updatedChoices = service.reorderChoices(choices, 2, 'down');

        expect(updatedChoices).toBeUndefined();
    });

    it('should not reorder choices with direction different of up or down', () => {
        const choices: Choice[] = [
            { isCorrect: false, text: 'Choice 1' },
            { isCorrect: true, text: 'Choice 2' },
            { isCorrect: false, text: 'Choice 3' },
        ];

        const updatedChoices = service.reorderChoices(choices, 0, 'right');

        expect(updatedChoices).toBeUndefined();
    });

    it('should updateQuestionToModify and return the modify question', () => {
        const questionReceiver: Question = {
            text: 'Le texte de questionReceiver',
            type: 'QCM',
            points: 20,
            choices: [
                { isCorrect: false, text: 'Choice 1 receiver' },
                { isCorrect: true, text: 'Choice 2 receiver' },
                { isCorrect: false, text: 'Choice 3 receiver' },
                { isCorrect: false, text: 'Choice 4 receiver' },
            ],
        };

        const initialQuestion: Question = {
            text: 'Le texte de initialQuestion',
            type: 'QCM',
            points: 40,
            choices: [
                { isCorrect: false, text: 'Choice 1 initial' },
                { isCorrect: true, text: 'Choice 2 initial' },
                { isCorrect: false, text: 'Choice 3 initial' },
                { isCorrect: false, text: 'Choice 4 initial' },
            ],
        };

        const updatedQuestion = service.updateQuestionToModify(questionReceiver, initialQuestion);

        expect(updatedQuestion).toEqual(questionReceiver);
    });
});
