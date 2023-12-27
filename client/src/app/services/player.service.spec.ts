import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';
import { RoomSocketService } from './socket/room-socket.service';
import { GamesService } from './games.service';
import { AuthGameService } from './auth-game.service';
import { of } from 'rxjs';
import { SocketEvents } from '@common/enum/socket.enum';
import { DataPlayerJoin } from '@common/interfaces/game-room';

describe('PlayerService', () => {
    let service: PlayerService;
    let roomSocketService: jasmine.SpyObj<RoomSocketService>;
    let gamesService: jasmine.SpyObj<GamesService>;
    let authGameService: jasmine.SpyObj<AuthGameService>;

    beforeEach(() => {
        gamesService = jasmine.createSpyObj('GamesService', ['getRoomID']);
        roomSocketService = jasmine.createSpyObj('RoomSocketService', ['send', 'getPlayersOfRoom', 'joinRoom']);
        authGameService = jasmine.createSpyObj('AuthGameService', ['getIsConnected', 'resetAllValues']);

        TestBed.configureTestingModule({
            providers: [
                { provide: RoomSocketService, useValue: roomSocketService },
                { provide: GamesService, useValue: gamesService },
                { provide: AuthGameService, useValue: authGameService },
            ],
        });

        service = TestBed.inject(PlayerService);
        gamesService.getRoomID.and.returnValue(of('1234'));
        roomSocketService.getPlayersOfRoom.and.returnValue(of(['player1', 'player2']));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize the roomCode from gameService', () => {
        const mockRoomCode = '1234';

        gamesService.getRoomID.and.returnValue(of(mockRoomCode));

        service = new PlayerService(roomSocketService, gamesService, authGameService);

        expect(service.theRoomCode).toEqual(mockRoomCode);
    });

    it('should create a player', () => {
        service.theRoomCode = '1234';
        const playerName = 'Grégory';
        const playersCountBefore = service.players.length;

        service.createPlayer(playerName);

        expect(service.players.length).toBe(playersCountBefore + 1);
        expect(service.players[playersCountBefore]).toEqual({ roomCode: '1234', username: playerName });
    });

    it('should get players of the room', () => {
        service.getPlayers();

        expect(roomSocketService.getPlayersOfRoom).toHaveBeenCalled();
    });

    it('should return a player by name', () => {
        service.theRoomCode = '1234';
        const playerName = 'Grégory';

        service.createPlayer(playerName);

        const player1 = service.getPlayer(playerName);
        const player2 = service.getPlayer('playerName');

        expect(player1).toEqual({ roomCode: '1234', username: playerName });
        expect(player2).toEqual(null);
    });

    it('should return if a player is ban', () => {
        service.theRoomCode = '1234';
        const playerName1 = 'Grégory';
        const playerName2 = 'Gabriel';
        service.createPlayer(playerName1);
        service.createPlayer(playerName2);

        service.banPlayer({ roomCode: '1234', username: playerName2 });

        const player1 = service.isBanName(playerName1);
        const player2 = service.isBanName(playerName2);

        expect(player1).toBeFalsy();
        expect(player2).toBeTruthy();
    });

    it('should open player details of the selected one and then close', () => {
        service.theRoomCode = '1234';
        const playerName1 = 'Grégory';
        service.createPlayer(playerName1);

        service.openPlayerDetails({ roomCode: '1234', username: playerName1 });

        expect(service.isPlayerSelected).toBeTruthy();
        expect(service.playerSelected).toEqual({ roomCode: '1234', username: playerName1 });

        service.closePlayerDetails();

        expect(service.isPlayerSelected).toBeFalsy();
        expect(service.playerSelected).toEqual(service.emptyPlayer);
    });

    it('should get if a player is selected', () => {
        service.theRoomCode = '1234';
        const playerName1 = 'Grégory';
        service.createPlayer(playerName1);

        expect(service.getIsPlayerSelected()).toBeFalsy();

        service.openPlayerDetails({ roomCode: '1234', username: playerName1 });

        expect(service.getIsPlayerSelected()).toBeTruthy();
    });

    it('should leave the room and reset values', () => {
        service.leaveRoom();
        expect(roomSocketService.send).toHaveBeenCalledWith(SocketEvents.LeaveRoom);
        expect(authGameService.resetAllValues).toHaveBeenCalled();
    });

    it('should remove the player', () => {
        service.theRoomCode = '1234';
        const playerName1 = 'Grégory';
        const thePlayer = { roomCode: '1234', username: playerName1 };
        service.createPlayer(playerName1);

        expect(service.getPlayer(playerName1)).toEqual(thePlayer);

        service.removePlayer(thePlayer);
    });

    it('should remove a player from the players array', () => {
        const playerToRemove: DataPlayerJoin = { roomCode: '1234', username: 'PlayerToRemove' };
        service.players = [playerToRemove, { roomCode: '1234', username: 'Player2' }, { roomCode: '1234', username: 'Player3' }];

        service.removePlayer(playerToRemove);

        expect(service.players).not.toContain(playerToRemove);
    });

    it('should ban the player', () => {
        service.theRoomCode = '1234';
        const playerName1 = 'Grégory';
        const thePlayer = { roomCode: '1234', username: playerName1 };
        service.createPlayer(playerName1);

        expect(service.getPlayer(playerName1)).toEqual(thePlayer);

        service.banPlayer(thePlayer);

        expect(service.isBanName(playerName1)).toBeTruthy();
    });

    it('should return if a player is valid or not', async () => {
        const name = 'player1';
        const password = '1234';
        const response = await service.isValid(name, password);

        expect(response).toBeFalsy();
    });
});
