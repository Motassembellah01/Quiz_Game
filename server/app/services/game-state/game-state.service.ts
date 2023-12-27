/* eslint-disable max-params */
// le service a besoin de tous ses services pour opérer et gérer l'état du jeu.
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/game/create-question.dto';
import { RecordDto } from '@app/model/dto/record.dto';
import { GameState, QRLPlayerScore } from '@app/model/interfaces/interfaces';
import { PlayerScoreStateService } from '@app/services/player-score-state/player-score-state.service';
import { RecordService } from '@app/services/record/record.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ValidateAnswerService } from '@app/services/validate-answer/validate-answer.service';
import { FIVE_SECOND_TIMER, ONE_SECOND_DELAY, THREE_SECOND_DELAY, THREE_SECOND_TIMER, TIMER_TIME_QRL } from '@common/constantes/constantes';
import { GameEvent } from '@common/enum/game.gateway.events';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { TimerEvent, TimerState } from '@common/enum/timer.gateway.events';
import { PlayerResult } from '@common/interfaces/playerResult';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as io from 'socket.io';

@Injectable()
export class GameStateService {
    gamesState: Map<string, GameState> = new Map();

    // le service a besoin de tous ses services pour opérer et gérer l'état du jeu.
    // eslint-disable-next-line max-params
    constructor(
        private playerScoreService: PlayerScoreStateService,
        private validateAnswerService: ValidateAnswerService,
        private timerService: TimerService,
        private eventEmitter: EventEmitter2,
        private recordService: RecordService,
    ) {}

    @OnEvent(TimerEvent.OrgChangeQuestion)
    @OnEvent(TimerEvent.TimerDone)
    async changeQuestionRoom(roomId: string) {
        const game = this.gamesState.get(roomId);
        if (!game.isTest) this.eventEmitter.emit(GameEvent.ChangeTopBar, roomId);
        if (game.isTest) {
            await this.testHandler(roomId, game.currentQuestion);
        }
        this.getStatAnswer(roomId);
        this.changeQuestion(roomId, game);
    }

    @OnEvent(GameEvent.canActivatePanicMode)
    verifyPanicModeQCM(roomId: string, mode: string) {
        const game = this.getGameRoom(roomId);
        if (game.currentQuestion.type === 'QCM' && mode === 'QCM') {
            this.eventEmitter.emit(GameEvent.canEnablePanic, roomId);
        } else if (game.currentQuestion.type === 'QRL' && mode === 'QRL') {
            this.eventEmitter.emit(GameEvent.canEnablePanic, roomId);
        }
    }

    @OnEvent(TimerEvent.WaitVerify)
    async waitVerify(roomId: string) {
        const game = this.gamesState.get(roomId);
        this.eventEmitter.emit(GameEvent.TimerDoneClient, roomId);
        await this.delay(ONE_SECOND_DELAY);
        if (!this.isQrl(game)) {
            this.validateAnswerService.addPointsPlayer(roomId, game.currentQuestion);
            this.getCurrentScoreBoardRoom(roomId);
            this.eventEmitter.emit(GameEvent.CanChangeQuestion, roomId);
        }
    }

    async onWaitVerifyQCM(roomId: string) {
        const game = this.gamesState.get(roomId);
        this.eventEmitter.emit(GameEvent.TimerDoneClient, roomId);
        await this.delay(ONE_SECOND_DELAY);
        this.validateAnswerService.addPointsPlayer(roomId, game.currentQuestion);
        this.getCurrentScoreBoardRoom(roomId);
        this.eventEmitter.emit(GameEvent.CanChangeQuestion, roomId);
    }

    async onWaitVerifyQRL(roomId: string) {
        const game = this.gamesState.get(roomId);
        await this.delay(ONE_SECOND_DELAY); // to fix for QRL
        this.validateAnswerService.addPointsPlayerQRL(roomId, game.currentQuestion);
        this.getCurrentScoreBoardRoom(roomId);
        this.eventEmitter.emit(GameEvent.CanChangeQuestion, roomId);
    }

    changeQuestion(roomId: string, game: GameState) {
        this.incrementQuestion(game);
        if (!this.isLastQuestion(game)) {
            this.continueGame(roomId, game);
        } else {
            this.finishGame(roomId);
        }
    }

    async testHandler(roomId: string, currentQuestion: CreateQuestionDto) {
        this.eventEmitter.emit(GameEvent.TimerDoneClient, roomId);
        await this.delay(THREE_SECOND_DELAY);
        this.validateAnswerService.addPointsPlayer(roomId, currentQuestion);
        this.getCurrentScoreBoardRoom(roomId);
    }

    continueGame(roomId: string, game: GameState) {
        this.getCurrentQuestionRoom(roomId, game.currentQuestion);
        this.validateAnswerService.clearAnswerLobby(roomId);
        if (game.isTest) {
            this.timerService.setTimerDuration(roomId, this.isQrl(game) ? TIMER_TIME_QRL : game.timeQuestion);
            this.timerService.startTimerRoom(roomId, TimerState.Test);
        } else {
            this.timerService.setTimerDuration(roomId, this.isQrl(game) ? TIMER_TIME_QRL : game.timeQuestion);
            this.timerService.startTimerRoom(roomId, TimerState.Attendre);
        }
    }

    incrementQuestion(game: GameState) {
        game.currentIndex++;
        game.currentQuestion = game.questions[game.currentIndex];
    }

    skipQRL(game: GameState) {
        while (game.currentQuestion && this.isQrl(game)) {
            this.incrementQuestion(game);
        }
    }

    isQrl(game: GameState): boolean {
        return game.currentQuestion.type === 'QRL';
    }

    isLastQuestion(game: GameState): boolean {
        return game.currentIndex === game.questions.length;
    }

    initializeGameState(roomId: string, game: CreateGameDto, players: Map<io.Socket, string>, mode: boolean) {
        const gameQuestions = game.questions;
        const time = game.duration;
        if (!this.gamesState.has(roomId)) {
            const gameState = {
                questions: gameQuestions,
                currentQuestion: gameQuestions[0],
                currentIndex: 0,
                totalquestion: gameQuestions.length,
                timeQuestion: time,
                isTest: mode,
                gameName: game.title,
                startDate: new Date(),
                totalPlayers: players.size - 1,
            };
            this.gamesState.set(roomId, gameState);
            this.playerScoreService.initializeGameScoreBoard(roomId, players);
            this.validateAnswerService.initializePlayerAnswer(roomId, players);
            this.timerService.initializeTimer(roomId);
        }
    }

    finishGame(roomId: string) {
        const finalResult = this.getFinalResult(roomId);
        this.eventEmitter.emit(GameEvent.EndGame, roomId, finalResult);
        this.eventEmitter.emit(RoomEvent.RemovePlayerRoom, roomId);
    }

    getCurrentQuestionRoom(roomId: string, question: CreateQuestionDto) {
        const questionAnswer = this.getCurrentAnswerQuestion(question);
        this.eventEmitter.emit(GameEvent.GiveQuestion, roomId, question, questionAnswer);
    }

    getCurrentAnswerQuestion(question: CreateQuestionDto): boolean[] {
        const answerArray: boolean[] = [];
        if (question.choices) {
            for (const choice of question.choices) {
                answerArray.push(choice.isCorrect);
            }
        }
        return answerArray;
    }

    startGame(roomId: string) {
        const game = this.getGameRoom(roomId);
        this.getCurrentQuestionRoom(roomId, game.currentQuestion);
        this.getCurrentScoreBoardRoom(roomId);

        if (game.isTest) {
            this.timerService.setTimerDuration(roomId, this.isQrl(game) ? TIMER_TIME_QRL : game.timeQuestion);
            this.timerService.startTimerRoom(roomId, TimerState.Test);
        } else {
            this.eventEmitter.emit(GameEvent.GiveTotalQuestion, roomId, game.totalquestion);
            this.timerService.setTimerDuration(roomId, this.isQrl(game) ? TIMER_TIME_QRL : game.timeQuestion);
            this.timerService.startTimerRoom(roomId, TimerState.Attendre);
        }
    }

    finishTimer(roomId: string) {
        if (this.isQrl(this.getGameRoom(roomId))) {
            const playerAnswersQRLToSend = this.validateAnswerService.getPlayerAnswersQRL(roomId);
            this.eventEmitter.emit(GameEvent.SendQRLAnswersToOrg, roomId, playerAnswersQRLToSend);
        }
        this.timerService.finishTimer(roomId);
    }

    startTransitionTimer(roomId: string) {
        this.timerService.setTimerDuration(roomId, FIVE_SECOND_TIMER);
        this.timerService.startTimerRoom(roomId, TimerState.Transition5s);
    }

    startTransitionQuestion(roomId: string) {
        this.timerService.setTimerDuration(roomId, THREE_SECOND_TIMER);
        this.timerService.startTimerRoom(roomId, TimerState.TransitionQuestion);
    }

    pauseTimer(roomId: string) {
        this.timerService.clearTimerRoom(roomId);
    }

    resumeTimer(roomId: string) {
        this.timerService.startTimerRoom(roomId, TimerState.Attendre);
    }

    activatePanic(roomId) {
        this.timerService.activatePanic(roomId);
    }

    updatePlayerAnswerRoom(roomId: string, player: io.Socket, playerAnswer: boolean[], timeRequest: number) {
        const game = this.getGameRoom(roomId);
        this.validateAnswerService.updatePlayerAnswer(roomId, player, playerAnswer);
        if (timeRequest === Infinity) this.validateAnswerService.updateSameTimeSubmit(roomId);
        if (this.validateAnswerService.validatePlayerAnswer(roomId, player.data.username, game.currentQuestion)) {
            this.validateAnswerService.verifyBonusApply(roomId, timeRequest, player);
        }
        this.validateAnswerService.updateSubmit(roomId, player);
        if (this.validateAnswerService.verifyEveryPlayerAnswered(roomId)) {
            this.eventEmitter.emit(GameEvent.EveryPlayerAnswered, roomId);
            this.finishTimer(roomId);
        }
    }

    updatePlayerAnswerRoomQRL(roomId: string, player: io.Socket, playerAnswer: string) {
        this.validateAnswerService.updatePlayerAnswerQRL(roomId, player, playerAnswer);
        this.validateAnswerService.updateSubmit(roomId, player);

        if (this.validateAnswerService.verifyEveryPlayerAnswered(roomId)) {
            this.eventEmitter.emit(GameEvent.EveryPlayerAnswered, roomId);
            this.finishTimer(roomId);
        }
    }

    onlyUpdatePlayerChoice(roomiD: string, player: io.Socket, playerChoices: boolean[]) {
        this.validateAnswerService.updatePlayerAnswer(roomiD, player, playerChoices);
        this.getStatAnswer(roomiD);
    }

    updatePlayerScoreQRL(roomId: string, playerScores: QRLPlayerScore[]) {
        this.validateAnswerService.updatePlayerScoreQRL(roomId, playerScores);
        this.onWaitVerifyQRL(roomId);
    }

    playerAbandonGame(roomId: string, player: io.Socket) {
        this.validateAnswerService.updatePlayerStatus(roomId, player);
        this.getCurrentScoreBoardRoom(roomId);

        if (this.validateAnswerService.verifyEveryPlayerAnswered(roomId)) {
            this.eventEmitter.emit(GameEvent.EveryPlayerAnswered, roomId);
            this.finishTimer(roomId);
        }
    }

    addPlayerPoints(roomId: string, question: CreateQuestionDto) {
        this.validateAnswerService.addPointsPlayer(roomId, question);
    }

    getGameRoom(roomId: string): GameState {
        return this.gamesState.get(roomId);
    }

    getStatAnswer(roomId: string) {
        if (!this.isQrl(this.getGameRoom(roomId))) {
            const statAnswer = this.validateAnswerService.formatPlayerAnswer(roomId);
            this.eventEmitter.emit(GameEvent.GiveStatAnswer, roomId, statAnswer);
        }
    }

    getCurrentScoreBoardRoom(roomId: string) {
        const scoreboard = this.playerScoreService.getCurrentScoreBoard(roomId);
        this.eventEmitter.emit(GameEvent.GiveScore, roomId, scoreboard);
    }

    getFinalResult(roomId: string): PlayerResult[] {
        return this.playerScoreService.returnFinalResult(roomId);
    }

    getQRLAnswers(roomId: string): [string, string][] {
        return this.validateAnswerService.getPlayerAnswersQRL(roomId);
    }

    deleteGameRoom(roomId: string) {
        this.gamesState.delete(roomId);
        this.validateAnswerService.deletePlayersRoom(roomId);
        this.playerScoreService.deleteScoreRoom(roomId);
        this.timerService.deleteTimer(roomId);
    }

    async createRecord(roomID) {
        const game = this.getGameRoom(roomID);
        const bestScoreGame = this.playerScoreService.getBestScore(roomID);
        const record: RecordDto = {
            name: game.gameName,
            date: game.startDate.toISOString(),
            totalPlayer: game.totalPlayers,
            bestScore: bestScoreGame,
        };
        await this.recordService.addRecord(record);
    }

    async delay(time: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }
}
