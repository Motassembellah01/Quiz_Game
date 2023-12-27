import { ORGANISATOR } from '@app/model/constants';
import { CreateQuestionDto } from '@app/model/dto/game/create-question.dto';
import { QRLPlayerScore, UpdatePlayerScore } from '@app/model/interfaces/interfaces';
import { PlayerScoreStateService } from '@app/services/player-score-state/player-score-state.service';
import { BONUS_MULTIPLICATOR, ONE_HUNDRED } from '@common/constantes/constantes';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as io from 'socket.io';

@Injectable()
export class ValidateAnswerService {
    playerAnswer: Map<string, Map<string, boolean[]>> = new Map();
    playerAnswerQRL: Map<string, Map<string, string>> = new Map();
    playerScoresQRL: Map<string, Map<string, number>> = new Map();
    playerBonus: Map<string, [string, number]> = new Map();
    isPlayerAnswerSubmitted: Map<string, Map<string, boolean>> = new Map();
    countSameSubmitTime: Map<string, number> = new Map();

    constructor(
        private playerScoreService: PlayerScoreStateService,
        private eventEmitter: EventEmitter2,
    ) {}

    initializePlayerAnswer(roomId: string, players: Map<io.Socket, string>) {
        if (!this.playerAnswer.has(roomId)) {
            this.playerAnswer.set(roomId, new Map());
            this.playerAnswerQRL.set(roomId, new Map());
            this.playerScoresQRL.set(roomId, new Map());
            this.isPlayerAnswerSubmitted.set(roomId, new Map());
            const playerAnswers = this.playerAnswer.get(roomId);
            const playerAnswersQRL = this.playerAnswerQRL.get(roomId);
            const playerAnswerSubmit = this.isPlayerAnswerSubmitted.get(roomId);
            const playerAnswersQRLScores = this.playerScoresQRL.get(roomId);
            players.forEach((name) => {
                if (name !== ORGANISATOR) {
                    playerAnswers.set(name, []);
                    playerAnswersQRL.set(name, '');
                    playerAnswersQRLScores.set(name, 1); // to change
                    playerAnswerSubmit.set(name, false);
                }
            });
            this.playerBonus.set(roomId, ['', Infinity]);
            this.countSameSubmitTime.set(roomId, 0);
        }
    }

    clearAnswerLobby(roomId) {
        const playerAnswers = this.playerAnswer.get(roomId);
        const playerAnswersQRL = this.playerAnswerQRL.get(roomId);
        const playerAnswerSubmit = this.isPlayerAnswerSubmitted.get(roomId);
        const playerAnswersQRLScores = this.playerScoresQRL.get(roomId);
        if (playerAnswers) {
            playerAnswers.forEach((value, key) => {
                playerAnswers.set(key, []);
            });
        }
        if (playerAnswersQRL) {
            playerAnswersQRL.forEach((value, key) => {
                playerAnswersQRL.set(key, '');
            });
        }
        if (playerAnswersQRLScores) {
            playerAnswersQRLScores.forEach((value, key) => {
                playerAnswersQRLScores.set(key, 1); // to change
            });
        }
        if (playerAnswerSubmit) {
            playerAnswerSubmit.forEach((value, key) => {
                playerAnswerSubmit.set(key, false);
            });
        }
        this.playerBonus.set(roomId, ['', Infinity]);
        this.countSameSubmitTime.set(roomId, 0);
    }

    verifyEveryPlayerAnswered(roomId: string): boolean {
        let test = true;
        const playerSubmit = this.isPlayerAnswerSubmitted.get(roomId);

        playerSubmit.forEach((value, key) => {
            const status = this.playerScoreService.getPlayerStatus(roomId, key);
            if (!value && status) test = false;
        });
        return test;
    }

    verifyBonusApply(roomId: string, time: number, player: io.Socket) {
        const playerBonusRoom = this.playerBonus.get(roomId);
        const playerName = player.data.username;
        const bestTime = playerBonusRoom[1];
        if (time === Infinity && this.countSameSubmitTime.get(roomId) >= 1) {
            playerBonusRoom[0] = '';
        } else if (time === Infinity && this.countSameSubmitTime.get(roomId) < 1) {
            playerBonusRoom[0] = playerName;
        }
        if (time < bestTime || this.playerAnswer.get(roomId).size === 1 || this.countPlayerNotAnswered(roomId)) {
            playerBonusRoom[1] = time;
            playerBonusRoom[0] = playerName;
        }
    }

    updateSameTimeSubmit(roomId) {
        const count = this.countSameSubmitTime.get(roomId);
        this.countSameSubmitTime.set(roomId, count + 1);
    }

    countPlayerNotAnswered(roomId: string) {
        let count = 0;
        const answerArray = Array.from(this.playerAnswer.get(roomId));
        for (const answer of answerArray) {
            if (JSON.stringify(answer[1]) !== JSON.stringify(new Array(answer[1].length).fill(false))) count = count + 1;
        }
        return count === 1;
    }

    updatePlayerAnswer(roomId: string, playerSocket: io.Socket, playerAnswer: boolean[]) {
        const playerAnswers = this.playerAnswer.get(roomId);
        const playerName = playerSocket.data.username;
        if (playerAnswers) {
            playerAnswers.set(playerName, playerAnswer);
        }
    }

    updatePlayerAnswerQRL(roomId: string, playerSocket: io.Socket, playerAnswer: string) {
        const playerAnswersQRL = this.playerAnswerQRL.get(roomId);
        const playerName = playerSocket.data.username;
        if (playerAnswersQRL) {
            playerAnswersQRL.set(playerName, playerAnswer);
        }
    }

    updateSubmit(roomId: string, playerSocket: io.Socket) {
        const playerName = playerSocket.data.username;
        const playerAnswerSubmit = this.isPlayerAnswerSubmitted.get(roomId);
        if (playerAnswerSubmit) {
            playerAnswerSubmit.set(playerName, true);
        }
    }

    updatePlayerStatus(roomId: string, player: io.Socket) {
        const playerName = player.data.username;
        if (playerName) {
            this.playerScoreService.updatePlayerStatus(roomId, playerName);
        }
    }

    updatePlayerScoreQRL(roomId: string, playerQRLScores: QRLPlayerScore[]) {
        const roomScores = this.playerScoresQRL.get(roomId);
        for (const playerScore of playerQRLScores) {
            roomScores.set(playerScore.player, playerScore.score);
        }
    }

    validatePlayerAnswer(roomId: string, playerName: string, question: CreateQuestionDto): boolean {
        const questionAnswer = this.transformQuestionAnswer(question);
        const playerAnswer = this.playerAnswer.get(roomId).get(playerName);
        return JSON.stringify(playerAnswer) === JSON.stringify(questionAnswer);
    }

    formatPlayerAnswer(roomId: string): number[] {
        const playerAnswer = this.playerAnswer.get(roomId);
        const formatAnswer: number[] = [0, 0, 0, 0];
        playerAnswer.forEach((value) => {
            value.forEach((isSelected, index) => {
                if (isSelected) {
                    formatAnswer[index] += 1;
                }
            });
        });
        return formatAnswer;
    }

    transformQuestionAnswer(question: CreateQuestionDto): boolean[] {
        const questionAnswer: boolean[] = [];
        for (const choice of question.choices) {
            questionAnswer.push(choice.isCorrect);
        }
        return questionAnswer;
    }

    addPointsPlayer(roomId: string, question: CreateQuestionDto) {
        const playerAnswer = this.playerAnswer.get(roomId);
        if (playerAnswer) {
            playerAnswer.forEach((value, key) => {
                if (this.validatePlayerAnswer(roomId, key, question)) {
                    let isBonusPlayer = false;
                    let points = question.points;
                    if (key === this.playerBonus.get(roomId)[0]) {
                        points = points * BONUS_MULTIPLICATOR;
                        isBonusPlayer = true;
                        this.eventEmitter.emit(ChatEvent.BonusPlayer, roomId, key);
                    }
                    const updatePlayer: UpdatePlayerScore = {
                        score: points,
                        isBonus: isBonusPlayer,
                        playerName: key,
                    };
                    this.playerScoreService.updateScoreBoard(roomId, updatePlayer);
                }
            });
        }
    }

    addPointsPlayerQRL(roomId: string, question: CreateQuestionDto) {
        const playerAnswerQRL = this.playerScoresQRL.get(roomId);
        if (playerAnswerQRL) {
            playerAnswerQRL.forEach((value, key) => {
                const isBonusPlayer = false;
                const points = question.points * (value / ONE_HUNDRED);
                const updatePlayer: UpdatePlayerScore = {
                    score: points,
                    isBonus: isBonusPlayer,
                    playerName: key,
                };
                this.playerScoreService.updateScoreBoard(roomId, updatePlayer);
            });
        }
    }

    deletePlayersRoom(roomId: string) {
        this.playerAnswer.delete(roomId);
        this.playerBonus.delete(roomId);
        this.isPlayerAnswerSubmitted.delete(roomId);
    }

    getPlayerAnswersQRL(roomid: string) {
        const answers = Array.from(this.playerAnswerQRL.get(roomid));
        return answers;
    }
}
