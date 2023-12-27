import { Injectable } from '@angular/core';
import { ValidationService } from '@app/services/validation.service';
import { Question, Quiz } from '@common/interfaces/quiz';
import { QuizService } from './quiz.service';
import { SharedService } from './shared.service';
import { UNSELECTED_INDEX } from '@common/constantes/constantes';

@Injectable({
    providedIn: 'root',
})
export class QuizManagementService {
    isModified = false;
    indexModified = UNSELECTED_INDEX;
    quiz: Quiz = {
        duration: 10,
        id: '',
        lastModification: '',
        questions: [],
        title: 'Nouveau quiz',
        description: '',
        visibility: false,
    };

    constructor(
        private sharedService: SharedService,
        private validationService: ValidationService,
        private quizService: QuizService,
    ) {}

    getQuiz(): Quiz {
        return this.quiz;
    }

    getIndexModified(): number {
        return this.indexModified;
    }

    getIsModified(): boolean {
        return this.isModified;
    }

    setQuizData(quiz: Quiz) {
        this.quiz = quiz;
    }

    resetData() {
        this.isModified = false;
        this.indexModified = -1;
        this.quiz = {
            duration: 10,
            id: '',
            lastModification: '',
            questions: [],
            title: 'Nouveau quiz',
            description: '',
            visibility: false,
        };
    }

    createQuestion(): void {
        if (!this.isModified) {
            const question: Question = {
                choices: [
                    {
                        isCorrect: false,
                        text: '',
                    },
                    {
                        isCorrect: false,
                        text: '',
                    },
                ],
                points: 10,
                text: '',
                type: '',
            };
            this.quiz.questions?.push(question);
            this.isModified = true;
            this.indexModified = this.quiz.questions?.length - 1;
        }
    }

    deleteQuestion(): void {
        if (this.quiz.questions.length > 1) {
            this.quiz.questions.splice(this.indexModified, 1);
            this.modifyQuestion(UNSELECTED_INDEX);
        } else {
            alert('Vous ne pouvez pas supprimer une question (minimun 1 question)');
        }
    }

    modifyQuestion(index: number): void {
        if (!this.isModified) {
            this.isModified = true;
            this.indexModified = index;
        } else if (this.isModified && index === UNSELECTED_INDEX) {
            this.isModified = false;
            this.indexModified = index;
        } else if (index !== this.indexModified) {
            alert("Enregistrez d'abord la question en modification");
        }
    }

    updateQuestion(question: Question): void {
        this.quiz.questions[this.indexModified] = question;
        this.modifyQuestion(UNSELECTED_INDEX);
    }

    updateQuiz(quiz: Quiz): Quiz {
        this.quiz.title = quiz.title;
        this.quiz.description = quiz.description;
        this.quiz.duration = quiz.duration;
        return this.quiz;
    }

    saveQuiz(): boolean {
        if (!this.sharedService.getSharedIsEditMode()) {
            this.quiz.id = this.sharedService.generateRandomId();
        }
        const date = new Date();
        this.quiz.lastModification = date.toISOString().split('+')[0].split('.')[0];

        if (this.validationService.validateQuiz(this.quiz)) {
            if (!this.sharedService.getSharedIsEditMode()) {
                this.quizService.addGame(this.quiz)?.subscribe();
            } else {
                this.quizService.modifyGame(this.quiz, this.quiz.id)?.subscribe();
            }
            return true;
        }
        return false;
    }
}
