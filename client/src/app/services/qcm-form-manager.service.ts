import { Injectable } from '@angular/core';
import { MAX_CHOICES } from '@common/constantes/constantes';
import { Choice, Question } from '@common/interfaces/quiz';

@Injectable({
    providedIn: 'root',
})
export class QcmFormManagerService {
    createChoiceQcm(question: Question): Question | undefined {
        if (question.choices === undefined) return undefined;
        if (question.choices.length < MAX_CHOICES) {
            const choice: Choice = {
                isCorrect: false,
                text: '',
            };
            question.choices.push(choice);
            return question;
        } else {
            alert('Vous ne pouvez pas ajouter une nouvelle réponse (maximum 4 réponses)');
        }
        return undefined;
    }

    deleteChoiceQcm(question: Question, index: number): Question | undefined {
        if (question.choices === undefined) return undefined;
        if (question.choices.length > 2) {
            question.choices.splice(index, 1);
            return question;
        } else {
            alert('Vous ne pouvez pas supprimer une réponse (minimun 2 réponses)');
        }
        return undefined;
    }

    reorderChoices(choices: Choice[], index: number, direction: string): Choice[] | undefined {
        switch (direction) {
            case 'up':
                if (choices !== undefined && index > 0) {
                    const temp = JSON.parse(JSON.stringify(choices[index]));
                    choices[index] = JSON.parse(JSON.stringify(choices[index - 1]));
                    choices[index - 1] = temp;
                    return choices;
                }
                return undefined;

            case 'down':
                if (choices !== undefined && index < choices.length - 1) {
                    const temp = JSON.parse(JSON.stringify(choices[index]));
                    choices[index] = JSON.parse(JSON.stringify(choices[index + 1]));
                    choices[index + 1] = temp;
                    return choices;
                }
                return undefined;

            default:
                return undefined;
        }
    }

    updateQuestionToModify(questionReceiver: Question, initialQuestion: Question): Question {
        if (questionReceiver.choices) {
            initialQuestion.text = questionReceiver.text;
            initialQuestion.points = questionReceiver.points;
            initialQuestion.choices = [...questionReceiver.choices];
        }
        return initialQuestion;
    }
}
