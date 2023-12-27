import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { Question } from '@common/interfaces/quiz';
@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit, OnDestroy {
    question: string | undefined;
    points: number | undefined;
    isShowQuestion: boolean = true;
    handleGiveCurrentQuestionData = this.handleGiveCurrentQuestion.bind(this);
    handleChangeTopBarData = this.handleChangeTopBar.bind(this);

    constructor(private clientSocketService: ClientSocketService) {}

    ngOnInit() {
        this.configureSockets();
    }

    ngOnDestroy(): void {
        this.closeSockets();
    }

    configureSockets() {
        this.clientSocketService.on(GameEvent.GiveCurrentQuestion, this.handleGiveCurrentQuestionData);
        this.clientSocketService.on(GameEvent.ChangeTopBar, this.handleChangeTopBarData);
    }

    closeSockets() {
        this.clientSocketService.off(GameEvent.ChangeTopBar, this.handleChangeTopBarData);
        this.clientSocketService.off(GameEvent.GiveCurrentQuestion, this.handleGiveCurrentQuestionData);
    }

    private handleGiveCurrentQuestion(question: unknown) {
        const currentQuestion = JSON.parse(question as string) as Question;
        this.question = currentQuestion.text;
        this.points = currentQuestion.points;
    }

    private handleChangeTopBar() {
        this.isShowQuestion = !this.isShowQuestion;
    }
}
