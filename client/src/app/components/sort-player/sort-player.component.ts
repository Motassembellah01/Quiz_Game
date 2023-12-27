import { Component, OnInit } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SortPlayerService } from '@app/services/sort-player.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { Player } from '@common/interfaces/player';

@Component({
    selector: 'app-sort-player',
    templateUrl: './sort-player.component.html',
    styleUrls: ['./sort-player.component.scss'],
})
export class SortPlayerComponent implements OnInit {
    isDirectionNameUp: boolean = false;
    isDirectionNameDown: boolean = false;

    isDirectionPointUp: boolean = false;
    isDirectionPointDown: boolean = false;

    isDirectionStateUp: boolean = false;
    isDirectionStateDown: boolean = false;

    playerScore: Player[] = [];
    isInit: boolean = true;

    constructor(
        private sortPlayerService: SortPlayerService,
        private clientSocketService: ClientSocketService,
    ) {}

    ngOnInit() {
        this.configureSockets();
    }

    resetAllDirection() {
        this.isDirectionNameUp = false;
        this.isDirectionNameDown = false;
        this.isDirectionPointUp = false;
        this.isDirectionPointDown = false;
        this.isDirectionStateUp = false;
        this.isDirectionStateDown = false;
    }

    toggleSort(type: string, direction: 'up' | 'down') {
        this.sortPlayerService.toggleSort(type, direction);
    }

    makeDecision(direction: string, upOrDown: boolean) {
        let temp = false;
        switch (direction) {
            case 'Name': {
                if (upOrDown) {
                    temp = !this.isDirectionNameUp;
                    this.resetAllDirection();
                    this.isDirectionNameUp = temp;
                } else {
                    temp = !this.isDirectionNameDown;
                    this.resetAllDirection();
                    this.isDirectionNameDown = temp;
                }
                break;
            }
            case 'Point': {
                if (upOrDown) {
                    temp = !this.isDirectionPointUp;
                    this.resetAllDirection();
                    this.isDirectionPointUp = temp;
                } else {
                    temp = !this.isDirectionPointDown;
                    this.resetAllDirection();
                    this.isDirectionPointDown = temp;
                }
                break;
            }
            case 'State': {
                if (upOrDown) {
                    temp = !this.isDirectionStateUp;
                    this.resetAllDirection();
                    this.isDirectionStateUp = temp;
                } else {
                    temp = !this.isDirectionStateDown;
                    this.resetAllDirection();
                    this.isDirectionStateDown = temp;
                }
                break;
            }
        }
    }

    configureSockets() {
        this.clientSocketService.on(GameEvent.Sorting, (data: [string, boolean]) => {
            this.makeDecision(data[0], data[1]);
        });
    }
}
