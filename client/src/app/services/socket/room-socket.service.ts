import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGameService } from '@app/services/auth-game.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class RoomSocketService {
    socket: Socket = this.clientSocketService.socket;
    message$: BehaviorSubject<string> = new BehaviorSubject('');
    roomPlayer$: Observable<Map<Socket, string>>;
    roomState$: Observable<boolean>;
    playerList$: Observable<string[]>;
    errorMessage$: Observable<string>;
    playerListSubject: BehaviorSubject<string[]> = new BehaviorSubject(['']);

    private readonly baseUrl: string;
    private roomPlayer: BehaviorSubject<Map<Socket, string>> = new BehaviorSubject(new Map<Socket, string>());
    private roomStateSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private errorMessageSubject: BehaviorSubject<string> = new BehaviorSubject('');

    constructor(
        private router: Router,
        private authGameService: AuthGameService,
        private clientSocketService: ClientSocketService,
    ) {
        this.baseUrl = environment.serverUrl.replace('/api', '');
        this.roomPlayer$ = this.roomPlayer.asObservable();
        this.roomState$ = this.roomStateSubject.asObservable();
        this.playerList$ = this.playerListSubject.asObservable();
        this.errorMessage$ = this.errorMessageSubject.asObservable();
    }
    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(this.baseUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    getRoomID(): Observable<string> {
        this.socket.on(RoomEvent.GetRoomID, (data: string) => {
            this.message$.next(data);
        });
        return this.message$.asObservable();
    }

    updatePlayerList(newPlayerList: string[]) {
        this.playerListSubject.next(newPlayerList);
    }

    deletePlayerList() {
        this.playerListSubject.next(['']);
    }

    getPlayersOfRoom(): Observable<string[]> {
        this.socket.on(RoomEvent.UpdateRoomPlayer, (data: string[]) => {
            this.updatePlayerList(data);
        });
        return this.playerList$;
    }

    getLockState(): Observable<boolean> {
        this.socket.on(RoomEvent.RoomStateChanged, (data: boolean) => {
            this.roomStateSubject.next(data);
        });
        return this.roomState$;
    }

    getRoomPlayers() {
        return new Observable<Map<Socket, string>>((observer) => {
            this.socket.on(RoomEvent.SocketList, (serializedData: { socketId: Socket; playername: string }[]) => {
                const data = new Map(serializedData.map(({ socketId, playername }) => [socketId, playername]));
                observer.next(data);
            });
        });
    }

    async joinRoom() {
        return new Promise<boolean>((resolve) => {
            this.socket.on(RoomEvent.JoinRoom, (data) => {
                this.authGameService.setIsAccepted(data);
                resolve(data);
            });
        });
    }

    getErrorMessage() {
        this.socket.on(RoomEvent.ErrorMessage, (data: string) => {
            this.errorMessageSubject.next(data);
        });
        return this.errorMessage$;
    }

    kicked() {
        this.socket.on(RoomEvent.Kicked, () => {
            this.router.navigate(['/home']);
            this.authGameService.setIsConnected(false);
            this.authGameService.setIsAccepted(false);
        });
    }

    send<T>(event: string, data?: T): void {
        this.clientSocketService.send(event, data);
    }
}
