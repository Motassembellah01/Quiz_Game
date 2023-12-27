import { Component } from '@angular/core';
import { QuizService } from '@app/services/quiz.service';
import { SharedService } from '@app/services/shared.service';
import { Quiz } from '@common/interfaces/quiz';

@Component({
    selector: 'app-admin',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    quizList: Quiz[] = [];
    hover: boolean = false;
    showImportView: boolean = false;
    showGameList: boolean = true;
    showErrorMessage: boolean = false;
    giveErrorMessage: string[];
    connected: boolean;
    showRecordList: boolean = false;

    constructor(
        private quizService: QuizService,
        private sharedService: SharedService,
    ) {
        this.updatePage();
        this.connected = this.sharedService.getSharedIsAdminConnected();
    }

    changeViewAdmin() {
        this.showImportView = true;
        this.showGameList = false;
        this.showRecordList = false;
    }

    changeToGameList() {
        this.showGameList = true;
        this.showImportView = false;
        this.showRecordList = false;
    }

    changeToRecords() {
        this.showRecordList = true;
        this.showGameList = false;
        this.showImportView = false;
    }

    async updatePage() {
        this.quizService.getQuizzes().subscribe((list) => {
            this.quizList = list;
        });
    }

    errorHandler(message: string[]) {
        this.showErrorMessage = !this.showErrorMessage;
        this.giveErrorMessage = message;
    }

    grantAccess() {
        this.sharedService.setSharedIsAdminConnected(true);
        this.connected = true;
    }

    closeMessage() {
        this.showErrorMessage = !this.showErrorMessage;
        this.updatePage();
    }
}
