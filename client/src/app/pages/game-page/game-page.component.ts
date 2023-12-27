import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService } from '@app/services/games.service';
import { PlayerService } from '@app/services/player.service';
import { QuizService } from '@app/services/quiz.service';
import { SharedService } from '@app/services/shared.service';
import { Quiz } from '@common/interfaces/quiz';

export interface QuizTableData {
    position: number;
    text: string;
    points: number;
    type: string;
}
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
            transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
        ]),
    ],
})
export class GamePageComponent implements OnInit {
    quizList: Quiz[];
    selectedGame: Quiz;
    selectedQuizDescription: string = '';
    quizTime: string = '';
    actualGame: string = 'Jeux';
    isButtonsDisabled = true;
    displayedColumns: string[] = ['position', 'text', 'type', 'points'];
    dataSource: QuizTableData[] = [];
    gameExist: boolean = true;
    errorMsg: string[] = [];

    // Param router obligatoire et services essentiels pour le bon fonctionnement
    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        private sharedService: SharedService,
        private router: Router,
        private playerService: PlayerService,
        private gamesService: GamesService,
    ) {}

    ngOnInit() {
        this.quizService.getVisibleQuiz()?.subscribe((list) => {
            this.quizList = list;
        });
    }

    getGame(title: string): Quiz | undefined {
        return this.quizList.find((g) => g.title === title);
    }

    selectGame(title: string): void {
        const game = this.getGame(title);
        if (game) {
            this.sharedService.setSharedSelectedGame(game);
            this.selectedGame = game;
            this.selectedQuizDescription = game.description;
            this.quizTime = game.duration.toString() + 's/question';
            this.actualGame = game.title;
            this.isButtonsDisabled = false;
            this.parseDataTable(game);
        }
    }

    parseDataTable(game: Quiz) {
        this.dataSource = [];
        let counter = 1;
        for (const questions of game.questions) {
            if (questions.text && questions.points && questions.type) {
                const question: QuizTableData = {
                    position: counter,
                    text: questions.text,
                    points: questions.points,
                    type: questions.type,
                };
                counter++;
                this.dataSource.push(question);
            }
        }
    }

    canPlay() {
        this.quizService.isGameExist(this.selectedGame?.id)?.subscribe({
            next: (bool) => {
                this.gameExist = bool;
                if (this.gameExist) {
                    this.router.navigate(['/Quiz', 'test']);
                } else {
                    const msg = `Le jeu ${this.selectedGame?.title} à été enlever.Veuillir choisir un autre jeu!`;
                    this.errorMsg.push(msg);
                }
            },
        });
    }

    closeMessage() {
        this.gameExist = true;
        this.quizService.getVisibleQuiz()?.subscribe((list) => {
            this.quizList = list;
        });
        this.dataSource = [];
        this.errorMsg = [];
    }

    createGame() {
        this.playerService.isOrganizer = true;
        this.gamesService.createNewRoom(this.selectedGame);
        this.router.navigate(['/lobby-page']);
    }
}
