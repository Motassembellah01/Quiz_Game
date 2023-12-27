import { ORGANISATOR } from '@app/model/constants';
import { PlayerScore, UpdatePlayerScore } from '@app/model/interfaces/interfaces';
import { MINUS_ONE } from '@common/constantes/constantes';
import { PlayerResult } from '@common/interfaces/playerResult';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class PlayerScoreStateService {
    // map for every player scores in every roomid
    playerScores: Map<string, Map<string, PlayerScore>> = new Map();

    initializeGameScoreBoard(roomId: string, players: Map<io.Socket, string>) {
        if (!this.playerScores.has(roomId)) {
            this.playerScores.set(roomId, new Map());
            const playerScoreLobby = this.playerScores.get(roomId);
            players.forEach((name) => {
                playerScoreLobby.set(name, { score: 0, bonus: 0, status: true });
            });
        }
    }

    updateScoreBoard(roomId: string, updatedPlayerScore: UpdatePlayerScore) {
        const playerScoreLobby = this.playerScores.get(roomId);
        const playerScore = playerScoreLobby.get(updatedPlayerScore.playerName).score;
        let currentBonus = playerScoreLobby.get(updatedPlayerScore.playerName).bonus;
        const currentStatus = playerScoreLobby.get(updatedPlayerScore.playerName).status;
        if (updatedPlayerScore.isBonus) currentBonus = currentBonus + 1;
        const newScore = playerScore + updatedPlayerScore.score;
        playerScoreLobby.set(updatedPlayerScore.playerName, { score: newScore, bonus: currentBonus, status: currentStatus });
    }

    updatePlayerStatus(roomId: string, player: string) {
        const playerScoreLobby = this.playerScores.get(roomId);
        const playerScore = playerScoreLobby.get(player).score;
        const currentBonus = playerScoreLobby.get(player).bonus;
        let currentStatus = playerScoreLobby.get(player).status;
        currentStatus = false;
        playerScoreLobby.set(player, { score: playerScore, bonus: currentBonus, status: currentStatus });
    }

    getCurrentScoreBoard(roomId: string): Map<string, PlayerScore> {
        if (this.playerScores.has(roomId)) {
            const playerMap = this.playerScores.get(roomId);
            const scoreBoard = new Map(playerMap);
            scoreBoard.delete(ORGANISATOR);
            return scoreBoard;
        }
    }

    getPlayerStatus(roomId: string, playerName: string): boolean {
        const playerMap = this.playerScores.get(roomId);
        return playerMap.get(playerName).status;
    }

    deleteScoreRoom(roomId: string) {
        this.playerScores.delete(roomId);
    }

    sortResult(playerResult: PlayerResult[]): PlayerResult[] {
        playerResult.sort((a, b) => {
            if (a.score < b.score) {
                return 1;
            }
            if (a.score > b.score) {
                return MINUS_ONE;
            }

            if (a.name < b.name) {
                return MINUS_ONE;
            }

            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        this.giveRank(playerResult);
        return playerResult;
    }

    giveRank(playerResult: PlayerResult[]): PlayerResult[] {
        let rank = 1;
        for (let i = 0; i < playerResult.length; i++) {
            if (i > 0 && playerResult[i].score < playerResult[i - 1].score) {
                rank++;
            }
            playerResult[i].rank = rank;
        }
        return playerResult;
    }

    getBestScore(roomId): number {
        const players = Array.from(this.playerScores.get(roomId).values());
        const scores: number[] = players.map((player) => player.score);
        return Math.max.apply(null, scores);
    }

    returnFinalResult(roomId: string): PlayerResult[] {
        const playersResults: PlayerResult[] = [];
        const playerScoreLobby = this.playerScores.get(roomId);
        playerScoreLobby.forEach((value, key) => {
            if (key !== ORGANISATOR) {
                const playerName = key;
                const playerScore = value.score;
                const playerBonus = value.bonus;
                const result: PlayerResult = {
                    name: playerName,
                    score: playerScore,
                    bonus: playerBonus,
                    rank: 0,
                };
                playersResults.push(result);
            }
        });
        const playerResultSorted = this.sortResult(playersResults);
        return playerResultSorted;
    }
}
