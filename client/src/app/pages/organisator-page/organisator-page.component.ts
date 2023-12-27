import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DialogService } from '@app/services/dialog.service';
import { ResultService } from '@app/services/result.service';
import { ChatSocketService } from '@app/services/socket/chat-socket.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { QRLPlayerScore } from '@common/interfaces/QRLPlayerScore';
import { PlayerResult } from '@common/interfaces/playerResult';
import { Question } from '@common/interfaces/quiz';
@Component({
    selector: 'app-organisator-page',
    templateUrl: './organisator-page.component.html',
    styleUrls: ['./organisator-page.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
            transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
        ]),
    ],
})
export class OrganisatorPageComponent implements OnInit, OnDestroy {
    allQrlPoints: QRLPlayerScore[];
    answerQuestion: boolean[];
    isNextQuestionAvailable: boolean = false;
    isGameDone: boolean = false;
    answersQRLCorrected: boolean = false;
    totalQuestion: number = 0;
    timerPlay = true;
    panicEnable = false;
    audio: HTMLAudioElement = new Audio();
    showTimerButton: boolean = true;
    correctionMode: boolean = false;
    questionType: string;
    handleGameResultData = this.handleGameResult.bind(this);
    handleCanChangeQuestionData = this.handleCanChangeQuestion.bind(this);
    handleGiveTotalQuestionData = this.handleGiveTotalQuestion.bind(this);
    handleRoutePlayerResultData = this.handleRoutePlayerResult.bind(this);
    handleCanActivatePanicModeData = this.handleCanActivatePanicMode.bind(this);
    handleGiveCurrentQuestionData = this.handleGiveQuestion.bind(this);

    // eslint-disable-next-line max-params
    constructor(
        public clientSocketService: ClientSocketService,
        private chatSocketService: ChatSocketService,
        private router: Router,
        private result: ResultService,
        private dialogService: DialogService,
    ) {}

    ngOnInit() {
        this.configureSockets();
        this.audio = new Audio();
        this.audio.src = './assets/sound.mp3';
        this.audio.load();
    }

    ngOnDestroy(): void {
        this.closeSockets();
    }

    configureSockets() {
        this.clientSocketService.on(GameEvent.GameResult, this.handleGameResultData);
        this.clientSocketService.on(GameEvent.CanChangeQuestion, this.handleCanChangeQuestionData);
        this.clientSocketService.on(GameEvent.GiveTotalQuestion, this.handleGiveTotalQuestionData);
        this.clientSocketService.on(GameEvent.RoutePlayerResult, this.handleRoutePlayerResultData);
        if (!this.clientSocketService.isSocketAlive()) {
            this.leavingActions();
        }

        this.clientSocketService.on(GameEvent.routePlayerResult, () => {
            this.routePlayerResult();
        });

        this.clientSocketService.on(GameEvent.canActivatePanicMode, () => {
            this.panicEnable = true;
        });

        this.clientSocketService.on(GameEvent.GiveCurrentQuestion, this.handleGiveCurrentQuestionData);

        this.clientSocketService.on(GameEvent.TimerDoneClient, () => {
            this.showTimerButton = false;
            if (!this.correctionMode && this.questionType === 'QRL') {
                this.clientSocketService.send('askQRLAnswers');
                this.correctionMode = true;
            }
        });
    }

    routePlayerResult() {
        this.router.navigate(['/result-page']);
    }

    nextquestion() {
        this.totalQuestion--;
        this.clientSocketService.send(GameEvent.NextQuestion);
        this.isNextQuestionAvailable = false;
    }

    showResult() {
        this.clientSocketService.send(GameEvent.ShowResult);
    }

    leave() {
        this.dialogService.openDialog('quitter.Cette action va terminer la partie pour tout le monde').subscribe((res) => {
            if (res === 'true') {
                this.leavingActions();
            }
        });
    }

    leavingActions() {
        this.clientSocketService.send(GameEvent.OrganisatorLeft);
        this.chatSocketService.clearPreviousMessageList();
        this.router.navigate(['/home']);
    }

    closeSockets() {
        this.clientSocketService.off(GameEvent.GameResult, this.handleGameResultData);
        this.clientSocketService.off(GameEvent.CanChangeQuestion, this.handleCanChangeQuestionData);
        this.clientSocketService.off(GameEvent.GiveTotalQuestion, this.handleGiveTotalQuestionData);
        this.clientSocketService.off(GameEvent.RoutePlayerResult, this.handleRoutePlayerResultData);
        this.clientSocketService.off(GameEvent.canActivatePanicMode, this.handleCanActivatePanicModeData);
        this.clientSocketService.off(GameEvent.GiveCurrentQuestion, this.handleGiveCurrentQuestionData);
    }

    toggleStartPlay() {
        this.timerPlay = !this.timerPlay;
        if (this.timerPlay) {
            this.resumeTimer();
        } else {
            this.pauseTimer();
        }
    }

    pauseTimer() {
        this.clientSocketService.send(GameEvent.pauseTimer);
    }

    resumeTimer() {
        this.clientSocketService.send(GameEvent.resumeTimer);
    }

    startPanicMode() {
        this.clientSocketService.send(GameEvent.panicSound);
        this.audio.play();
        this.panicEnable = false;
        this.clientSocketService.send(GameEvent.panicMode);
    }

    onAllCorrectedScores(scores: QRLPlayerScore[]) {
        this.allQrlPoints = scores;
        this.answersQRLCorrected = true;
    }

    sendResult() {
        this.clientSocketService.send(GameEvent.receiveQRLScore, this.allQrlPoints);
        this.allQrlPoints = [];
        this.answersQRLCorrected = false;
    }

    onCorrectionMode() {
        this.correctionMode = true;
    }

    handleGameResult(results: unknown) {
        this.result.setScoreBoardData(JSON.parse(results as string) as PlayerResult[]);
    }

    handleCanChangeQuestion() {
        this.panicEnable = false;
        const noQuestion = this.totalQuestion === 0;
        this.isNextQuestionAvailable = !noQuestion;
        if (noQuestion) {
            this.isGameDone = true;
        }
    }

    handleGiveTotalQuestion(questions: unknown) {
        this.totalQuestion = JSON.parse(questions as string) as number;
        this.totalQuestion--;
    }

    handleRoutePlayerResult() {
        this.routePlayerResult();
    }

    handleCanActivatePanicMode() {
        this.panicEnable = true;
    }

    private handleGiveQuestion(question: unknown) {
        const currentQuestion = question as Question;
        this.questionType = currentQuestion.type;
        this.correctionMode = false;
        this.showTimerButton = true;
    }
}
