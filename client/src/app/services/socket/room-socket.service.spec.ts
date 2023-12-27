import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';
import { AuthGameService } from '@app/services/auth-game.service';
import { RoomSocketService } from './room-socket.service';
import { ClientSocketService } from '@app/services/client-socket.service';

describe('RoomSocketService', () => {
    let service: RoomSocketService;
    let socketTestHelper: SocketTestHelper;
    let routerSpy: jasmine.SpyObj<Router>;
    let authGameServiceSpy: jasmine.SpyObj<AuthGameService>;
    let clientSocketServiceSpy: jasmine.SpyObj<ClientSocketService>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        authGameServiceSpy = jasmine.createSpyObj('AuthGameService', ['setIsConnected', 'setIsAccepted']);
        clientSocketServiceSpy = jasmine.createSpyObj('ClientSocketService', ['send']);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ClientSocketService, useValue: clientSocketServiceSpy },
                { provide: AuthGameService, useValue: authGameServiceSpy },
            ],
        });
        service = TestBed.inject(RoomSocketService);
        service.socket = socketTestHelper as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect', () => {
        expect(service.socket).toEqual(socketTestHelper as unknown as Socket);
        service.connect();
        expect(service.socket).not.toEqual(socketTestHelper as unknown as Socket);
    });

    it('should disconnect', () => {
        const serviceSocketSpy = spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(serviceSocketSpy).toHaveBeenCalled();
    });

    it('isSocketAlive should return true if the socket is still connected', () => {
        service.socket.connected = true;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeTruthy();
    });

    it('isSocketAlive should return false if the socket is no longer connected', () => {
        service.socket.connected = false;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('isSocketAlive should return false if the socket is not defined', () => {
        (service.socket as unknown) = undefined;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('should get room id', () => {
        const onSpy = spyOn(service.socket, 'on').and.callThrough();
        const id = '1234';

        const result = service.getRoomID();
        socketTestHelper.peerSideEmit('GetRoomID', id);

        expect(onSpy.calls.allArgs()).toEqual([['GetRoomID', jasmine.any(Function)]]);

        result.subscribe((message) => {
            expect(message).toEqual(id);
        });
    });

    it('should update player list with the new player list', () => {
        const newPlayerList = ['Grégory', 'Gabriel', 'Julie', 'Motassem', 'Allan', 'Bruna'];
        const nextSpy = spyOn(service.playerListSubject, 'next');

        service.updatePlayerList(newPlayerList);

        expect(nextSpy).toHaveBeenCalledWith(newPlayerList);
    });

    it('should delete the player list', () => {
        const newPlayerList = ['Grégory', 'Gabriel', 'Julie', 'Motassem', 'Allan', 'Bruna'];
        const nextSpy = spyOn(service.playerListSubject, 'next');

        service.updatePlayerList(newPlayerList);

        expect(nextSpy).toHaveBeenCalledWith(newPlayerList);

        service.deletePlayerList();

        expect(nextSpy).toHaveBeenCalledWith(['']);
    });

    it('should get players of the room', () => {
        const newPlayerList = ['Grégory', 'Gabriel', 'Julie', 'Motassem', 'Allan', 'Bruna'];
        const onSpy = spyOn(service.socket, 'on').and.callThrough();
        const updateSpy = spyOn(service, 'updatePlayerList');

        service.getPlayersOfRoom();
        socketTestHelper.peerSideEmit('UpdateRoomPlayer', newPlayerList);

        expect(onSpy).toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalled();
    });

    it('should get the actual lock state', () => {
        const onSpy = spyOn(service.socket, 'on').and.callThrough();

        service.getLockState();
        socketTestHelper.peerSideEmit('RoomStateChanged', true);

        expect(onSpy.calls.allArgs()).toEqual([['RoomStateChanged', jasmine.any(Function)]]);

        service.roomState$.subscribe((roomState) => {
            expect(roomState).toEqual(true);
        });
    });

    it('should get room players', async () => {
        const playerList = [{ socketId: service.socket, playername: 'Player 1' }];
        let response: Map<Socket, string> = new Map();

        const result = service.getRoomPlayers();
        // socketTestHelper.peerSideEmit('SocketList', playerList);

        // probleme avec peerSideEmit : la promesse n'est jamais résolue, aucune données recu
        await new Promise<void>((resolve) => {
            result.subscribe((data) => {
                response = data;
                resolve();
            });
            socketTestHelper.peerSideEmit('SocketList', playerList);
        });
        expect(response.get(service.socket)).toEqual('Player 1');
    });

    it('should accept player to join room', () => {
        const isAccepted = true;
        const onSpy = spyOn(service.socket, 'on').and.callThrough();

        const promise = service.joinRoom();
        socketTestHelper.peerSideEmit('JoinRoom', isAccepted);

        expect(onSpy.calls.allArgs()).toEqual([['JoinRoom', jasmine.any(Function)]]);
        expect(authGameServiceSpy.setIsAccepted).toHaveBeenCalledWith(isAccepted);
        promise.then((result) => {
            expect(result).toEqual(isAccepted);
        });
    });

    it('should get error message', () => {
        const onSpy = spyOn(service.socket, 'on').and.callThrough();
        const message = 'error';

        service.getErrorMessage();
        socketTestHelper.peerSideEmit('ErrorMessage', message);

        expect(onSpy.calls.allArgs()).toEqual([['ErrorMessage', jasmine.any(Function)]]);

        service.errorMessage$.subscribe((errorMessage) => {
            expect(errorMessage).toEqual(message);
        });
    });

    it('should listen for the event kicked', () => {
        const onSpy = spyOn(service.socket, 'on').and.callThrough();
        routerSpy.navigate.and.stub();

        service.kicked();
        socketTestHelper.peerSideEmit('Kicked');

        expect(onSpy.calls.allArgs()).toEqual([['Kicked', jasmine.any(Function)]]);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
        expect(authGameServiceSpy.setIsConnected).toHaveBeenCalledWith(false);
        expect(authGameServiceSpy.setIsAccepted).toHaveBeenCalledWith(false);
    });

    it('should send an event with or without data', () => {
        const event = 'helloWorld';
        const data = 42;
        service.send(event, data);
        expect(clientSocketServiceSpy.send).toHaveBeenCalled();
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith(event, data);

        service.send(event);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith(event, undefined);
    });
});
