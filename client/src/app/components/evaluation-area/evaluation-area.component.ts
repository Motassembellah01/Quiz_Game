import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { FIFTY, ONE_HUNDRED } from '@common/constantes/constantes';
import { GameEvent } from '@common/enum/game.gateway.events';
import { QRLPlayerScore } from '@common/interfaces/QRLPlayerScore';

@Component({
    selector: 'app-evaluation-area',
    templateUrl: './evaluation-area.component.html',
    styleUrls: ['./evaluation-area.component.scss'],
})
export class EvaluationAreaComponent implements OnInit, OnDestroy {
    @Output() allCorrectedScores = new EventEmitter<QRLPlayerScore[]>();
    index: number = 0;
    playerAnswers: string[][] = [];
    playerPoints: QRLPlayerScore[] = [];
    currentEvaluation: string[];
    currentEvalIndex: number = 0;
    allCorrected: boolean = false;
    correctionTime: boolean = false;
    myPercentage: number | undefined = undefined;
    isSelected: boolean[] = [false, false, false];
    handleSendQRLAnswersToOrgData = this.handleSendQRLAnswersToOrg.bind(this);

    constructor(private clientsocketService: ClientSocketService) {}

    ngOnInit() {
        this.configureSockets();
    }
    ngOnDestroy() {
        this.closeSockets();
    }

    configureSockets() {
        this.clientsocketService.on(GameEvent.SendQRLAnswersToOrg, this.handleSendQRLAnswersToOrgData);
        this.clientsocketService.on(GameEvent.askQRLAnswersResponse, this.handleSendQRLAnswersToOrgData);
    }

    selectPercentage(percentage: number) {
        this.myPercentage = percentage;
        switch (percentage) {
            case 0: {
                this.isSelected = [!this.isSelected[0], false, false];
                break;
            }
            case FIFTY: {
                this.isSelected = [false, !this.isSelected[1], false];
                break;
            }
            case ONE_HUNDRED: {
                this.isSelected = [false, false, !this.isSelected[2]];
                break;
            }
            default: {
                this.isSelected = [false, false, false];
                break;
            }
        }
    }

    isOneSelectedButton() {
        for (const selected of this.isSelected) {
            if (selected) {
                return true;
            }
        }
        return false;
    }
    finalize() {
        if (this.myPercentage !== undefined) {
            if (this.isOneSelectedButton()) {
                this.givePercent(this.myPercentage);
                this.myPercentage = undefined;
                this.isSelected = [false, false, false];
            }
        }
    }

    givePercent(percentage: number) {
        this.playerPoints.push({ player: this.currentEvaluation[0], score: percentage } as QRLPlayerScore);
        this.nextAnswer();
    }

    nextAnswer() {
        this.currentEvalIndex++;
        if (this.playerAnswers[this.currentEvalIndex] === undefined) {
            this.allCorrected = true;
            this.correctionTime = false;
            this.allCorrectedScores.emit(this.playerPoints);
            this.playerPoints = [];
        } else {
            this.currentEvaluation = this.playerAnswers[this.currentEvalIndex];
        }
    }

    closeSockets() {
        this.clientsocketService.off(GameEvent.SendQRLAnswersToOrg, this.handleSendQRLAnswersToOrgData);
        this.clientsocketService.off(GameEvent.askQRLAnswersResponse, this.handleSendQRLAnswersToOrgData);
    }

    handleSendQRLAnswersToOrg(answers: unknown) {
        const answersObj = answers as [string, string][];
        const answersMap = new Map(answersObj);
        const sortedMap = new Map([...answersMap].sort());
        this.playerAnswers = Array.from(sortedMap);
        this.allCorrected = false;
        this.currentEvalIndex = 0;
        this.currentEvaluation = this.playerAnswers[this.currentEvalIndex];
        this.correctionTime = true;
    }
}
