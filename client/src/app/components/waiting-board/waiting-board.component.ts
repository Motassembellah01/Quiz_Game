import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { GamesService } from '@app/services/games.service';
import { PlayerService } from '@app/services/player.service';
import { RoomService } from '@app/services/room.service';
import { SharedService } from '@app/services/shared.service';
import { RoomSocketService } from '@app/services/socket/room-socket.service';
import { ONE_SECOND_DELAY } from '@common/constantes/constantes';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { Quiz } from '@common/interfaces/quiz';
import { timer } from 'rxjs';
import { Socket } from 'socket.io-client';
@Component({
    selector: 'app-waiting-board',
    templateUrl: './waiting-board.component.html',
    styleUrls: ['./waiting-board.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
            transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
        ]),
    ],
})
export class WaitingBoardComponent implements OnInit {
    @Input() isGameStarting: boolean = false;
    @Input() playerCount = 0;
    quiz: Quiz;
    isOrganizer: boolean;
    actualGameRoom: Promise<string>;
    theRoomCode: string;
    isGameLocked: boolean = false;
    roomPlayer: Map<Socket, string> = new Map();
    isCopied: boolean = false;

    // services necessaires pour le bon fonctionnement
    // eslint-disable-next-line max-params
    constructor(
        private sharedService: SharedService,
        private playerService: PlayerService,
        private gameService: GamesService,
        private roomService: RoomService,
        private roomSocketService: RoomSocketService,
    ) {
        this.quiz = this.sharedService.getSharedSelectedGame();
        this.isOrganizer = this.playerService.isOrganizer;
    }

    subscribeToRoomStateUpdate() {
        this.roomSocketService.getLockState()?.subscribe((data: boolean) => {
            this.isGameLocked = data;
        });
    }

    subscribeToRoomPlayer() {
        this.roomSocketService.getRoomPlayers()?.subscribe((data: Map<Socket, string>) => {
            this.roomPlayer = data;
        });
        return this.roomPlayer;
    }

    ngOnInit() {
        this.gameService.getRoomID()?.subscribe((data) => {
            this.theRoomCode = data;
        });

        this.subscribeToRoomStateUpdate();
        this.subscribeToRoomPlayer();
        this.isGameLocked = false;
    }

    toggleGameLock() {
        this.roomService.changeLockState(this.theRoomCode);
    }

    startGame() {
        const dataToSend = {
            roomID: this.theRoomCode,
            quiz: this.quiz,
            players: Array.from(this.subscribeToRoomPlayer()),
        };
        this.roomSocketService.send(RoomEvent.Start, dataToSend);
    }

    copyCode() {
        this.isCopied = true;
        timer(ONE_SECOND_DELAY).subscribe(() => {
            this.isCopied = false;
        });
    }
}
