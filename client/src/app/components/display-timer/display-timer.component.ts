import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { TimerEvent } from '@common/enum/timer.gateway.events';
@Component({
    selector: 'app-display-timer',
    templateUrl: './display-timer.component.html',
    styleUrls: ['./display-timer.component.scss'],
})
export class DisplayTimerComponent implements OnInit, OnDestroy {
    isOrganising: boolean = true;
    time: number;

    constructor(private clientSocketService: ClientSocketService) {}

    ngOnInit() {
        this.configureFeatures();
    }

    ngOnDestroy(): void {
        this.closeSockets();
    }

    configureFeatures() {
        this.clientSocketService.on(TimerEvent.TimerTick, (time: number) => {
            this.time = time;
        });
    }

    closeSockets() {
        this.clientSocketService.off(TimerEvent.TimerTick);
    }
}
