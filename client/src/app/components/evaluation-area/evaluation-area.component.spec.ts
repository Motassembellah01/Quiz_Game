import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { FIFTY, ONE_HUNDRED } from '@common/constantes/constantes';
import { Socket } from 'socket.io-client';
import { EvaluationAreaComponent } from './evaluation-area.component';

class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}

const mockPlayerPoint = [
    {
        player: 'player1',
        score: 10,
    },
    {
        player: 'player2',
        score: 20,
    },
];

describe('EvaluationAreaComponent', () => {
    let component: EvaluationAreaComponent;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;
    let fixture: ComponentFixture<EvaluationAreaComponent>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;

        TestBed.configureTestingModule({
            declarations: [EvaluationAreaComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: ClientSocketService, useValue: clientSocketServiceMock }],
        });

        fixture = TestBed.createComponent(EvaluationAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call configureSockets on init', () => {
        const spy = spyOn(component, 'configureSockets');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should call closeSockets on destroy', () => {
        const spy = spyOn(component, 'closeSockets');
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleSendQRLAnswersToOrgData on SendQRLAnswersToOrg event', () => {
        const onSpy = spyOn(clientSocketServiceMock, 'on');
        component.configureSockets();
        expect(onSpy).toHaveBeenCalledWith('SendQRLAnswersToOrg', component.handleSendQRLAnswersToOrgData);
    });

    it('should select percentage', () => {
        let percentage = -1;
        component.selectPercentage(percentage);
        expect(component.myPercentage).toEqual(percentage);
        expect(component.isSelected).toEqual([false, false, false]);

        percentage = 0;
        component.selectPercentage(percentage);
        expect(component.myPercentage).toEqual(percentage);
        expect(component.isSelected).toEqual([true, false, false]);

        percentage = FIFTY;
        component.selectPercentage(percentage);
        expect(component.myPercentage).toEqual(percentage);
        expect(component.isSelected).toEqual([false, true, false]);

        percentage = ONE_HUNDRED;
        component.selectPercentage(percentage);
        expect(component.myPercentage).toEqual(percentage);
        expect(component.isSelected).toEqual([false, false, true]);
    });

    it('should return if one button is selected or not', () => {
        component.isSelected = [true, false, false];
        expect(component.isOneSelectedButton()).toBeTrue();

        component.isSelected = [false, false, false];
        expect(component.isOneSelectedButton()).toBeFalse();
    });

    it('should call givePercent and reset myPercentage and isSelected', () => {
        component.myPercentage = 0;
        component.isSelected = [true, false, false];
        spyOn(component, 'isOneSelectedButton').and.returnValue(true);
        const spy = spyOn(component, 'givePercent');

        component.finalize();

        expect(spy).toHaveBeenCalledWith(0);
        expect(component.myPercentage).toBeUndefined();
        expect(component.isSelected).toEqual([false, false, false]);
    });

    it('should push in playerPoints and call nextAnswer', () => {
        const length = component.playerPoints.length;
        const spy = spyOn(component, 'nextAnswer');
        const playerName = 'player1';
        const percentage = 50;
        component.currentEvaluation = [playerName];

        component.givePercent(percentage);

        expect(spy).toHaveBeenCalled();
        expect(component.playerPoints.length).toEqual(length + 1);
        expect(component.playerPoints[length]).toEqual({ player: playerName, score: percentage });
    });

    it('should set currentEvaluation to next answer', () => {
        const mockPlayerAnswers = new Map();
        mockPlayerAnswers.set('player1', 'blablabla');
        mockPlayerAnswers.set('player2', 'ohohoh');
        component.playerAnswers = Array.from(mockPlayerAnswers);
        component.currentEvalIndex = 0;

        component.nextAnswer();

        expect(component.currentEvalIndex).toEqual(1);
        expect(component.currentEvaluation).toEqual(component.playerAnswers[1]);
    });

    it('should handle when evaluation is ended', () => {
        const spy = spyOn(component.allCorrectedScores, 'emit');
        const mockPlayerAnswers = new Map();
        mockPlayerAnswers.set('player1', 'blablabla');
        mockPlayerAnswers.set('player2', 'ohohoh');
        component.playerAnswers = Array.from(mockPlayerAnswers);
        component.currentEvalIndex = 1;
        component.playerPoints = mockPlayerPoint;

        component.nextAnswer();

        expect(component.currentEvalIndex).toEqual(2);
        expect(component.allCorrected).toBeTrue();
        expect(component.correctionTime).toBeFalse();
        expect(spy).toHaveBeenCalledWith(mockPlayerPoint);
        expect(component.playerPoints).toEqual([]);
    });

    it('should call clientSocketService.off', () => {
        const spy = spyOn(clientSocketServiceMock, 'off');
        component.closeSockets();
        expect(spy).toHaveBeenCalledWith('SendQRLAnswersToOrg', component.handleSendQRLAnswersToOrgData);
    });

    it('should handle SendQRLAnswersToOrg event', () => {
        const mockPlayerAnswers = new Map();
        mockPlayerAnswers.set('player1', 'blablabla');
        mockPlayerAnswers.set('player2', 'ohohoh');

        component.handleSendQRLAnswersToOrg(Array.from(mockPlayerAnswers));

        expect(component.playerAnswers).toEqual(Array.from(mockPlayerAnswers));
        expect(component.allCorrected).toBeFalse();
        expect(component.currentEvalIndex).toEqual(0);
        expect(component.currentEvaluation).toEqual(Array.from(mockPlayerAnswers)[0]);
        expect(component.correctionTime).toBeTrue();
    });
});
