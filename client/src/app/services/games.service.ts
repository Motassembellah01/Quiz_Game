import { Injectable } from '@angular/core';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { GameRoom } from '@common/interfaces/game-room';
import { Quiz } from '@common/interfaces/quiz';
import { Room } from '@common/interfaces/room';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RoomSocketService } from './socket/room-socket.service';
@Injectable({
    providedIn: 'root',
})
export class GamesService {
    readonly baseUrl: string = environment.serverUrl;
    gamesRoom: GameRoom[] = [];
    actualGameRoom: GameRoom;
    actualGameRoomCode: string = '';
    listOfCodes: string[] = [];
    rooms: Map<string, Room> = new Map();

    constructor(private roomSocketService: RoomSocketService) {}

    joinGameRoom(roomCode: string, username: string) {
        const data = { roomCode, username };
        this.roomSocketService.send(RoomEvent.JoinGame, data);
    }

    createNewRoom(quiz: Quiz) {
        this.roomSocketService.send(RoomEvent.CreateRoom, quiz);
    }

    deleteRoom() {
        this.roomSocketService.send(RoomEvent.DeleteRoom, this.actualGameRoomCode);
    }

    lockRoom(roomCode: string) {
        this.roomSocketService.send(RoomEvent.LockRoom, roomCode);
    }

    getRoomID() {
        return this.roomSocketService.getRoomID().pipe(
            tap((data: string) => {
                this.actualGameRoomCode = data;
            }),
        );
    }
}
