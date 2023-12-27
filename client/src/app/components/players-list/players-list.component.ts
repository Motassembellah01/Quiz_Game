import { Component, Input, OnInit } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SortPlayerService } from '@app/services/sort-player.service';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { GameEvent } from '@common/enum/game.gateway.events';
import { Player } from '@common/interfaces/player';
@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent implements OnInit {
    @Input() mode: string | null;
    testScore: number = 0;
    playerScore: Player[] = [];
    playerPoints: number;
    isInit: boolean = true;
    constructor(
        private clientSocketService: ClientSocketService,
        public sortPlayerService: SortPlayerService,
    ) {}

    ngOnInit() {
        this.configureSockets();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatPlayerData(data: any) {
        const parsedData = JSON.parse(data);
        for (const player of parsedData) {
            for (const elem of this.playerScore) {
                if (elem.name === player[0]) {
                    elem.score = player[1].score;
                    elem.status = player[1].status;
                }
            }
        }
        this.sortPlayerService.playerScore = this.playerScore;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatPlayerDataStart(data: any) {
        this.playerScore = [];
        const parsedData = JSON.parse(data);
        for (const player of parsedData) {
            const newPlayerName = player[0];
            const newPlayerScore = player[1].score;
            const newPlayerStatus = player[1].status;
            this.playerScore.push({
                name: newPlayerName,
                score: newPlayerScore,
                status: newPlayerStatus,
                chat: true,
                interaction: false,
                submit: false,
            });
        }
        this.sortPlayerService.playerScore = this.playerScore;
        this.isInit = false;
    }

    toggleChat(player: Player) {
        this.clientSocketService.send(ChatEvent.ChatStateChange, [player.chat, player.name]);
        player.chat = !player.chat;
    }

    configureSockets() {
        this.clientSocketService.on(GameEvent.GiveScores, (scores) => {
            const playerScores = scores as string;
            if (this.isInit) {
                this.formatPlayerDataStart(playerScores);
            } else {
                this.formatPlayerData(playerScores);
                this.sortPlayerService.decisionOfSort();
            }
        });

        this.clientSocketService.on(GameEvent.GivePlayerScore, (points) => {
            this.playerPoints = JSON.parse(points as string) as number;
        });

        this.clientSocketService.on(ChatEvent.PlayerChatChange, (data: string) => {
            this.updatePlayerByName(data);
        });

        this.clientSocketService.on(GameEvent.SubmitForColor, (name: string) => {
            this.updateSubmitionPlayer(name);
        });

        this.clientSocketService.on(GameEvent.UpdateColor, (name: string) => {
            this.updateInteractionPlayer(name);
        });

        this.clientSocketService.on(GameEvent.ResetStates, () => {
            this.resetPlayersStates();
        });

        this.clientSocketService.on(GameEvent.PlayerListSorted, (listSorted: string) => {
            this.formatPlayerData(listSorted);
        });
    }

    updatePlayerByName(name: string) {
        for (const player of this.playerScore) {
            if (player.name === name) {
                player.chat = !player.chat;
            }
        }
    }

    updateInteractionPlayer(name: string) {
        for (const player of this.playerScore) {
            if (player.name === name) {
                player.interaction = true;
                this.sortPlayerService.decisionOfSort();
            }
        }
    }

    updateSubmitionPlayer(name: string) {
        for (const player of this.playerScore) {
            if (player.name === name) {
                player.submit = true;
                this.sortPlayerService.decisionOfSort();
            }
        }
    }

    resetPlayersStates() {
        for (const player of this.playerScore) {
            player.interaction = false;
            player.submit = false;
        }
    }
}
