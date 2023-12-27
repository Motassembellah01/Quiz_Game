import { Injectable } from '@angular/core';
import { Choice, Question, Quiz } from '@common/interfaces/quiz';
import { QuizService } from './quiz.service';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    bdQuizList: Quiz[];

    constructor(private quizService: QuizService) {
        this.quizService.getQuizzes()?.subscribe((list) => {
            this.bdQuizList = list;
        });
    }

    validateTitle(title: string): boolean {
        for (const quiz of this.bdQuizList) {
            if (title.toLowerCase() === quiz.title.toLowerCase()) {
                return false;
            }
        }
        return true;
    }

    validateChoices(choices: Choice[]): boolean {
        return this.validateChoicesAnswer(choices) && this.isUniqueChoices(choices) && !this.isEmptyChoices(choices);
    }

    validateQuestion(question: Question): boolean {
        if (!question.text) return false;

        if (!question.points) return false;

        if (question.type === 'QCM' && (!question.choices || !this.validateChoices(question.choices))) return false;

        return true;
    }

    validateQuestions(questions: Question[]): boolean {
        for (const question of questions) {
            if (!this.validateQuestion(question)) {
                return false;
            }
        }
        return true;
    }

    validateChoicesAnswer(choicesArray: Choice[]) {
        const goodAnswer = choicesArray.some((choice) => choice.isCorrect);
        const wrongAnswer = choicesArray.some((choice) => !choice.isCorrect);
        return goodAnswer && wrongAnswer;
    }

    isEmptyChoices(choices: Choice[]): boolean {
        for (const choice of choices) {
            if (choice.text === '') {
                return true;
            }
        }
        return false;
    }

    isUniqueChoices(choices: Choice[]): boolean {
        const choiceText: string[] = [];
        for (const choice of choices) {
            choiceText.push(choice.text);
        }
        const length = choiceText.length;
        return this.removeDuplicates(choiceText).length === length;
    }

    removeDuplicates(stringArray: string[]) {
        const unique: string[] = [];
        stringArray.forEach((element) => {
            if (!unique.includes(element)) {
                unique.push(element);
            }
        });
        return unique;
    }

    isDefinedAndNotEmpty(value: unknown): boolean {
        return value !== undefined && value !== null && value !== '';
    }

    validateQuiz(quiz: Quiz): boolean {
        return (
            this.isDefinedAndNotEmpty(quiz.description) &&
            this.isDefinedAndNotEmpty(quiz.duration) &&
            this.isDefinedAndNotEmpty(quiz.id) &&
            this.isDefinedAndNotEmpty(quiz.questions) &&
            this.isDefinedAndNotEmpty(quiz.title) &&
            this.isDefinedAndNotEmpty(quiz.visibility) &&
            this.validateQuestions(quiz.questions)
        );
    }
}
