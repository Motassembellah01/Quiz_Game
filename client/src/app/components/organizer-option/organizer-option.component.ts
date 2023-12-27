import { Component, OnInit } from '@angular/core';
import { GamesService } from '@app/services/games.service';
import { PlayerService } from '@app/services/player.service';
import { Player } from '@common/interfaces/player';

interface DataPlayerJoin {
    roomCode: string;
    username: string;
}

@Component({
    selector: 'app-organizer-option',
    templateUrl: './organizer-option.component.html',
    styleUrls: ['./organizer-option.component.scss'],
})
export class OrganizerOptionComponent implements OnInit {
    player: Player[];
    playerSelected: DataPlayerJoin;
    open: boolean = false;
    isOrganizer: boolean;
    theRoomCode: string;

    constructor(
        private playerService: PlayerService,
        private gameService: GamesService,
    ) {
        this.playerSelected = this.playerService.playerSelected;
        this.open = this.playerService.isPlayerSelected;
        this.isOrganizer = this.playerService.isOrganizer;
    }

    ngOnInit() {
        this.gameService.getRoomID()?.subscribe((data) => {
            this.theRoomCode = data;
        });
    }

    closeOptions() {
        this.playerService.closePlayerDetails();
    }

    banOption() {
        this.playerService.removePlayer(this.playerSelected);
        this.closeOptions();
    }
}
