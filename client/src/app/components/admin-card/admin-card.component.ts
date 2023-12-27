import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '@app/services/dialog.service';
import { QuizService } from '@app/services/quiz.service';
import { SharedService } from '@app/services/shared.service';
import { INDENT_FORMAT, SWITCH_PAGE_DELAY } from '@common/constantes/constantes';
import { Quiz } from '@common/interfaces/quiz';

@Component({
    selector: 'app-admin-card',
    templateUrl: './admin-card.component.html',
    styleUrls: ['./admin-card.component.scss'],
})
export class AdminCardComponent implements OnInit, OnDestroy {
    @Input() quiz: Quiz;
    @Output() toggleHidden = new EventEmitter<void>();
    @Output() updatePage = new EventEmitter<void>();
    @Output() deleteError = new EventEmitter<string[]>();
    hide: boolean = true;
    url: string;
    fileName: string;

    // Router obligatoire avec angular
    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        private sharedService: SharedService,
        private router: Router,
        private dialogService: DialogService,
    ) {}

    ngOnInit(): void {
        this.exportJSON();
    }

    ngOnDestroy(): void {
        window.URL.revokeObjectURL(this.url);
    }

    toggleVisibility() {
        this.quizService.updateVisibility(this.quiz.id).subscribe(() => {
            this.updatePage.emit();
        });
    }

    deleteGame() {
        this.dialogService.openDialog('effacer ce jeu cette action est irréversible').subscribe((res) => {
            if (res === 'true') {
                // eslint-disable-next-line deprecation/deprecation
                this.quizService.deleteQuiz(this.quiz.id).subscribe(
                    () => {
                        this.updatePage.emit();
                    },
                    (error: HttpErrorResponse) => {
                        this.deleteError.emit([error.error.message]);
                    },
                );
            }
        });
    }

    exportJSON() {
        const jsonObj = JSON.parse(JSON.stringify(this.quiz));
        delete jsonObj.visibility;
        const jsonStr = JSON.stringify(jsonObj, null, INDENT_FORMAT);
        const blob = new Blob([jsonStr], { type: 'quiz/data' });
        this.url = window.URL.createObjectURL(blob);
        this.fileName = `${this.quiz.title}.json`;
    }

    editGame() {
        this.sharedService.setSharedIsEditMode(true);
        this.sharedService.setSharedSelectedGame(this.quiz);
        setTimeout(() => {
            this.router.navigate(['/create-quiz']);
        }, SWITCH_PAGE_DELAY);
    }
}
