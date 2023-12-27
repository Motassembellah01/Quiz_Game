import { CreateChoiceDto } from '@app/model/dto/game/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/game/create-question.dto';
import { RADIX, TEN } from '@common/constantes/constantes';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationService {
    validateQuestions(jsonObj: CreateGameDto) {
        const questionsArray = jsonObj.questions;

        this.changeChoices(questionsArray);

        for (const question of questionsArray) {
            if (
                !this.validatePointValid(question) ||
                (question.type.toUpperCase() === 'QCM' && (!this.validateChoicesAnswer(question.choices) || !this.validateNumberChoices(question)))
            ) {
                return false;
            }
        }
        return true;
    }

    changeChoices(questions: CreateQuestionDto[]) {
        for (const question of questions) {
            if (question.type === 'QCM') {
                for (const choice of question.choices) {
                    if (!choice.isCorrect) {
                        choice.isCorrect = false;
                    }
                }
            }
        }
    }

    validatePointValid(question: CreateQuestionDto) {
        return question.points % TEN === 0;
    }

    validateNumberChoices(question: CreateQuestionDto) {
        return question.choices.length >= 2;
    }

    validateChoicesAnswer(choicesArray: CreateChoiceDto[]) {
        const goodAnswer = choicesArray.some((choice) => choice.isCorrect);
        const wrongAnswer = choicesArray.some((choice) => !choice.isCorrect);
        return goodAnswer && wrongAnswer;
    }

    generateRandomId(): string {
        const length = 6;
        return Math.random()
            .toString(RADIX)
            .substring(2, length + 2);
    }
}
