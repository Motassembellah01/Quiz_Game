import { ORGANISATOR } from '@app/model/constants';
import { DataPlayerJoin } from '@app/model/interfaces/interfaces';
import { RoomService } from '@app/services/room/room.service';
import { OUT_OF_INDEX, PLAYER_NOT_FOUND } from '@common/constantes/constantes';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as io from 'socket.io';

@Injectable()
export class RoomManagerService {
    ridBannedPlayers: Map<string, string[]> = new Map();
    ridPlayers: Map<string, string[]> = new Map();
    ridLocked: Map<string, boolean> = new Map();
    ridSocketUsername: Map<string, Map<io.Socket, string>> = new Map();
    ridSocketRoom: Map<string, string> = new Map();
    ridNameToId: Map<string, Map<string, string>> = new Map();

    constructor(private roomService: RoomService) {}

    @OnEvent(RoomEvent.RemovePlayerRoom)
    clearRoom(roomId: string) {
        if (this.ridSocketUsername && this.ridSocketUsername.get(roomId)) {
            this.ridSocketUsername.get(roomId).forEach((name, socket) => {
                socket.leave(roomId);
            });
            this.ridSocketUsername.get(roomId).clear();
        }
    }

    playerQuitLobby(data: DataPlayerJoin, server: io.Server, socket: io.Socket) {
        const players = this.ridPlayers.get(data.roomCode);

        if (!players) {
            return;
        }

        const index = players.indexOf(data.username);

        if (index !== PLAYER_NOT_FOUND) {
            players.splice(index, 1);

            this.ridPlayers.set(data.roomCode, players);

            this.ridSocketUsername.get(data.roomCode).delete(socket);
            this.updateRoomPlayer(server, data);
        }
    }

    getRoomIdBySocketId(socketId: string) {
        return this.ridSocketRoom.get(socketId);
    }

    getSocketIdByName(roomId: string, username: string) {
        return this.ridNameToId.get(roomId).get(username);
    }

    abandonRemoveSocket(roomId: string, socket: io.Socket) {
        socket.leave(roomId);
    }

    removeSocketByName(roomId: string, playerName: string) {
        let socketDelete: io.Socket;
        this.ridSocketUsername.get(roomId).forEach((name, socket) => {
            if (name === playerName) {
                socket.leave(roomId);
                socketDelete = socket;
            }
        });
        this.ridSocketUsername.get(roomId).delete(socketDelete);
    }

    createRoom(socket: io.Socket, server: io.Server) {
        const gameRoom = {
            code: this.roomService.generateRandomUniqueCode(),
            players: [],
        };

        this.roomService.addGameCode(gameRoom.code);

        this.ridSocketUsername.set(gameRoom.code, new Map());
        this.ridPlayers.set(gameRoom.code, []);
        this.ridBannedPlayers.set(gameRoom.code, []);
        this.ridLocked.set(gameRoom.code, false);

        server.to(socket.id).emit(RoomEvent.RoomCreated, gameRoom);
        socket.emit(RoomEvent.GetRoomID, gameRoom.code);
        this.ridSocketUsername.get(gameRoom.code).set(socket, ORGANISATOR);
        this.ridSocketRoom.set(socket.id, gameRoom.code);
        this.ridNameToId.set(gameRoom.code, new Map());
        socket.data.username = ORGANISATOR;
        socket.join(gameRoom.code);
    }

    createTestRoom(socket: io.Socket, roomId: string) {
        this.ridSocketUsername.set(roomId, new Map());
        this.ridSocketUsername.get(roomId).set(socket, 'testeur');
        socket.data.username = 'testeur';
    }

    deleteRoom(socket: io.Socket, server: io.Server, roomID: string) {
        server.to(roomID).emit(RoomEvent.Kicked, this.ridPlayers.get(roomID));
        this.clearRoom(roomID);
        this.ridPlayers.delete(roomID);
        this.ridSocketUsername.delete(roomID);
        this.ridLocked.delete(roomID);
        this.roomService.removeGameCode(roomID);
    }

    leaveRoom(socket: io.Socket, server: io.Server, roomId: string) {
        const socketMap = this.ridSocketUsername.get(roomId);
        const playerName = socketMap.get(socket);
        socket.leave(roomId);
        this.ridSocketUsername.get(roomId).delete(socket);
        this.deletePlayer({ roomCode: roomId, username: playerName });
        server.to(socket.id).emit(RoomEvent.RoomLeaved);
        server.to(roomId).emit(RoomEvent.UpdateRoomPlayer, this.ridPlayers.get(roomId));
    }

    joinGame(socket: io.Socket, server: io.Server, data: DataPlayerJoin) {
        let errorMessage = '';
        let isAccepted = true;

        if (!this.roomService.isGameCodeExist(data.roomCode.trim())) {
            errorMessage = "\n La salle n'existe pas ou le champ est vide";
            isAccepted = false;
        } else if (this.isPlayerBanned(data.roomCode, data)) {
            isAccepted = false;
            errorMessage = 'Joueur banni';
        } else if (this.isRoomLocked(data.roomCode)) {
            isAccepted = false;
            errorMessage += '\n Salle vérouillée';
        } else if (this.isAdminName(data.username)) {
            isAccepted = false;
            errorMessage += '\n Nom "Organisateur" interdit';
        } else if (this.ridSocketUsername.has(data.roomCode) && this.isPlayerNameNotUnique(data)) {
            isAccepted = false;
            errorMessage += '\n Nom déjà existant';
        } else if (data.username.trim() === '') {
            isAccepted = false;
            errorMessage += '\n Veuillez entrer un nom';
        }

        socket.emit(RoomEvent.ErrorMessage, errorMessage);
        if (isAccepted) this.isAccepted(socket, server, data);
        else socket.emit(RoomEvent.JoinRoom, false);
    }

    isPlayerBanned(roomId: string, data: DataPlayerJoin): boolean {
        if (this.ridBannedPlayers.get(roomId)) {
            for (const name of this.ridBannedPlayers.get(roomId)) {
                if (data.username.toLowerCase() === name.toLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    }

    isPlayerNameNotUnique(data: DataPlayerJoin): boolean {
        let isUniqueName = false;

        this.ridSocketUsername.get(data.roomCode).forEach((playerName) => {
            if (playerName.toLowerCase() === data.username.toLowerCase()) {
                isUniqueName = true;
                return isUniqueName;
            }
        });
        return isUniqueName;
    }

    lockRoom(socket: io.Socket, server: io.Server, roomCode: string) {
        this.ridLocked.set(roomCode, !this.ridLocked.get(roomCode));
        const roomState = this.ridLocked.get(roomCode);
        server.to(roomCode).emit(RoomEvent.RoomStateChanged, roomState);
        this.getAllPlayers(socket, server, roomCode);
    }

    getAllPlayers(socket: io.Socket, server: io.Server, roomCode: string) {
        if (this.ridSocketUsername.get(roomCode)) {
            const serializedData = Array.from(this.ridSocketUsername.get(roomCode)).map(([socketID, name]) => ({
                socketId: socketID.id,
                playername: name,
            }));
            server.to(socket.id).emit(RoomEvent.SocketList, serializedData);
        }
    }

    getSocketMap(roomId: string): Map<io.Socket, string> {
        return this.ridSocketUsername.get(roomId);
    }

    removePlayer(socket: io.Socket, server: io.Server, data: DataPlayerJoin) {
        this.deletePlayer(data);
        this.updateRoomPlayer(server, data);
        this.emitKickPlayer(server, data);
        this.removeSocketByName(data.roomCode, data.username);
        this.getAllPlayers(socket, server, data.roomCode);
    }

    getMapPlayers(): Map<string, Map<io.Socket, string>> {
        return this.ridSocketUsername;
    }

    getRoomidBySocket(socket: io.Socket): string {
        if (socket.rooms) return Array.from(socket.rooms)[1];
        else {
            return '';
        }
    }

    getNameBySocket(socket: io.Socket): string {
        const roomId = this.getRoomidBySocket(socket);
        let theName = '';
        this.ridSocketUsername.get(roomId).forEach((name, socketId) => {
            if (socketId === socket) {
                theName = name;
            }
        });

        return theName;
    }

    isAccepted(socket: io.Socket, server: io.Server, data: DataPlayerJoin) {
        this.ridSocketUsername.get(data.roomCode).set(socket, data.username);
        this.ridPlayers.get(data.roomCode).push(data.username);
        socket.emit(RoomEvent.JoinRoom, true);
        this.ridSocketRoom.set(socket.id, data.roomCode);
        this.ridNameToId.get(data.roomCode).set(data.username, socket.id);
        socket.join(data.roomCode);
        socket.data.username = data.username;
        this.updateRoomPlayer(server, data);
    }

    emitKickPlayer(server: io.Server, data: DataPlayerJoin) {
        this.ridSocketUsername.get(data.roomCode).forEach((name, theSocket) => {
            if (name === data.username) {
                this.ridBannedPlayers.get(data.roomCode).push(data.username);
                server.to(theSocket.id).emit(RoomEvent.Kicked);
            }
        });
    }

    deletePlayer(data: DataPlayerJoin) {
        if (this.ridPlayers.has(data.roomCode)) {
            const playerList = this.ridPlayers.get(data.roomCode);
            if (playerList) {
                const index = playerList.indexOf(data.username);
                if (index !== OUT_OF_INDEX) {
                    playerList.splice(index, 1);
                }
            }
            this.ridPlayers.set(data.roomCode, playerList);
        }
    }

    isRoomLocked(roomCode: string): boolean {
        return this.ridLocked.get(roomCode);
    }

    isAdminName(username: string): boolean {
        return username.toLowerCase() === 'organisateur';
    }

    updateRoomPlayer(server: io.Server, data: DataPlayerJoin) {
        server.to(data.roomCode).emit(RoomEvent.UpdateRoomPlayer, this.ridPlayers.get(data.roomCode));
    }
}
