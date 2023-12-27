import { Injectable } from '@angular/core';
import { GameEvent } from '@common/enum/game.gateway.events';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class ClientSocketService {
    url: string;
    socket: Socket;

    currentQuestion$: Observable<string>;
    private currentQuestion: BehaviorSubject<string> = new BehaviorSubject('');

    constructor() {
        this.url = environment.serverUrl;
        this.currentQuestion$ = this.currentQuestion.asObservable();
    }

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(this.url, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    joinTestRoom() {
        this.socket.emit(GameEvent.JoinTestRoom);
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    off<T>(event: string, action?: (data: T) => void): void {
        this.socket.off(event, action);
    }

    send<T>(event: string, data?: T, callback?: () => void): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }
}
