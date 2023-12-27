import { Injectable } from '@angular/core';
import { OUT_OF_INDEX } from '@common/constantes/constantes';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { DataPlayerJoin } from '@common/interfaces/game-room';
import { environment } from 'src/environments/environment';
import { AuthGameService } from './auth-game.service';
import { GamesService } from './games.service';
import { RoomSocketService } from './socket/room-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    readonly baseUrl: string = environment.serverUrl;
    players: DataPlayerJoin[] = [];
    mapPlayers: Map<string, boolean> = new Map();
    playersBan: DataPlayerJoin[] = [];
    isPlayerSelected: boolean = false;
    playerSelected: DataPlayerJoin;
    emptyPlayer: DataPlayerJoin;
    isOrganizer: boolean;
    isUsernameValidate: boolean;
    isConnected: boolean;
    playerName: string;
    theRoomCode: string;

    constructor(
        private roomSocketService: RoomSocketService,
        private gameService: GamesService,
        private authGameService: AuthGameService,
    ) {
        this.isConnected = this.authGameService.getIsConnected();
        this.gameService.getRoomID()?.subscribe((data) => {
            this.theRoomCode = data;
        });
    }

    createPlayer(name: string) {
        this.playerName = name;
        const player = {
            roomCode: this.theRoomCode,
            username: name,
        };
        this.players.push(player);
    }

    getPlayers() {
        return this.roomSocketService.getPlayersOfRoom();
    }

    getPlayer(thename: string): DataPlayerJoin | null {
        for (const thePalyer of this.players) {
            if (thePalyer.username === thename) {
                return thePalyer;
            }
        }
        return null;
    }

    isBanName(name: string) {
        if (this.playersBan !== undefined) {
            for (const ban of this.playersBan) {
                if (ban.username === name) return true;
            }
        }
        return false;
    }

    openPlayerDetails(player: DataPlayerJoin) {
        this.isPlayerSelected = true;
        this.playerSelected = player;
    }

    getIsPlayerSelected() {
        return this.isPlayerSelected;
    }

    closePlayerDetails() {
        this.isPlayerSelected = false;
        this.playerSelected = this.emptyPlayer;
    }

    leaveRoom() {
        this.roomSocketService.send(RoomEvent.LeaveRoom);
        this.authGameService.resetAllValues();
    }

    removePlayer(player: DataPlayerJoin) {
        const indexOfPlayer = this.players.indexOf(player);
        if (indexOfPlayer !== OUT_OF_INDEX) {
            this.players.splice(indexOfPlayer, 1);
        }
        this.roomSocketService.send(RoomEvent.RemovePlayer, player);
    }

    banPlayer(player: DataPlayerJoin) {
        this.playersBan.push(player);
        this.removePlayer(player);
    }

    async isValid(name: string, password: string): Promise<boolean> {
        const data: DataPlayerJoin = {
            roomCode: password,
            username: name,
        };
        this.roomSocketService.send(RoomEvent.JoinGame, data);
        const result = await this.roomSocketService.joinRoom();
        return result;
    }
}
