/* eslint-disable max-lines */
import { RoomService } from '@app/services/room/room.service';
import { dataPlayerJoinStub } from '@app/stubs/data-player-join.stub';
import { serverStubNoStringify, serverStubWithoutRes, serverStubWithoutResAndArgs } from '@app/stubs/server.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { RoomManagerService } from './room-manager.service';

interface DataPlayerJoin {
    roomCode: string;
    username: string;
}

describe('RoomManagerService', () => {
    let roomManagerService: RoomManagerService;
    const roomService = createStubInstance(RoomService);
    let socket: SinonStubbedInstance<Socket>;
    let socket2: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let isGameCodeExistMock;
    let isPlayerBannedMock;
    let isRoomLockedMock;
    let isAdminMock;
    let isPlayerNameNotUniqueMock;
    let isAcceptedMock;
    let deletePlayerMock;
    let updateRoomPlayerMock;
    let emitKickPlayerMock;
    let removeSocketByNameMock;
    let getAllPlayersMock;
    const roomId = 'test';
    const organisator = 'Organisateur';
    const playerName = 'Gregory';

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        socket2 = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomManagerService,
                RoomService,
                {
                    provide: RoomService,
                    useValue: roomService,
                },
                {
                    provide: Socket,
                    useValue: socket,
                },
                {
                    provide: Socket,
                    useValue: socket2,
                },
            ],
        }).compile();

        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
        roomManagerService['server'] = server;

        isGameCodeExistMock = jest.fn();
        isPlayerBannedMock = jest.fn();
        isRoomLockedMock = jest.fn();
        isAdminMock = jest.fn();
        isPlayerNameNotUniqueMock = jest.fn();
        isAcceptedMock = jest.fn();
        deletePlayerMock = jest.fn();
        updateRoomPlayerMock = jest.fn();
        emitKickPlayerMock = jest.fn();
        removeSocketByNameMock = jest.fn();
        getAllPlayersMock = jest.fn();

        jest.spyOn(roomService, 'isGameCodeExist').mockImplementation(isGameCodeExistMock);
        jest.spyOn(roomManagerService, 'isAdminName').mockImplementation(isAdminMock);
        jest.spyOn(roomManagerService, 'isPlayerBanned').mockImplementation(isPlayerBannedMock);
        jest.spyOn(roomManagerService, 'isRoomLocked').mockImplementation(isRoomLockedMock);
        jest.spyOn(roomManagerService, 'isPlayerNameNotUnique').mockImplementation(isPlayerNameNotUniqueMock);
        jest.spyOn(roomManagerService, 'isAccepted').mockImplementation(isAcceptedMock);
        jest.spyOn(roomManagerService, 'deletePlayer').mockImplementation(deletePlayerMock);
        jest.spyOn(roomManagerService, 'updateRoomPlayer').mockImplementation(updateRoomPlayerMock);
        jest.spyOn(roomManagerService, 'emitKickPlayer').mockImplementation(emitKickPlayerMock);
        jest.spyOn(roomManagerService, 'removeSocketByName').mockImplementation(removeSocketByNameMock);
        jest.spyOn(roomManagerService, 'getAllPlayers').mockImplementation(getAllPlayersMock);
    });

    it('should be defined', () => {
        expect(roomManagerService).toBeDefined();
    });

    it('isAdminName() should return true if the given name is organisato ', () => {
        jest.spyOn(roomManagerService, 'isAdminName').mockRestore();
        const res = roomManagerService.isAdminName(organisator);
        expect(res).toBeTruthy();
    });

    it('should make a player quit the lobby on a refresh', () => {
        roomManagerService.ridPlayers.set(roomId, ['test']);
        roomManagerService.ridSocketUsername.set(roomId, new Map([[socket, 'test']]));
        roomManagerService.playerQuitLobby({ roomCode: roomId, username: 'test' }, server, socket);
        expect(roomManagerService.ridPlayers.get(roomId)).not.toContain('test');
        expect(roomManagerService.ridSocketUsername.get(roomId)).not.toContain(socket);
        expect(updateRoomPlayerMock).toHaveBeenCalled();
    });

    it('playerQuitLobby() do nothing if the player array is not defined and not throw an error', () => {
        let error = null;
        try {
            roomManagerService.playerQuitLobby({ roomCode: roomId, username: 'test' }, server, socket);
        } catch (err) {
            error = err;
        }
        expect(error).toBeNull();
        expect(roomManagerService.ridPlayers.get(roomId)).toBe(undefined);
    });

    it('isAdmin() should return false for any other name than orgasinator', () => {
        const name = 'test';
        const res = roomManagerService.isAdminName(name);
        expect(res).toBeFalsy();
    });

    it('isAdmin() should take into account the case for the name organisator', () => {
        jest.spyOn(roomManagerService, 'isAdminName').mockRestore();
        const res = roomManagerService.isAdminName(organisator);
        expect(res).toBeTruthy();
    });

    it('should return the lock state of the room', () => {
        jest.spyOn(roomManagerService, 'isRoomLocked').mockRestore();
        roomManagerService.ridLocked.set(roomId, true);
        const res = roomManagerService.isRoomLocked(roomId);
        expect(res).toBeTruthy();
    });

    it('should return the player map ', () => {
        const map = roomManagerService.getMapPlayers();
        expect(map).toBe(roomManagerService.ridSocketUsername);
    });

    it('should check if a player is banned from the lobby and return true if it is', () => {
        jest.spyOn(roomManagerService, 'isPlayerBanned').mockRestore();
        roomManagerService.ridBannedPlayers.set(roomId, ['test']);
        const data = { roomCode: 'test', username: 'test' };
        const res = roomManagerService.isPlayerBanned(roomId, data);
        expect(res).toBeTruthy();
    });

    it('should check if a player is banned from the lobby and return false if it is not', () => {
        jest.spyOn(roomManagerService, 'isPlayerBanned').mockRestore();
        roomManagerService.ridBannedPlayers.set(roomId, ['test']);
        const data = { roomCode: 'test', username: 'hello' };
        const res = roomManagerService.isPlayerBanned(roomId, data);
        expect(res).toBeFalsy();
    });

    it('should check if a player is banned from the lobby and return true if it is and handle case', () => {
        jest.spyOn(roomManagerService, 'isPlayerBanned').mockRestore();
        roomManagerService.ridBannedPlayers.set(roomId, ['test']);
        const data = { roomCode: 'test', username: 'Test' };
        const res = roomManagerService.isPlayerBanned(roomId, data);
        expect(res).toBeTruthy();
    });

    it('should get the socket map of a room', () => {
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        const map = roomManagerService.ridSocketUsername.get(roomId).set(socket, 'salut');
        const res = roomManagerService.getSocketMap(roomId);
        expect(res).toBe(map);
    });

    it('should delete a player from the room', () => {
        jest.spyOn(roomManagerService, 'deletePlayer').mockRestore();
        roomManagerService.ridPlayers.set(roomId, ['test', 'salut']);
        const array = roomManagerService.ridPlayers.get(roomId);
        expect(array.length).toBe(2);
        const playerData: DataPlayerJoin = dataPlayerJoinStub()[0];
        roomManagerService.deletePlayer(playerData);
        expect(array.length).toBe(1);
        expect(array).not.toContain('test');
        expect(array).toContain('salut');
    });

    it('should not delete a player if its not in the room', () => {
        roomManagerService.ridPlayers.set(roomId, ['test', 'salut']);
        const array = roomManagerService.ridPlayers.get(roomId);
        expect(array.length).toBe(2);
        const playerData: DataPlayerJoin = dataPlayerJoinStub()[1];
        roomManagerService.deletePlayer(playerData);
        expect(array.length).toBe(2);
        expect(array).toContain('test');
        expect(array).toContain('salut');
    });

    it('should verify that player name uniqueness and return true if its not unique', () => {
        jest.spyOn(roomManagerService, 'isPlayerNameNotUnique').mockRestore();
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, 'salut');
        const playerData: DataPlayerJoin = dataPlayerJoinStub()[2];
        const res = roomManagerService.isPlayerNameNotUnique(playerData);
        expect(res).toBeTruthy();
    });

    it('should verify that player name uniqueness and return false if its unique', () => {
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, 'salut');
        const playerData: DataPlayerJoin = dataPlayerJoinStub()[3];
        const res = roomManagerService.isPlayerNameNotUnique(playerData);
        expect(res).toBeFalsy();
    });

    it('should remove a player from the room when he quit', () => {
        roomManagerService.abandonRemoveSocket(roomId, socket);
        expect(socket.leave.calledOnce).toBeTruthy();
    });

    it('should clear a room of all the player', () => {
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, 'salut');
        roomManagerService.ridSocketUsername.get(roomId).set(socket2, 'gab');
        stub(socket, 'rooms').value(new Set([roomId]));
        stub(socket2, 'rooms').value(new Set([roomId]));
        const map = roomManagerService.ridSocketUsername.get(roomId);
        expect(map.size).toBe(2);
        roomManagerService.clearRoom(roomId);
        expect(map.size).toBe(0);
    });

    it('should update the player list in the room', () => {
        jest.spyOn(roomManagerService, 'updateRoomPlayer').mockRestore();
        roomManagerService.ridPlayers.set(roomId, ['test']);
        const data = dataPlayerJoinStub()[0];

        serverStubNoStringify(server, roomId, 'UpdateRoomPlayer', roomManagerService.ridPlayers.get(roomId));
        roomManagerService.updateRoomPlayer(server, data);
    });

    it('should add a player to the ban list and emit the kick event', () => {
        jest.spyOn(roomManagerService, 'emitKickPlayer').mockRestore();
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, 'salut');
        const data = dataPlayerJoinStub()[2];
        roomManagerService.ridBannedPlayers.set(roomId, []);
        const banPlayers = roomManagerService.ridBannedPlayers.get(roomId);
        expect(banPlayers.length).toBe(0);
        serverStubWithoutResAndArgs(server, roomId, 'Kicked');
        roomManagerService.emitKickPlayer(server, data);
        expect(banPlayers.length).toBe(1);
    });

    it('should remove a player from the room', () => {
        const data = dataPlayerJoinStub()[2];

        roomManagerService.removePlayer(socket, server, data);

        expect(deletePlayerMock).toHaveBeenCalledWith(data);
        expect(updateRoomPlayerMock).toHaveBeenCalledWith(server, data);
        expect(emitKickPlayerMock).toHaveBeenCalledWith(server, data);
        expect(removeSocketByNameMock).toHaveBeenCalledWith(data.roomCode, data.username);
        expect(getAllPlayersMock).toHaveBeenCalledWith(socket, server, data.roomCode);
    });

    it('should create a test room', () => {
        expect(roomManagerService.ridSocketUsername.has(roomId)).toBeFalsy();
        socket.data = { username: 'testeur' };
        roomManagerService.createTestRoom(socket, roomId);
        expect(roomManagerService.ridSocketUsername.has(roomId)).toBeTruthy();
        expect(roomManagerService.ridSocketUsername.get(roomId).has(socket)).toBeTruthy();
        expect(roomManagerService.ridSocketUsername.get(roomId).get(socket)).toBe('testeur');
    });

    it('should create a game room', () => {
        const generateRandomUniqueCodeMock = jest.fn().mockReturnValue('test');
        const addGameCodeMock = jest.fn();

        jest.spyOn(roomService, 'generateRandomUniqueCode').mockImplementation(generateRandomUniqueCodeMock);
        jest.spyOn(roomService, 'addGameCode').mockImplementation(addGameCodeMock);
        socket.data = { username: organisator };
        server.to.returns({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emit: (event: string, gameCode: any) => {
                expect(event).toEqual('RoomCreated');
                expect(gameCode).toEqual({ code: 'test', players: [] });
            },
        } as BroadcastOperator<unknown, unknown>);

        roomManagerService.createRoom(socket, server);

        expect(generateRandomUniqueCodeMock).toHaveBeenCalledWith();
        expect(addGameCodeMock).toHaveBeenCalledWith('test');

        expect(roomManagerService.ridBannedPlayers.has('test')).toBeTruthy();
        expect(roomManagerService.ridBannedPlayers.get('test').toString()).toBe([].toString());

        expect(roomManagerService.ridPlayers.has('test')).toBeTruthy();
        expect(roomManagerService.ridPlayers.get('test').toString()).toBe([].toString());

        expect(roomManagerService.ridLocked.has('test')).toBeTruthy();
        expect(roomManagerService.ridLocked.get('test')).toBe(false);

        expect(roomManagerService.ridSocketUsername.has('test')).toBeTruthy();
        expect(roomManagerService.ridSocketUsername.get('test').get(socket)).toBe(organisator);

        expect(roomManagerService.ridSocketRoom.has(socket.id)).toBeTruthy();
        expect(roomManagerService.ridSocketRoom.get(socket.id)).toBe('test');

        expect(roomManagerService.ridNameToId.has('test')).toBeTruthy();

        expect(socket.join.calledOnce).toBeTruthy();
        expect(socket.emit.calledWith('GetRoomID', 'test')).toBeTruthy();
    });

    it('should delete an existing room', () => {
        const clearRoomMock = jest.fn();
        const removeGameCode = jest.fn();
        jest.spyOn(roomManagerService, 'clearRoom').mockImplementation(clearRoomMock);
        jest.spyOn(roomService, 'removeGameCode').mockImplementation(removeGameCode);
        roomManagerService.ridPlayers.set(roomId, ['salut']);
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, 'salut');
        roomManagerService.ridLocked.set(roomId, false);

        expect(roomManagerService.ridPlayers.has(roomId)).toBeTruthy();
        expect(roomManagerService.ridSocketUsername.has(roomId)).toBeTruthy();
        expect(roomManagerService.ridLocked.has(roomId)).toBeTruthy();

        serverStubNoStringify(server, roomId, 'Kicked', roomManagerService.ridPlayers.get('test'));

        roomManagerService.deleteRoom(socket, server, roomId);

        expect(roomManagerService.ridPlayers.has(roomId)).toBeFalsy();
        expect(roomManagerService.ridSocketUsername.has(roomId)).toBeFalsy();
        expect(roomManagerService.ridLocked.has(roomId)).toBeFalsy();

        expect(clearRoomMock).toHaveBeenCalled();
        expect(removeGameCode).toHaveBeenCalled();
    });

    it('should update the map when a player leave the room', () => {
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, 'salut');
        serverStubWithoutRes(server, socket.id, 'RoomLeaved');
        serverStubNoStringify(server, roomId, 'UpdateRoomPlayer', roomManagerService.ridPlayers.get(roomId));
        roomManagerService.leaveRoom(socket, server, roomId);

        expect(socket.leave.calledOnce).toBeTruthy();
        expect(roomManagerService.ridSocketUsername.get(roomId).size).toBe(0);
        expect(deletePlayerMock).toHaveBeenCalled();
    });

    it('should let you join the game if you pass all the requirement', () => {
        isGameCodeExistMock.mockReturnValue(true);
        isPlayerBannedMock.mockReturnValue(false);
        isRoomLockedMock.mockReturnValue(false);
        isAdminMock.mockReturnValue(false);
        isPlayerNameNotUniqueMock.mockReturnValue(false);

        const data = dataPlayerJoinStub()[2];

        roomManagerService.ridSocketUsername.set(data.roomCode, new Map());

        roomManagerService.joinGame(socket, server, data);

        expect(isGameCodeExistMock).toHaveBeenCalledWith(data.roomCode.trim());
        expect(isPlayerBannedMock).toHaveBeenCalledWith(data.roomCode, data);
        expect(isRoomLockedMock).toHaveBeenCalledWith(data.roomCode);
        expect(isAdminMock).toHaveBeenCalledWith(data.username);
        expect(isPlayerNameNotUniqueMock).toHaveBeenCalledWith(data);

        expect(isAcceptedMock).toHaveBeenCalledWith(socket, server, data);
        expect(socket.emit.calledWith('ErrorMessage', '')).toBeTruthy();
    });

    it("shouldn't let you join the game if your name is empty", () => {
        isGameCodeExistMock.mockReturnValue(true);
        isPlayerBannedMock.mockReturnValue(false);
        isRoomLockedMock.mockReturnValue(false);
        isAdminMock.mockReturnValue(false);
        isPlayerNameNotUniqueMock.mockReturnValue(false);

        const data = {
            roomCode: 'test',
            username: '',
        };

        roomManagerService.ridSocketUsername.set(data.roomCode, new Map());

        roomManagerService.joinGame(socket, server, data);

        expect(isGameCodeExistMock).toHaveBeenCalledWith(data.roomCode.trim());
        expect(isPlayerBannedMock).toHaveBeenCalledWith(data.roomCode, data);
        expect(isRoomLockedMock).toHaveBeenCalledWith(data.roomCode);
        expect(isAdminMock).toHaveBeenCalledWith(data.username);
        expect(isPlayerNameNotUniqueMock).toHaveBeenCalledWith(data);

        expect(socket.emit.calledWith('ErrorMessage', '\n Veuillez entrer un nom')).toBeTruthy();
        expect(socket.emit.calledWith('JoinRoom', false)).toBeTruthy();
    });

    it('should not let you join if the game does not exist', () => {
        isGameCodeExistMock.mockReturnValue(false);

        const data = dataPlayerJoinStub()[2];

        roomManagerService.joinGame(socket, server, data);

        expect(isGameCodeExistMock).toHaveBeenCalledWith(data.roomCode.trim());
        expect(isAcceptedMock).not.toHaveBeenCalledWith(socket, server, data);
        expect(socket.emit.calledWith('ErrorMessage', "\n La salle n'existe pas ou le champ est vide")).toBeTruthy();
        expect(socket.emit.calledWith('JoinRoom', false)).toBeTruthy();
    });

    it('should not let you join if the player is ban from the game', () => {
        isGameCodeExistMock.mockReturnValue(true);
        isPlayerBannedMock.mockReturnValue(true);

        const data = dataPlayerJoinStub()[2];
        roomManagerService.joinGame(socket, server, data);

        expect(isGameCodeExistMock).toHaveBeenCalledWith(data.roomCode.trim());
        expect(isPlayerBannedMock).toHaveBeenCalledWith(data.roomCode, data);

        expect(isAcceptedMock).not.toHaveBeenCalledWith(socket, server, data);
        expect(socket.emit.calledWith('ErrorMessage', 'Joueur banni')).toBeTruthy();
        expect(socket.emit.calledWith('JoinRoom', false)).toBeTruthy();
    });

    it('should not let you join if the room is locked', () => {
        isGameCodeExistMock.mockReturnValue(true);
        isPlayerBannedMock.mockReturnValue(false);
        isRoomLockedMock.mockReturnValue(true);

        const data = dataPlayerJoinStub()[2];

        roomManagerService.joinGame(socket, server, data);

        expect(isGameCodeExistMock).toHaveBeenCalledWith(data.roomCode.trim());
        expect(isPlayerBannedMock).toHaveBeenCalledWith(data.roomCode, data);
        expect(isRoomLockedMock).toHaveBeenCalledWith(data.roomCode);

        expect(isAcceptedMock).not.toHaveBeenCalledWith(socket, server, data);
        expect(socket.emit.calledWith('ErrorMessage', '\n Salle vérouillée')).toBeTruthy();
        expect(socket.emit.calledWith('JoinRoom', false)).toBeTruthy();
    });

    it('should not let you choose the admin name', () => {
        isGameCodeExistMock.mockReturnValue(true);
        isPlayerBannedMock.mockReturnValue(false);
        isRoomLockedMock.mockReturnValue(false);
        isAdminMock.mockReturnValue(true);

        const data = dataPlayerJoinStub()[2];
        roomManagerService.joinGame(socket, server, data);

        expect(isGameCodeExistMock).toHaveBeenCalledWith(data.roomCode.trim());
        expect(isPlayerBannedMock).toHaveBeenCalledWith(data.roomCode, data);
        expect(isRoomLockedMock).toHaveBeenCalledWith(data.roomCode);
        expect(isAdminMock).toHaveBeenCalledWith(data.username);

        expect(isAcceptedMock).not.toHaveBeenCalledWith(socket, server, data);
        expect(socket.emit.calledWith('ErrorMessage', '\n Nom "Organisateur" interdit')).toBeTruthy();
        expect(socket.emit.calledWith('JoinRoom', false)).toBeTruthy();
    });

    it('should not let you enter the room if the name exist already', () => {
        isGameCodeExistMock.mockReturnValue(true);
        isPlayerBannedMock.mockReturnValue(false);
        isRoomLockedMock.mockReturnValue(false);
        isAdminMock.mockReturnValue(false);
        isPlayerNameNotUniqueMock.mockReturnValue(true);

        const data = dataPlayerJoinStub()[2];
        roomManagerService.ridSocketUsername.set('test', new Map());

        roomManagerService.joinGame(socket, server, data);

        expect(isGameCodeExistMock).toHaveBeenCalledWith(data.roomCode.trim());
        expect(isPlayerBannedMock).toHaveBeenCalledWith(data.roomCode, data);
        expect(isRoomLockedMock).toHaveBeenCalledWith(data.roomCode);
        expect(isAdminMock).toHaveBeenCalledWith(data.username);
        expect(isPlayerNameNotUniqueMock).toHaveBeenCalledWith(data);

        expect(isAcceptedMock).not.toHaveBeenCalledWith(socket, server, data);
        expect(socket.emit.calledWith('ErrorMessage', '\n Nom déjà existant')).toBeTruthy();
        expect(socket.emit.calledWith('JoinRoom', false)).toBeTruthy();
    });

    it('should lock the room if its unlocked', () => {
        roomManagerService.ridLocked.set(roomId, false);
        serverStubNoStringify(server, roomId, 'RoomStateChanged', true);

        expect(roomManagerService.ridLocked.get(roomId)).toBe(false);
        roomManagerService.lockRoom(socket, server, roomId);
        expect(roomManagerService.ridLocked.get(roomId)).toBe(true);
        expect(getAllPlayersMock).toHaveBeenCalledWith(socket, server, roomId);
    });

    it('should unlock the room if its locked', () => {
        roomManagerService.ridLocked.set(roomId, true);
        serverStubNoStringify(server, roomId, 'RoomStateChanged', false);

        expect(roomManagerService.ridLocked.get(roomId)).toBe(true);
        roomManagerService.lockRoom(socket, server, roomId);
        expect(roomManagerService.ridLocked.get(roomId)).toBe(false);
        expect(getAllPlayersMock).toHaveBeenCalledWith(socket, server, roomId);
    });

    it('should get all the players from a room', () => {
        jest.spyOn(roomManagerService, 'getAllPlayers').mockRestore();
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, 'salut');
        roomManagerService.ridSocketUsername.get(roomId).set(socket2, 'bonjour');
        serverStubNoStringify(server, socket.id, 'SocketList', [
            {
                socketId: socket.id,
                playername: 'salut',
            },
            {
                socketId: socket2.id,
                playername: 'bonjour',
            },
        ]);
        roomManagerService.getAllPlayers(socket, server, roomId);
    });

    it('should create the player in the lobby if he is accepted', () => {
        jest.spyOn(roomManagerService, 'isAccepted').mockRestore();
        const data = dataPlayerJoinStub()[4];
        socket.data = { username: 'bidon' };
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridPlayers.set(roomId, []);
        roomManagerService.ridNameToId.set(roomId, new Map());
        expect(roomManagerService.ridSocketUsername.has(roomId)).toBeTruthy();
        expect(roomManagerService.ridPlayers.has(roomId)).toBeTruthy();

        roomManagerService.isAccepted(socket, server, data);

        expect(roomManagerService.ridSocketRoom.has(socket.id)).toBeTruthy();
        expect(roomManagerService.ridSocketRoom.get(socket.id)).toBe(roomId);

        expect(roomManagerService.ridNameToId.has(roomId)).toBeTruthy();
        expect(roomManagerService.ridNameToId.get(roomId).has(data.username)).toBeTruthy();
        expect(roomManagerService.ridNameToId.get(roomId).get(data.username)).toBe(socket.id);

        expect(socket.emit.calledWith('JoinRoom', true)).toBeTruthy();
        expect(socket.join.calledOnce).toBeTruthy();
        expect(roomManagerService.ridSocketUsername.get(roomId).has(socket)).toBeTruthy();
        expect(updateRoomPlayerMock).toHaveBeenCalledWith(server, data);
    });

    it('should remove a socket from the room and the map by the name of the player', () => {
        jest.spyOn(roomManagerService, 'removeSocketByName').mockRestore();
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, playerName);

        roomManagerService.removeSocketByName(roomId, playerName);

        expect(roomManagerService.ridSocketUsername.get(roomId).has(socket)).toBeFalsy();
        expect(roomManagerService.ridSocketUsername.get(roomId).size).toBe(0);
    });

    it('should return the correct roomId by socket', () => {
        stub(socket, 'rooms').value(new Set([socket.id, roomId]));
        const result = roomManagerService.getRoomidBySocket(socket);
        expect(result).toBe(roomId);
    });

    it('should give empty string if the socket has not join a room', () => {
        stub(socket, 'rooms').value(undefined);
        const result = roomManagerService.getRoomidBySocket(socket);
        expect(result).toEqual('');
    });

    it('should return the correct name by socket', () => {
        roomManagerService.ridSocketUsername.set(roomId, new Map());
        roomManagerService.ridSocketUsername.get(roomId).set(socket, playerName);
        jest.spyOn(roomManagerService, 'getRoomidBySocket').mockReturnValue(roomId);

        const result = roomManagerService.getNameBySocket(socket);

        expect(result).toBe(playerName);
    });

    it('should getRoomIdBySocketId() return the roomId given the socket id', () => {
        const socketId = '123';
        roomManagerService.ridSocketRoom.set(socketId, roomId);
        const res = roomManagerService.getRoomIdBySocketId(socketId);
        expect(res).toBe(roomId);
    });

    it('should getSocketIdByName() retunr the socket id given the player name', () => {
        roomManagerService.ridNameToId.set(roomId, new Map([['bidon', '123']]));
        const res = roomManagerService.getSocketIdByName(roomId, 'bidon');
        expect(res).toBe('123');
    });
});
