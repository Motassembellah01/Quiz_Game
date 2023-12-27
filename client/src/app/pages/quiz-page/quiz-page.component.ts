import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DialogService } from '@app/services/dialog.service';
import { ResultService } from '@app/services/result.service';
import { SharedService } from '@app/services/shared.service';
import { ChatSocketService } from '@app/services/socket/chat-socket.service';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { GameEvent } from '@common/enum/game.gateway.events';
import { ChartData } from '@common/interfaces/chartData';
import { PlayerResult } from '@common/interfaces/playerResult';
import { Quiz } from '@common/interfaces/quiz';
@Component({
    selector: 'app-quiz-root',
    templateUrl: './quiz-page.component.html',
    styleUrls: ['./quiz-page.component.scss'],
})
export class QuizComponent implements OnInit, OnDestroy {
    currentQuiz: Quiz;
    mode: string | null;
    audio: HTMLAudioElement = new Audio();

    // Param router et activatedRoute obligatoire et services essentiels pour le bon fonctionnement
    // eslint-disable-next-line max-params
    constructor(
        private clientSocketService: ClientSocketService,
        public chatSocketService: ChatSocketService,
        public sharedService: SharedService,
        public route: ActivatedRoute,
        public router: Router,
        public result: ResultService,
        private dialogService: DialogService,
    ) {}

    ngOnInit(): void {
        if (this.sharedService?.getSharedSelectedGame()) {
            this.currentQuiz = this.sharedService.getSharedSelectedGame();
        }
        this.audio = new Audio();
        this.audio.src = './assets/sound.mp3';
        this.audio.load();
        this.mode = this.route.snapshot.paramMap?.get('mode');
        this.connect();
        this.startGame();
    }

    ngOnDestroy(): void {
        if (this.mode === 'test') {
            this.clientSocketService.send(GameEvent.LeaveTestRoom);
        }
        this.closeSockets();
    }

    connect() {
        if (this.mode === 'test') {
            this.clientSocketService.joinTestRoom();
        }
        this.configureSockets();
    }

    configureSockets() {
        this.clientSocketService.on(GameEvent.GameDone, () => {
            if (this.mode === 'test') this.leaveTest();
        });
        this.clientSocketService.on(GameEvent.GameResult, (results) => {
            this.result.setScoreBoardData(JSON.parse(results as string) as PlayerResult[]);
        });

        this.clientSocketService.on(GameEvent.RoutePlayerResult, () => {
            this.routePlayerResult();
        });

        this.clientSocketService.on(GameEvent.OrgLeft, () => {
            this.chatSocketService.clearPreviousMessageList();
            this.router.navigate(['/home']);
        });
        if (!this.clientSocketService.isSocketAlive()) {
            this.abandonGameActions();
        }
        this.clientSocketService.on(GameEvent.playPanic, () => {
            this.audio.play();
        });

        this.clientSocketService.on(GameEvent.sendGraphs, (graphs) => {
            this.result.setStatsData(JSON.parse(graphs as string) as ChartData[]);
        });
    }

    startGame() {
        if (this.mode === 'test') {
            this.clientSocketService.send(GameEvent.StartTestGame, this.currentQuiz);
        }
    }

    abandonGame() {
        this.dialogService.openDialog('abandonner la partie définitivement').subscribe((res) => {
            if (res === 'true') {
                this.abandonGameActions();
            }
        });
    }

    abandonGameActions() {
        this.chatSocketService.clearPreviousMessageList();
        if (this.mode === 'test') {
            this.router.navigate(['/game']);
        } else {
            this.clientSocketService.send('MessageSystemAbandon');
            this.clientSocketService.send(GameEvent.PlayerAbandon);
            this.router.navigate(['/home']);
        }
    }

    routePlayerResult() {
        this.router.navigate(['/result-page']);
        this.clientSocketService.send(ChatEvent.UnblockedRoom);
    }

    leaveTest() {
        this.clientSocketService.send(GameEvent.LeaveTestRoom);
        this.chatSocketService.clearPreviousMessageList();
        this.router.navigate(['/game']);
    }

    closeSockets() {
        this.clientSocketService.off(GameEvent.GameDone);
        this.clientSocketService.off(GameEvent.GameResult);
    }
}
