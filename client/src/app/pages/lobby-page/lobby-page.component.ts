import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGameService } from '@app/services/auth-game.service';
import { PlayerService } from '@app/services/player.service';
import { SharedService } from '@app/services/shared.service';
import { RoomSocketService } from '@app/services/socket/room-socket.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { RoomEvent } from '@common/enum/room.gateway.events';
@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    gameStarted: boolean = false;
    connected: boolean;
    isOrganizer: boolean;
    isUsernameValidate: boolean;
    isGameStarting: boolean = false;
    playerCount: number = 0;

    // Param router obligatoire et services essentiels pour le bon fonctionnement
    // eslint-disable-next-line max-params
    constructor(
        private playerService: PlayerService,
        private sharedService: SharedService,
        private roomSocketService: RoomSocketService,
        private authGameService: AuthGameService,
        private router: Router,
    ) {
        this.isUsernameValidate = this.playerService.isUsernameValidate;
        this.isOrganizer = this.playerService.isOrganizer;
        this.connected = this.authGameService.getIsConnected();
        if (this.isOrganizer) this.connected = true;

        this.roomSocketService.kicked();
    }

    ngOnInit() {
        this.configureSockets();
    }

    ngOnDestroy() {
        this.authGameService.setIsConnected(false);
        this.connected = this.authGameService.getIsConnected();
        this.playerService.isOrganizer = false;
        this.closeSockets();
    }

    getIsPlayerSelected(): boolean {
        return this.playerService.getIsPlayerSelected();
    }

    grantAccess() {
        this.sharedService.setSharedIsConnected(true);
        this.authGameService.setIsConnected(true);
        this.connected = this.authGameService.getIsConnected();
    }

    configureSockets() {
        this.roomSocketService.socket.on(RoomEvent.RoutePlayer, (roomId) => {
            if (this.isOrganizer) {
                this.roomSocketService.send(GameEvent.StartGame, { roomID: roomId });
                this.router.navigate(['/organisator-page']);
            } else {
                this.router.navigate(['/Quiz', 'game']);
            }
        });
        this.roomSocketService.socket.on(RoomEvent.DisplayTimer, () => {
            this.isGameStarting = true;
        });

        this.roomSocketService.socket.on(GameEvent.OrgLeft, () => {
            this.router.navigate(['/home']);
        });
    }

    closeSockets() {
        this.roomSocketService.socket.off(RoomEvent.RoutePlayer);
        this.roomSocketService.socket.off(RoomEvent.DisplayTimer);
        this.roomSocketService.socket.off(GameEvent.OrgLeft);
    }

    updatePlayerCount(playerCount: number) {
        this.playerCount = playerCount;
    }
}
