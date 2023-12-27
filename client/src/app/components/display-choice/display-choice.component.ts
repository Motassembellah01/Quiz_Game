import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { Choice } from '@common/interfaces/quiz';
@Component({
    selector: 'app-display-choice',
    templateUrl: './display-choice.component.html',
    styleUrls: ['./display-choice.component.scss'],
})
export class DisplayChoiceComponent implements OnInit, OnDestroy {
    @Input() color: object = {};
    @Input() index: number;
    @Input() isSelected: boolean;
    @Input() isCorrect: boolean = false;
    @Input() choice: Choice = { text: '', isCorrect: false };
    @Output() timerDone = new EventEmitter<void>();
    handleTimerDoneClientData = this.handleTimerDoneClient.bind(this);

    constructor(private clientSocketService: ClientSocketService) {}

    ngOnInit() {
        this.configureSockets();
    }

    ngOnDestroy(): void {
        this.closeSockets();
    }

    configureSockets() {
        this.clientSocketService.on(GameEvent.TimerDoneClient, this.handleTimerDoneClientData);

        this.clientSocketService.on(GameEvent.EveryPlayerAnswered, () => {
            this.showAnswer();
        });
    }

    showAnswer() {
        this.color = { backgroundColor: this.isCorrect ? '#47b9a3' : '#FE0000' };
    }

    closeSockets() {
        this.clientSocketService.off(GameEvent.TimerDoneClient, this.handleTimerDoneClientData);
        this.clientSocketService.off(GameEvent.EveryPlayerAnswered);
    }

    handleTimerDoneClient() {
        this.showAnswer();
        this.timerDone.emit();
    }
}
