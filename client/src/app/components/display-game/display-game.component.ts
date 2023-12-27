import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { KeyboardHandlerService } from '@app/services/keyboard-handler.service';
import { CHARACTER_LIMIT, ENTER_KEY_VALUE, FIFTY, FIVE_SECOND_DELAY, ONE_HUNDRED, ONE_SECOND_DELAY } from '@common/constantes/constantes';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { GameEvent } from '@common/enum/game.gateway.events';
import { Choice, Question } from '@common/interfaces/quiz';
import JSConfetti from 'js-confetti';

@Component({
    selector: 'app-display-game',
    templateUrl: './display-game.component.html',
    styleUrls: ['./display-game.component.scss'],
})
export class DisplayGameComponent implements OnInit, OnDestroy {
    @Input() mode: string | null;
    @ViewChild('submit') submitBtn: ElementRef;
    currentQuestion: Question;
    currentQuestionType: string;
    choices: Choice[] | undefined;
    isChatFocused: boolean = false;
    isQrlFocused: boolean = false;
    color = [
        // eslint disable parce que peut pas mettre nom attribut css en camelCase!
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { 'background-color': '#A15266' },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { 'background-color': '#DC7B65' },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { 'background-color': '#D28629' },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { 'background-color': '#FCB45F' },
    ];
    isSelectedArr: boolean[] = [];
    answerQuestionQRL: string = '';
    isTimerDone: boolean = false;
    isAnswerSubmitted = false;
    answerQuestionQCM: boolean[] = [];
    remainingCharacters: number = CHARACTER_LIMIT;
    showQRLScore: boolean = false;
    scoreMessageQRL: [string, string, number];
    isActiveQRL: boolean = false;
    lastActivityTime: number = Date.now();
    handleQRLScoreData = this.handleQRLScore.bind(this);
    sendIdleData = this.sendIdle.bind(this);
    idleInterval: number;
    firstInteraction: boolean = false;
    constructor(
        public keyboardHandlerService: KeyboardHandlerService,
        public render: Renderer2,
        public clientSocketService: ClientSocketService,
    ) {}

    @HostListener('window:keydown', ['$event'])
    onKeyPress(event: KeyboardEvent): void {
        const key = this.keyboardHandlerService.handleKeyPress(event);
        if (key === ENTER_KEY_VALUE && !this.isChatFocused && !this.isQrlFocused) {
            const sumbmitBtn = this.submitBtn.nativeElement;
            sumbmitBtn.click();
            sumbmitBtn.disabled = true;
            this.render.addClass(sumbmitBtn, 'clicked');
            this.isAnswerSubmitted = true;
        } else if (key != null && !this.isChatFocused && !this.isQrlFocused) {
            this.toggleSelection(key - 1);
        }
    }

    ngOnInit() {
        this.configureSockets();
    }

    ngOnDestroy(): void {
        this.closeSockets();
        window.clearInterval(this.idleInterval);
    }

    toggleSelection(index: number) {
        if (!this.isAnswerSubmitted) this.isSelectedArr[index] = !this.isSelectedArr[index];
        this.clientSocketService.send(GameEvent.SelectChoice, this.isSelectedArr);
    }

    toggleSubmit() {
        this.isAnswerSubmitted = true;
        this.render.addClass(this.submitBtn.nativeElement, 'clicked');
        this.submitBtn.nativeElement.disabled = true;
        if (this.isQRL()) {
            window.clearInterval(this.idleInterval);
            this.clientSocketService.send(GameEvent.PlayerAnswerQRL, this.answerQuestionQRL);
        } else this.clientSocketService.send(GameEvent.PlayerAnswer, this.isSelectedArr);
        if (this.mode === 'test') this.clientSocketService.send(GameEvent.SubmitTestRoom);
    }

    resetSubmitButton() {
        this.remainingCharacters = CHARACTER_LIMIT;
        this.submitBtn.nativeElement.disabled = false;
        this.isAnswerSubmitted = false;
        this.render.removeClass(this.submitBtn.nativeElement, 'clicked');
        this.answerQuestionQRL = '';
    }

    configureSockets() {
        this.clientSocketService.on(GameEvent.GiveCurrentQuestion, (question) => {
            this.isTimerDone = false;
            this.currentQuestion = JSON.parse(question as string) as Question;
            this.currentQuestionType = this.currentQuestion.type;
            if (!this.isQRL()) {
                this.choices = this.currentQuestion.choices;
                this.isSelectedArr = new Array(this.choices?.length).fill(false);
            } else {
                this.idleInterval = window.setInterval(this.sendIdleData, ONE_SECOND_DELAY);
                this.lastActivityTime = Date.now();
                this.isActiveQRL = false;
                this.clientSocketService.send(GameEvent.playerIdle);
                this.firstInteraction = false;
            }
            this.showQRLScore = false;
            this.resetSubmitButton();
        });

        this.clientSocketService.on(GameEvent.GiveCurrentQuestionAnswers, (answers) => {
            this.answerQuestionQCM = JSON.parse(answers as string) as boolean[];
        });
        this.clientSocketService.on(ChatEvent.Confetti, () => {
            const jsConfetti = new JSConfetti();
            jsConfetti.addConfetti();
        });

        this.clientSocketService.on(GameEvent.TimerDoneClient, () => {
            this.timerHit0();
        });

        this.clientSocketService.on(GameEvent.QRLScore, this.handleQRLScoreData);
    }

    timerHit0() {
        if (!this.isAnswerSubmitted) {
            this.isTimerDone = true;
            if (this.isQRL()) {
                this.clientSocketService.send(GameEvent.PlayerAnswerQRL, this.answerQuestionQRL);
            } else {
                this.clientSocketService.send(GameEvent.PlayerAnswerNoSubmit, this.isSelectedArr);
            }
            window.clearInterval(this.idleInterval);
            this.isAnswerSubmitted = true;
            this.render.addClass(this.submitBtn.nativeElement, 'clicked');
            this.submitBtn.nativeElement.disabled = true;
        }
    }

    closeSockets() {
        this.clientSocketService.off(GameEvent.GiveCurrentQuestion);
        this.clientSocketService.off(GameEvent.GiveCurrentQuestionAnswers);
        this.clientSocketService.off(GameEvent.QRLScore, this.handleQRLScoreData);
        this.clientSocketService.off(GameEvent.TimerDoneClient);
    }

    isQRL(): boolean {
        return this.currentQuestion?.type === 'QRL';
    }

    setQrlFocus(value: boolean) {
        this.isQrlFocused = value;
    }

    updateCharacterCount() {
        this.remainingCharacters = CHARACTER_LIMIT - (this.answerQuestionQRL ? this.answerQuestionQRL.length : 0);
    }

    sendActive() {
        this.lastActivityTime = Date.now();
        if (!this.isActiveQRL) {
            this.clientSocketService.send(GameEvent.playerActive);
            this.isActiveQRL = true;
        }
        if (!this.firstInteraction) {
            this.clientSocketService.send(GameEvent.firstInteractionQRL);
            this.firstInteraction = true;
        }
    }

    sendIdle() {
        const currentTime = Date.now();
        const idleTime = currentTime - this.lastActivityTime;

        if (idleTime > FIVE_SECOND_DELAY && this.isActiveQRL) {
            this.clientSocketService.send(GameEvent.playerIdle);
            this.isActiveQRL = false;
        }
    }

    handleQRLScore(score: unknown) {
        const scoreAsNumber = score as number;
        switch (scoreAsNumber) {
            case 0: {
                this.scoreMessageQRL = ['Dommage! ' + '\uD83D\uDE22', 'Meilleure chance la prochaine fois.', scoreAsNumber];
                break;
            }
            case FIFTY: {
                this.scoreMessageQRL = ['Proche! ' + '\uD83D\uDE09', 'Tu y étais presque.', scoreAsNumber];
                break;
            }
            case ONE_HUNDRED: {
                this.scoreMessageQRL = ['Bravo! ' + '\uD83D\uDE03', "Tu l'as bien eu.", scoreAsNumber];
                break;
            }
            default: {
                this.scoreMessageQRL = ['', '', 0];
                break;
            }
        }
        this.showQRLScore = true;
    }
}
