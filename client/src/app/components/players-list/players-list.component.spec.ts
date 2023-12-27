/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SortPlayerService } from '@app/services/sort-player.service';
import { Socket } from 'socket.io-client';
import { PlayersListComponent } from './players-list.component';
import { TEN, TWENTY, TWO } from '@common/constantes/constantes';

class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}

const mockScores = [
    { name: 'Allan', score: 40, status: false, chat: false, interaction: false, submit: false },
    { name: 'Gab', score: 48, status: true, chat: true, interaction: true, submit: true },
];

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;
    let socketTestHelper: SocketTestHelper;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let sortPlayerService: jasmine.SpyObj<SortPlayerService>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        sortPlayerService = jasmine.createSpyObj('SortPlayerService', ['decisionOfSort']);

        TestBed.configureTestingModule({
            declarations: [PlayersListComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: ClientSocketService, useValue: clientSocketServiceMock },
                { provide: SortPlayerService, usevalue: sortPlayerService },
            ],
        });
        fixture = TestBed.createComponent(PlayersListComponent);
        component = fixture.componentInstance;
        sortPlayerService = TestBed.inject(SortPlayerService) as jasmine.SpyObj<SortPlayerService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call configure sockets on ngInit', () => {
        const spyConfig = spyOn(component, 'configureSockets');
        component.ngOnInit();
        expect(spyConfig).toHaveBeenCalled();
    });

    it('should toggle chat and send ChatStateChange', () => {
        const spy = spyOn(clientSocketServiceMock, 'send');
        const player = mockScores[0];
        component.toggleChat(player);
        expect(spy).toHaveBeenCalledWith('ChatStateChange', [false, mockScores[0].name]);
        expect(player.chat).toBeTrue();
    });

    it('should configure sockets', () => {
        const spy = spyOn(clientSocketServiceMock, 'on');
        component.configureSockets();
        expect(spy).toHaveBeenCalledWith('giveScores', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('givePlayerScore', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('PlayerChatChange', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('SubmitForColor', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('UpdateColor', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('ResetStates', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('PlayerListSorted', jasmine.any(Function));
    });

    it('should call formatPlayerData and decisionOfSort', () => {
        const decisionSpy = spyOn(sortPlayerService, 'decisionOfSort');
        const formatSpy = spyOn(component, 'formatPlayerData');
        component.isInit = false;
        component.configureSockets();
        socketTestHelper.peerSideEmit('giveScores', mockScores);
        expect(formatSpy).toHaveBeenCalledWith(mockScores);
        expect(decisionSpy).toHaveBeenCalled();
    });

    it('should call formatPlayerDataStart', () => {
        const formatSpy = spyOn(component, 'formatPlayerDataStart');
        component.configureSockets();
        socketTestHelper.peerSideEmit('giveScores', mockScores);
        expect(formatSpy).toHaveBeenCalledWith(mockScores);
    });

    it('should set playerPoints', () => {
        const points = 10;
        component.configureSockets();
        socketTestHelper.peerSideEmit('givePlayerScore', points);
        expect(component.playerPoints).toEqual(points);
    });

    it('should call updatePlayerByName', () => {
        const name = 'test';
        const spy = spyOn(component, 'updatePlayerByName');
        component.configureSockets();
        socketTestHelper.peerSideEmit('PlayerChatChange', name);
        expect(spy).toHaveBeenCalledWith(name);
    });

    it('should call updateSubmitionPlayer', () => {
        const name = 'test';
        const spy = spyOn(component, 'updateSubmitionPlayer');
        component.configureSockets();
        socketTestHelper.peerSideEmit('SubmitForColor', name);
        expect(spy).toHaveBeenCalledWith(name);
    });

    it('should call updateInteractionPlayer', () => {
        const name = 'test';
        const spy = spyOn(component, 'updateInteractionPlayer');
        component.configureSockets();
        socketTestHelper.peerSideEmit('UpdateColor', name);
        expect(spy).toHaveBeenCalledWith(name);
    });

    it('should call resetPlayersStates', () => {
        const spy = spyOn(component, 'resetPlayersStates');
        component.configureSockets();
        socketTestHelper.peerSideEmit('ResetStates');
        expect(spy).toHaveBeenCalled();
    });

    it('should call formatPlayerData', () => {
        const data = 'test';
        const spy = spyOn(component, 'formatPlayerData');
        component.configureSockets();
        socketTestHelper.peerSideEmit('PlayerListSorted', data);
        expect(spy).toHaveBeenCalledWith(data);
    });

    it('should toggle chat of player', () => {
        component.playerScore = mockScores;
        component.playerScore[0].chat = false;

        component.updatePlayerByName(mockScores[0].name);
        expect(mockScores[0].chat).toBeTrue();

        component.updatePlayerByName(mockScores[0].name);
        expect(mockScores[0].chat).toBeFalse();
    });

    it('should update interaction of player', () => {
        const decisionSpy = spyOn(sortPlayerService, 'decisionOfSort');
        component.playerScore = mockScores;
        component.updateInteractionPlayer(mockScores[0].name);
        expect(mockScores[0].interaction).toBeTrue();
        expect(decisionSpy).toHaveBeenCalled();
    });

    it('should update submition of player', () => {
        const decisionSpy = spyOn(sortPlayerService, 'decisionOfSort');
        component.playerScore = mockScores;
        component.updateSubmitionPlayer(mockScores[0].name);
        expect(mockScores[0].submit).toBeTrue();
        expect(decisionSpy).toHaveBeenCalled();
    });

    it('should reset players states', () => {
        component.playerScore = mockScores;
        component.resetPlayersStates();
        expect(component.playerScore[0].submit).toBeFalse();
        expect(component.playerScore[1].submit).toBeFalse();
        expect(component.playerScore[0].interaction).toBeFalse();
        expect(component.playerScore[1].interaction).toBeFalse();
    });

    it('should update playerScore based on the provided data', () => {
        const data = JSON.stringify([
            ['Allan', { score: 10, status: true }],
            ['Gab', { score: 20, status: false }],
        ]);
        component.playerScore = [
            { name: 'Allan', score: 0, status: false, chat: false, interaction: false, submit: false },
            { name: 'Gab', score: 0, status: false, chat: false, interaction: false, submit: false },
        ];

        component.formatPlayerData(data);

        expect(component.playerScore[0].score).toEqual(TEN);
        expect(component.playerScore[0].status).toBeTrue();
        expect(component.playerScore[1].score).toEqual(TWENTY);
        expect(component.playerScore[1].status).toBeFalse();
    });

    it('should update sortPlayerService.playerScore with the updated playerScore', () => {
        const data = JSON.stringify([
            ['Allan', { score: 10, status: true }],
            ['Gab', { score: 20, status: false }],
        ]);
        component.playerScore = [
            { name: 'Allan', score: 0, status: false, chat: false, interaction: false, submit: false },
            { name: 'Gab', score: 0, status: false, chat: false, interaction: false, submit: false },
        ];

        component.formatPlayerData(data);

        expect(sortPlayerService.playerScore).toEqual(component.playerScore);
    });

    it('should format player data on start', () => {
        const data = JSON.stringify([
            ['Allan', { score: 10, status: true }],
            ['Gab', { score: 20, status: false }],
        ]);
        component.playerScore = [];

        component.formatPlayerDataStart(data);

        expect(component.playerScore.length).toEqual(TWO);

        expect(component.playerScore[0].name).toEqual('Allan');
        expect(component.playerScore[0].score).toEqual(TEN);
        expect(component.playerScore[0].status).toBeTrue();
        expect(component.playerScore[0].chat).toBeTrue();
        expect(component.playerScore[0].interaction).toBeFalse();
        expect(component.playerScore[0].submit).toBeFalse();

        expect(component.playerScore[1].name).toEqual('Gab');
        expect(component.playerScore[1].score).toEqual(TWENTY);
        expect(component.playerScore[1].status).toBeFalse();
        expect(component.playerScore[1].chat).toBeTrue();
        expect(component.playerScore[1].interaction).toBeFalse();
        expect(component.playerScore[1].submit).toBeFalse();

        expect(component.sortPlayerService.playerScore).toEqual(component.playerScore);
        expect(component.isInit).toBeFalse();
    });
});
