import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { QuizManagementService } from '@app/services/quiz-management.service';
import { SharedService } from '@app/services/shared.service';
import { NOT_SELECTED, WAIT_TIME } from '@common/constantes/constantes';
import { Question, Quiz } from '@common/interfaces/quiz';
import { timer } from 'rxjs';

@Component({
    selector: 'app-create-quiz-page',
    templateUrl: './create-quiz-page.component.html',
    styleUrls: ['./create-quiz-page.component.scss'],
})
export class CreateQuizPageComponent implements OnInit, OnDestroy {
    @ViewChild('tabGroup') tabGroup: MatTabGroup;
    emptyQuiz: Quiz;
    quiz: Quiz = {
        duration: 10,
        id: '',
        lastModification: '',
        questions: [],
        title: 'Nouveau quiz',
        description: '',
        visibility: false,
    };

    indexModified = NOT_SELECTED;

    constructor(
        private sharedService: SharedService,
        private router: Router,
        private quizManagementService: QuizManagementService,
    ) {}

    get isModified() {
        return this.quizManagementService.getIsModified();
    }

    ngOnInit() {
        if (this.sharedService.getSharedIsEditMode()) {
            this.quiz = this.sharedService.getSharedSelectedGame();
            this.quizManagementService.setQuizData(this.quiz);
        } else {
            this.quiz = this.quizManagementService.getQuiz();
        }
    }

    ngOnDestroy(): void {
        this.quizManagementService.resetData();
        this.sharedService.setSharedIsEditMode(false);
    }

    updateLocalData(): void {
        this.indexModified = this.quizManagementService.getIndexModified();
    }

    createQuestion(): void {
        this.quizManagementService.createQuestion();
        this.quiz = this.quizManagementService.getQuiz();
        this.updateLocalData();
    }

    deleteQuestion(): void {
        this.quizManagementService.deleteQuestion();
    }

    modifyQuestion(index: number): void {
        this.quizManagementService.modifyQuestion(index);
        if (this.tabGroup) {
            this.tabGroup.selectedIndex = 1;
        }
        this.updateLocalData();
    }

    updateQuestion(question: Question): void {
        if (this.tabGroup) {
            this.tabGroup.selectedIndex = 2;
        }
        this.quizManagementService.updateQuestion(question);
    }

    updateQuiz(quiz: Quiz): void {
        this.quiz = this.quizManagementService.updateQuiz(quiz);
        if (this.tabGroup) {
            this.tabGroup.selectedIndex = 1;
        }
        this.updateLocalData();
    }

    saveQuiz() {
        if (this.quizManagementService.saveQuiz()) this.leave();
    }

    leave() {
        timer(WAIT_TIME).subscribe(() => {
            this.router.navigate(['/admin']);
        });
    }
}
