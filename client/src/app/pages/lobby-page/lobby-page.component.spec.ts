import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGameService } from '@app/services/auth-game.service';
import { PlayerService } from '@app/services/player.service';
import { SharedService } from '@app/services/shared.service';
import { RoomSocketService } from '@app/services/socket/room-socket.service';
import { LobbyPageComponent } from './lobby-page.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let playerService: jasmine.SpyObj<PlayerService>;
    let sharedService: jasmine.SpyObj<SharedService>;
    let roomSocketService: jasmine.SpyObj<RoomSocketService>;
    let authGameService: jasmine.SpyObj<AuthGameService>;
    let router: jasmine.SpyObj<Router>;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        playerService = jasmine.createSpyObj('PlayerService', ['getIsPlayerSelected']);
        sharedService = jasmine.createSpyObj('SharedService', ['setSharedIsConnected']);
        roomSocketService = jasmine.createSpyObj('RoomSocketService', ['kicked', 'socket', 'send', 'on']);
        authGameService = jasmine.createSpyObj('AuthGameService', ['setIsConnected', 'getIsConnected']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        socketTestHelper = new SocketTestHelper();
        roomSocketService.socket = socketTestHelper as unknown as Socket;

        TestBed.configureTestingModule({
            declarations: [LobbyPageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: PlayerService, useValue: playerService },
                { provide: SharedService, useValue: sharedService },
                { provide: RoomSocketService, useValue: roomSocketService },
                { provide: AuthGameService, useValue: authGameService },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should turn connected to true if isOrganiser is true', () => {
        playerService.isOrganizer = true;
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;

        expect(component.connected).toBeTruthy();
    });

    it('should configure sockets OnInit', () => {
        const spy = spyOn(component, 'configureSockets');

        component.ngOnInit();

        expect(spy).toHaveBeenCalled();
    });

    it("should reinitialize values when the page's destroyed", () => {
        component.ngOnDestroy();

        expect(authGameService.setIsConnected).toHaveBeenCalled();
        expect(component.connected).toBeFalsy();
    });

    it('should get if a player is selected', () => {
        const isAnyoneSelected = component.getIsPlayerSelected();

        expect(isAnyoneSelected).toBeFalsy();
    });

    it('should allow the access', () => {
        component.grantAccess();

        expect(sharedService.setSharedIsConnected).toHaveBeenCalled();
        expect(authGameService.setIsConnected).toHaveBeenCalled();
    });

    it('should call navigate to organisator-page when receiving the routePlayer event if it isOrganisteur is true', () => {
        const roomId = '1234';
        router.navigate.and.stub();
        roomSocketService.send.and.stub();
        component.isOrganizer = true;
        component.configureSockets();
        socketTestHelper.peerSideEmit('routePlayer', roomId);
        expect(roomSocketService.send).toHaveBeenCalledWith('startGame', { roomID: roomId });
        expect(router.navigate).toHaveBeenCalledWith(['/organisator-page']);
    });

    it('should call navigate to /Quiz in mode game when receiving the routePlayer event if it isOrganisteur is false', () => {
        const roomId = '1234';
        router.navigate.and.stub();
        roomSocketService.send.and.stub();
        component.isOrganizer = false;
        component.configureSockets();
        socketTestHelper.peerSideEmit('routePlayer', roomId);
        expect(router.navigate).toHaveBeenCalledWith(['/Quiz', 'game']);
    });

    it('should turn isGameStarting to true when receiving the displayTimer event', () => {
        component.isGameStarting = false;
        component.configureSockets();
        socketTestHelper.peerSideEmit('displayTimer');
        expect(component.isGameStarting).toBeTruthy();
    });

    it('should call navigate to /home', () => {
        router.navigate.and.stub();
        component.configureSockets();
        socketTestHelper.peerSideEmit('orgLeft');
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should update playerCount', () => {
        const playerCount = 5;
        component.updatePlayerCount(playerCount);
        expect(component.playerCount).toEqual(playerCount);
    });
});
