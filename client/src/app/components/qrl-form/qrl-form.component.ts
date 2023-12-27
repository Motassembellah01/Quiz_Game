import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Question } from '@common/interfaces/quiz';

@Component({
    selector: 'app-qrl-form',
    templateUrl: './qrl-form.component.html',
    styleUrls: ['./qrl-form.component.scss'],
})
export class QrlFormComponent implements OnInit, OnChanges {
    @Input() questionReceiver: Question;
    @Output() questionEmitter = new EventEmitter<Question>();
    @Output() deleteEmitter = new EventEmitter<Question>();
    qrlForm: FormGroup;
    question: Question = {
        choices: undefined,
        points: 10,
        text: '',
        type: 'QRL',
    };

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.qrlForm = this.fb.group({
            text: ['', Validators.required],
            points: ['', Validators.required],
        });
    }

    ngOnChanges() {
        this.question.text = this.questionReceiver.text;
        this.question.points = this.questionReceiver.points;
    }

    onSubmitQRL(): void {
        if (this.qrlForm.valid) {
            this.question.text = this.qrlForm.value.text;
            this.question.points = this.qrlForm.value.points;
            this.questionEmitter.emit(this.question);
        }
    }

    deleteQuestion() {
        this.deleteEmitter.emit();
    }
}
