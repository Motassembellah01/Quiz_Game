import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationService } from '@app/services/validation.service';
import { Quiz } from '@common/interfaces/quiz';

@Component({
    selector: 'app-quiz-form',
    templateUrl: './quiz-form.component.html',
    styleUrls: ['./quiz-form.component.scss'],
})
export class QuizFormComponent implements OnInit, OnChanges {
    @Input() quizReciever: Quiz;
    @Output() quizEmitter = new EventEmitter<Quiz>();
    @Output() leaveEmitter = new EventEmitter<Quiz>();

    bdQuizList: Quiz[];
    quiz: Quiz = {
        duration: 10,
        id: '',
        lastModification: '',
        questions: [],
        title: 'Nouveau quiz',
        description: '',
        visibility: false,
    };
    quizForm: FormGroup;
    isEditMode: boolean = false;

    constructor(
        private fb: FormBuilder,
        private validationService: ValidationService,
        public router: Router,
    ) {}

    ngOnInit() {
        this.quizForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            duration: ['', Validators.required],
        });
        if (this.isEditMode) {
            this.quizForm.patchValue({
                title: this.quizReciever.title,
                description: this.quizReciever.description,
                duration: this.quizReciever.duration,
            });
        }
        this.ngOnChanges();
    }

    ngOnChanges() {
        if (this.quizReciever?.title !== 'Nouveau quiz') {
            this.isEditMode = true;
            this.quiz.title = this.quizReciever?.title;
            this.quiz.description = this.quizReciever?.description;
            this.quiz.duration = this.quizReciever?.duration;
        }
    }

    onSubmitQuiz(action: string) {
        if (action === 'leave') {
            this.router.navigate(['/admin']);
        } else {
            if (this.quizForm.valid) {
                if ((!this.isEditMode && this.validationService.validateTitle(this.quizForm.value.title)) || this.isEditMode) {
                    this.quiz.title = this.quizForm.value.title;
                    this.quiz.description = this.quizForm.value.description;
                    this.quiz.duration = this.quizForm.value.duration;
                    this.quizEmitter.emit(this.quiz);
                } else {
                    alert("Le nom du quiz n'est pas valide");
                }
            } else {
                alert("Remplissez tous les champs afin d'enregistrer");
            }
        }
    }
}
