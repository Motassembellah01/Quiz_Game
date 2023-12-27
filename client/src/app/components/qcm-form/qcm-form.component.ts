import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QcmFormManagerService } from '@app/services/qcm-form-manager.service';
import { ValidationService } from '@app/services/validation.service';
import { Choice, Question } from '@common/interfaces/quiz';

@Component({
    selector: 'app-qcm-form',
    templateUrl: './qcm-form.component.html',
    styleUrls: ['./qcm-form.component.scss'],
})
export class QcmFormComponent implements OnChanges {
    @Input() questionReceiver: Question;
    @Output() questionEmitter = new EventEmitter<Question>();
    @Output() deleteEmitter = new EventEmitter<Question>();
    question: Question = {
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
        type: 'QCM',
    };
    isComplete: boolean = false;

    constructor(
        private validationService: ValidationService,
        private qcmFormManager: QcmFormManagerService,
    ) {}

    ngOnChanges() {
        if (this.questionReceiver.choices) {
            this.question.text = this.questionReceiver.text;
            this.question.points = this.questionReceiver.points;
            this.question.choices = [];
            for (let i = 0; i < this.questionReceiver.choices?.length; i++) {
                this.question.choices.push(this.questionReceiver.choices[i]);
            }
        }
    }

    onSubmitQCM(form: NgForm) {
        if (this.question.choices && this.validationService.validateChoices(this.question.choices) && this.question.points) {
            if (form.valid) {
                this.question.text = form.value.text;
                this.question.points = form.value.points;
                this.questionEmitter.emit(this.question);
            } else {
                alert("Le formulaire est invalide. Assurez-vous d'avoir rempli l'ensemble des sections.");
            }
        } else {
            alert("Assurez-vous d'avoir au moins une bonne réponse et une mauvaise réponse et que vos réponses soit distinctes");
            this.isComplete = false;
        }
    }

    createChoice(question: Question): void {
        const questions = this.qcmFormManager.createChoiceQcm(question);
        if (questions) {
            this.question = questions;
        }
    }

    deleteChoice(question: Question, index: number): void {
        const questions = this.qcmFormManager.deleteChoiceQcm(question, index);
        if (questions) {
            this.question = questions;
        }
    }

    reorderChoices(choices: Choice[] | undefined, index: number, direction: string) {
        if (choices !== undefined) {
            const newChoices = this.qcmFormManager.reorderChoices(choices, index, direction);
            if (newChoices !== undefined) {
                this.question.choices = newChoices;
            }
        }
    }

    deleteQuestion() {
        this.deleteEmitter.emit();
    }
}
