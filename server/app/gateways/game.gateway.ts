/* eslint-disable prettier/prettier */
import { CreateQuestionDto } from '@app/model/dto/game/create-question.dto';
import { PlayerScore, QRLPlayerScore } from '@app/model/interfaces/interfaces';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { MAX_ROOM_ID } from '@common/constantes/constantes';
import { GameEvent } from '@common/enum/game.gateway.events';
import { ChartData } from '@common/interfaces/chartData';
import { PlayerResult } from '@common/interfaces/playerResult';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private gameStateService: GameStateService,
        private roomManagerService: RoomManagerService,
    ) {
        this.logger.log('Websocket GameGateway initialized');
    }

    @SubscribeMessage(GameEvent.StartGame)
    onStartGame(@MessageBody() body) {
        this.logger.log('Côté serveur : startGame');
        this.gameStateService.startGame(body.roomID);
    }

    @SubscribeMessage(GameEvent.StartTestGame)
    onStartTestGame(@MessageBody() body, @ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : startTestGame');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.roomManagerService.createTestRoom(client, roomId);
        const map = new Map();
        map.set(client, 'testeur');
        this.gameStateService.initializeGameState(roomId, body, map, true);
        this.gameStateService.startGame(roomId);
    }

    @SubscribeMessage(GameEvent.OrganisatorLeft)
    onOrganisatorLeft(@ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : organisatorLeft');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.server.to(roomId).emit(GameEvent.OrgLeft);
        this.roomManagerService.clearRoom(roomId);
        this.gameStateService.deleteGameRoom(roomId);
    }

    @SubscribeMessage(GameEvent.NextQuestion)
    onChangeQuestion(@ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : nextQuestion');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.server.to(client.id).emit(GameEvent.ResetStates);
        const game = this.gameStateService.getGameRoom(roomId);
        if(!this.gameStateService.isQrl(game)) this.gameStateService.finishTimer(roomId);
        this.gameStateService.startTransitionQuestion(roomId);
        this.changeTopBar(roomId);
    }

    @SubscribeMessage(GameEvent.ShowResult)
    async onShowResult(@ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : showResult');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        const gameResult = this.gameStateService.getFinalResult(roomId);
        this.server.to(roomId).emit(GameEvent.GameResult, JSON.stringify(gameResult));
        this.server.to(roomId).emit(GameEvent.RoutePlayerResult);
        await this.gameStateService.createRecord(roomId);
        this.gameStateService.deleteGameRoom(roomId);
    }

    @SubscribeMessage(GameEvent.PlayerAnswer)
    onPlayerAnswer(@MessageBody() body: boolean[], @ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : playerAnswer');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        const timeSubmit = Date.now();
        const name = this.roomManagerService.getNameBySocket(client);
        this.server.to(roomId).emit(GameEvent.SubmitForColor, name);
        this.gameStateService.updatePlayerAnswerRoom(roomId, client, body, timeSubmit);
    }

    @SubscribeMessage(GameEvent.PlayerAnswerQRL)
    onPlayerAnswerQRL(@MessageBody() body: string, @ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : playerAnswerQRL');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        const name = this.roomManagerService.getNameBySocket(client);
        this.server.to(roomId).emit(GameEvent.SubmitForColor, name);
        this.gameStateService.updatePlayerAnswerRoomQRL(roomId, client, body);
    }

    @SubscribeMessage(GameEvent.PlayerAnswerTest)
    onPlayerAnswerTest(@MessageBody() body: boolean[], @ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : playerAnswerTest');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        const timeSubmit = Date.now();
        let name = this.roomManagerService.getNameBySocket(client);
        if (name === 'Organisateur') name = 'testeur';
        this.server.to(roomId).emit(GameEvent.SubmitForColor, name);
        this.gameStateService.updatePlayerAnswerRoom(roomId, client, body, timeSubmit);
    }

    @SubscribeMessage(GameEvent.PlayerAnswerNoSubmit)
    playerAnswerNoSubmit(@MessageBody() body: boolean[], @ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : playerAnswerNoSubmit');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        const time = Infinity;
        const name = this.roomManagerService.getNameBySocket(client);
        this.server.to(roomId).emit(GameEvent.SubmitForColor, name);
        this.gameStateService.updatePlayerAnswerRoom(roomId, client, body, time);
    }

    @SubscribeMessage(GameEvent.JoinTestRoom)
    onJoinTestRoom(@ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : joinTestRoom');
        const testRoomID = Math.floor(Math.random() * MAX_ROOM_ID);
        const room = 'test' + testRoomID.toString();
        this.logger.log(room);
        client.join(room);
    }

    @SubscribeMessage(GameEvent.LeaveTestRoom)
    onLeaveTestRoom(@ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : leaveTestRoom');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        client.leave(roomId);
        this.gameStateService.deleteGameRoom(roomId);
    }

    @SubscribeMessage(GameEvent.SubmitTestRoom)
    onsubmitTestRoom(@ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : submitTestRoom');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.gameStateService.finishTimer(roomId);
    }

    @SubscribeMessage(GameEvent.SelectChoice)
    onSelectChoice(@MessageBody() body: boolean[], @ConnectedSocket() client: Socket) {
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        let name = this.roomManagerService.getNameBySocket(client);
        if (name === 'Organisateur') name = 'testeur';
        this.server.to(roomId).emit(GameEvent.UpdateColor, name);
        this.gameStateService.onlyUpdatePlayerChoice(roomId, client, body);
    }

    @SubscribeMessage(GameEvent.PlayerAbandon)
    onPlayerAbandon(@ConnectedSocket() client: Socket) {
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.gameStateService.playerAbandonGame(roomId, client);
        this.roomManagerService.abandonRemoveSocket(roomId, client);
    }

    @SubscribeMessage(GameEvent.PlayerLeft)
    onPlayerLeft(@ConnectedSocket() client: Socket) {
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        client.leave(roomId);
    }

    @SubscribeMessage(GameEvent.pauseTimer)
    onPauseTimer(@ConnectedSocket() client: Socket) {
        const roomid = this.roomManagerService.getRoomidBySocket(client);
        this.gameStateService.pauseTimer(roomid);
    }

    @SubscribeMessage(GameEvent.resumeTimer)
    onResumeTimer(@ConnectedSocket() client: Socket) {
        const roomid = this.roomManagerService.getRoomidBySocket(client);
        this.gameStateService.resumeTimer(roomid);
    }

    @SubscribeMessage(GameEvent.panicMode)
    enablePanic(@ConnectedSocket() client: Socket) {
        const roomid = this.roomManagerService.getRoomidBySocket(client);
        this.gameStateService.activatePanic(roomid);
    }

    @SubscribeMessage(GameEvent.askQRLAnswers)
    askQRLAnswers(@ConnectedSocket() client: Socket) {
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        const playerAnswersQRLToSend = this.gameStateService.getQRLAnswers(roomId);
        this.server.to(client.id).emit(GameEvent.askQRLAnswersResponse, playerAnswersQRLToSend);
    }

    @OnEvent(GameEvent.canEnablePanic)
    activatePanic(roomId: string) {
        this.server.to(roomId).emit(GameEvent.canActivatePanicMode);
    }

    @OnEvent(GameEvent.ChangeTopBar)
    changeTopBar(roomID: string) {
        this.server.to(roomID).emit(GameEvent.ChangeTopBar);
    }

    @OnEvent(GameEvent.GiveScore)
    getScoreBoard(roomId: string, scoreboard: Map<string, PlayerScore>) {
        this.logger.log('Côté serveur : giveScore');
        const scoreBoardArray = Array.from(scoreboard);
        this.server.to(roomId).emit(GameEvent.GiveScores, JSON.stringify(scoreBoardArray));
        const game = this.gameStateService.getGameRoom(roomId);
        if (!game.isTest) {
            for (const player of scoreBoardArray) {
                const socketId = this.roomManagerService.getSocketIdByName(roomId, player[0]);
                this.server.to(socketId).emit(GameEvent.GivePlayerScore, JSON.stringify(player[1].score));
            }
        }
    }

    @OnEvent(GameEvent.GiveQuestion)
    getCurrentQuestion(roomId: string, question: CreateQuestionDto, answers?: boolean[]) {
        this.logger.log('Côté serveur : giveQuestion');
        this.server.to(roomId).emit(GameEvent.ResetStates);
        this.server.to(roomId).emit(GameEvent.GiveCurrentQuestion, JSON.stringify(question));
        if(question.type === 'QCM') this.server.to(roomId).emit(GameEvent.GiveCurrentQuestionAnswers, JSON.stringify(answers));
    }


    @OnEvent(GameEvent.GiveStatAnswer)
    getStatAnswer(hostId: string, statAnswer: number[]) {
        this.logger.log('Côté serveur : giveStatAnswer');
        this.server.to(hostId).emit(GameEvent.GiveCurrentStatAnswer, JSON.stringify(statAnswer));
    }

    @OnEvent(GameEvent.TimerDoneClient)
    onTimerDone(roomId: string) {
        this.logger.log('Côté serveur : timerDoneClient');
        this.server.to(roomId).emit(GameEvent.TimerDoneClient);
    }

    @OnEvent(GameEvent.EndGame)
    onGameDone(roomId: string, finalResult: PlayerResult[]) {
        this.logger.log('Côté serveur : endGame');
        this.server.to(roomId).emit(GameEvent.GameResult, JSON.stringify(finalResult));
        this.server.to(roomId).emit(GameEvent.GameDone, roomId);
    }

    @OnEvent(GameEvent.CanChangeQuestion)
    canChangeQuestion(roomId: string) {
        this.logger.log('Côté serveur : canChangeQuestion');
        this.server.to(roomId).emit(GameEvent.CanChangeQuestion);
    }

    @OnEvent(GameEvent.EveryPlayerAnswered)
    everyPlayerAnswered(roomId: string) {
        this.server.to(roomId).emit(GameEvent.EveryPlayerAnswered);
    }

    @OnEvent(GameEvent.GiveTotalQuestion)
    giveTotalQuestion(roomId: string, totalQuestion: number) {
        this.server.to(roomId).emit(GameEvent.GiveTotalQuestion, totalQuestion);
    }

    @OnEvent(GameEvent.SendQRLAnswersToOrg)
    giveOrgQRLAnswers(roomId: string, answers: [string, string][]){
        this.server.to(roomId).emit(GameEvent.SendQRLAnswersToOrg, answers);
    }

    @OnEvent(GameEvent.PlayerAbandon)
    onPlayerAbandonRefresh(client: Socket, roomId: string) {
        this.logger.log('Côté serveur : onPlayerAbandonRefresh');
        this.gameStateService.playerAbandonGame(roomId, client);
        this.roomManagerService.abandonRemoveSocket(roomId, client);
    }

    @OnEvent(GameEvent.OrganisatorLeft)
    onOrganisatorLeftRefresh(roomId: string) {
        this.logger.log('Côté serveur : organisatorLeftRefresh', roomId);
        this.server.to(roomId).emit(GameEvent.OrgLeft);
        this.roomManagerService.clearRoom(roomId);
        this.gameStateService.deleteGameRoom(roomId);
    }

    @SubscribeMessage(GameEvent.SortPlayer)
    sortPlayer(@MessageBody() body: string, @ConnectedSocket() client: Socket) {
        this.server.to(client.id).emit(GameEvent.PlayerListSorted, body);
    }

    @SubscribeMessage(GameEvent.TypeOfSort)
    changeSorting(@MessageBody() data: [string, boolean], @ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : TypeOfSort ', data);
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.server.to(roomId).emit(GameEvent.Sorting, data);
    }

    @SubscribeMessage(GameEvent.giveGraph)
    giveGraph(@MessageBody() data: ChartData[], @ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : giveGraph ');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.server.to(roomId).emit(GameEvent.sendGraphs, JSON.stringify(data));
    }

    @SubscribeMessage(GameEvent.receiveQRLScore)
    updateQRLScores(@MessageBody() scores: QRLPlayerScore[], @ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : receiveQRLScore ');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.gameStateService.updatePlayerScoreQRL(roomId, scores);
        for (const score of scores) {
            const socketId = this.roomManagerService.getSocketIdByName(roomId, score.player);
            this.server.to(socketId).emit(GameEvent.QRLScore, score.score);
        }
    }

    @SubscribeMessage(GameEvent.firstInteractionQRL)
    onFirstInteractionQRL(@ConnectedSocket() client: Socket) {
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        let name = this.roomManagerService.getNameBySocket(client);
        if (name === 'Organisateur') name = 'testeur';
        this.server.to(roomId).emit(GameEvent.UpdateColor, name);
    }

    @SubscribeMessage(GameEvent.playerActive)
    onPlayerActive(@ConnectedSocket() client: Socket) {
        this.logger.log('Côté serveur : PlayerActive ');
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.server.to(roomId).emit(GameEvent.ActivePlayer);
    }

    @SubscribeMessage(GameEvent.playerIdle)
    onPlayerIdle(@ConnectedSocket() client: Socket) {
        const roomId = this.roomManagerService.getRoomidBySocket(client);
        this.server.to(roomId).emit(GameEvent.IdlePlayer);
    }
}
