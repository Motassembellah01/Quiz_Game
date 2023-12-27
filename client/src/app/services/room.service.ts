import { Injectable } from '@angular/core';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { RoomSocketService } from './socket/room-socket.service';
@Injectable({
    providedIn: 'root',
})
export class RoomService {
    constructor(private roomSocketService: RoomSocketService) {}

    async changeLockState(roomCode: string) {
        this.roomSocketService.send(RoomEvent.LockRoom, roomCode);
    }
}
