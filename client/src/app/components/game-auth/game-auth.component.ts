import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { PlayerService } from '@app/services/player.service';
import { RoomSocketService } from '@app/services/socket/room-socket.service';
import { RoomEvent } from '@common/enum/room.gateway.events';

@Component({
    selector: 'app-game-auth',
    templateUrl: './game-auth.component.html',
    styleUrls: ['./game-auth.component.scss'],
})
export class GameAuthComponent implements OnInit {
    @Output() connect = new EventEmitter<void>();
    userPassword: string = '';
    userName: string = '';

    constructor(
        private playerService: PlayerService,
        public roomSocketService: RoomSocketService,
        private clientSocketService: ClientSocketService,
    ) {}

    ngOnInit() {
        this.clientSocketService.on(RoomEvent.ErrorMessage, (data: string) => {
            if (data !== '') alert(data);
        });
    }

    async validate() {
        const isValid = await this.playerService.isValid(this.userName, this.userPassword);

        if (isValid) {
            this.connect.emit();
            this.playerService.createPlayer(this.userName);
        }
    }
}
