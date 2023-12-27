import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGameService } from '@app/services/auth-game.service';
import { DialogService } from '@app/services/dialog.service';
import { GamesService } from '@app/services/games.service';
import { PlayerService } from '@app/services/player.service';
import { RoomSocketService } from '@app/services/socket/room-socket.service';

@Component({
    selector: 'app-online-player-board',
    templateUrl: './online-player-board.component.html',
    styleUrls: ['./online-player-board.component.scss'],
})
export class OnlinePlayerBoardComponent implements OnInit {
    @Input() isGameStarting: boolean = false;
    @Output() playerCount = new EventEmitter<number>();
    playersArray: string[] = [];
    theRoomCode: string = '';
    // param router obligatoire et services necessaires au bon fonctionnement
    // eslint-disable-next-line max-params
    constructor(
        private playerService: PlayerService,
        private router: Router,
        private gamesService: GamesService,
        private roomSocketService: RoomSocketService,
        private authGameService: AuthGameService,
        private dialogService: DialogService,
    ) {}

    subscribeToPlayerUpdates() {
        this.roomSocketService.getPlayersOfRoom()?.subscribe((data: string[]) => {
            this.playersArray = data;
            if (this.playersArray.some((playerName) => playerName.trim() !== '')) this.playerCount.emit(this.playersArray.length);
        });
    }

    ngOnInit() {
        this.subscribeToPlayerUpdates();
        this.roomSocketService.deletePlayerList();
        this.gamesService.getRoomID()?.subscribe((data) => {
            this.theRoomCode = data;
        });
    }

    openPlayerDetails(player: string) {
        const varParam = {
            roomCode: this.theRoomCode,
            username: player,
        };
        this.playerService.openPlayerDetails(varParam);
    }

    leave() {
        this.dialogService.openDialog("de vouloir quitter la salle d'attente").subscribe((res) => {
            if (res === 'true') {
                if (this.playerService.isOrganizer) {
                    this.gamesService.deleteRoom();
                    this.roomSocketService.deletePlayerList();
                    this.playerService.isOrganizer = false;
                } else {
                    this.playerService.leaveRoom();
                }
                this.playerService.isConnected = false;
                this.authGameService.setIsAccepted(false);
                this.router.navigate(['/home']);
            }
        });
    }
}
