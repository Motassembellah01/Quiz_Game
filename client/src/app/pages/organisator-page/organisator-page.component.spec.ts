import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { OrganisatorPageComponent } from '@app/pages/organisator-page/organisator-page.component';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DialogService } from '@app/services/dialog.service';
import { ResultService } from '@app/services/result.service';
import { ChatSocketService } from '@app/services/socket/chat-socket.service';
import { QRLPlayerScore } from '@common/interfaces/QRLPlayerScore';
import { PlayerResult } from '@common/interfaces/playerResult';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}

describe('OrganisatorPageComponent', () => {
    let component: OrganisatorPageComponent;
    let fixture: ComponentFixture<OrganisatorPageComponent>;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;
    let chatSocketService: jasmine.SpyObj<ChatSocketService>;
    let resultService: jasmine.SpyObj<ResultService>;
    let router: Router;
    const playerResults: PlayerResult[] = [];
    let dialogService: jasmine.SpyObj<DialogService>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        chatSocketService = jasmine.createSpyObj('ChatSocketService', ['clearPreviousMessageList']);
        resultService = jasmine.createSpyObj('ResultService', ['setScoreBoardData']);
        dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
        TestBed.configureTestingModule({
            declarations: [OrganisatorPageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'result-page', component: ResultPageComponent },
                    { path: 'home', component: MainPageComponent },
                ]),
                MatDialogModule,
            ],
            providers: [
                { provide: ClientSocketService, useValue: clientSocketServiceMock },
                { provide: ResultService, useValue: resultService },
                { provide: ChatSocketService, useValue: chatSocketService },
                { provide: DialogService, useValue: dialogService },
            ],
        });

        fixture = TestBed.createComponent(OrganisatorPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        dialogService.openDialog.and.returnValue(of('true'));
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should configure sockets OnInit', () => {
        const spy = spyOn(component, 'configureSockets');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should route player to the result view', () => {
        const navigateSpy = spyOn(router, 'navigate');

        component.routePlayerResult();

        expect(navigateSpy).toHaveBeenCalledWith(['/result-page']);
    });

    it('should call clientSocketService.on with right parameter', () => {
        const spy = spyOn(clientSocketServiceMock, 'on');
        component.configureSockets();
        expect(spy).toHaveBeenCalledWith('gameResult', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('canChangeQuestion', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('giveTotalQuestion', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('routePlayerResult', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('giveCurrentQuestion', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('timerDoneClient', jasmine.any(Function));
    });

    it('should handle "gameResult" event', () => {
        component.configureSockets();

        const resultsData = JSON.stringify(playerResults);
        socketTestHelper.peerSideEmit('gameResult', resultsData);

        expect(resultService.setScoreBoardData).toHaveBeenCalled();
    });

    it('should handle "canChangeQuestion" event', () => {
        component.totalQuestion = 1;
        component.configureSockets();
        socketTestHelper.peerSideEmit('canChangeQuestion');
        expect(component.isNextQuestionAvailable).toBe(true);

        component.totalQuestion = 0;
        socketTestHelper.peerSideEmit('canChangeQuestion');
        expect(component.isNextQuestionAvailable).toBe(false);
        expect(component.isGameDone).toBe(true);
    });

    it('should handle "giveTotalQuestion" event', () => {
        const totalQuestion = 4;
        component.configureSockets();
        socketTestHelper.peerSideEmit('giveTotalQuestion', totalQuestion);
        expect(component.totalQuestion).toEqual(totalQuestion - 1);
    });

    it('should handle "routePlayerResult" event', () => {
        const spy = spyOn(component, 'routePlayerResult');
        component.configureSockets();
        socketTestHelper.peerSideEmit('routePlayerResult');
        expect(spy).toHaveBeenCalled();
    });

    it('should handle "canActivatePanicMode" event', () => {
        component.panicEnable = false;
        component.configureSockets();
        socketTestHelper.peerSideEmit('canActivatePanicMode');
        expect(component.panicEnable).toBeTrue();
    });

    it('should handle "giveCurrentQuestion" event', () => {
        component.showTimerButton = false;
        component.configureSockets();
        socketTestHelper.peerSideEmit('giveCurrentQuestion', { type: 'QCM' });
        expect(component.showTimerButton).toBeTrue();
    });

    it('should handle "timerDoneClient" event', () => {
        const sendSpy = spyOn(component.clientSocketService, 'send');
        component.showTimerButton = true;
        component.correctionMode = false;
        component.questionType = 'QRL';
        component.configureSockets();
        socketTestHelper.peerSideEmit('timerDoneClient');
        expect(sendSpy).toHaveBeenCalledWith('askQRLAnswers');
        expect(component.showTimerButton).toBeFalse();
        expect(component.correctionMode).toBeTrue();
        expect(component.showTimerButton).toBeFalse();
    });

    it('should call leave', () => {
        const spyLeave = spyOn(component, 'leavingActions');
        const spySocket = spyOn(clientSocketServiceMock, 'isSocketAlive').and.returnValue(false);
        component.configureSockets();
        expect(spySocket).toHaveBeenCalled();
        expect(spyLeave).toHaveBeenCalled();
    });

    it('should send "nextQuestion"', () => {
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        component.nextquestion();

        expect(sendSpy).toHaveBeenCalledWith('nextQuestion');
        expect(component.isNextQuestionAvailable).toBe(false);
    });

    it('should send "showResult"', () => {
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        component.showResult();

        expect(sendSpy).toHaveBeenCalledWith('showResult');
    });

    it('should send "organisatorLeft" and navigate to /home', () => {
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        const navigateSpy = spyOn(router, 'navigate');

        component.leave();

        expect(sendSpy).toHaveBeenCalledWith('organisatorLeft');
        expect(chatSocketService.clearPreviousMessageList).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should call clientSocketService.off', () => {
        const offSpy = spyOn(clientSocketServiceMock, 'off');
        component.closeSockets();

        expect(offSpy).toHaveBeenCalledWith('gameResult', jasmine.any(Function));
        expect(offSpy).toHaveBeenCalledWith('canChangeQuestion', jasmine.any(Function));
        expect(offSpy).toHaveBeenCalledWith('giveTotalQuestion', jasmine.any(Function));
        expect(offSpy).toHaveBeenCalledWith('routePlayerResult', jasmine.any(Function));
        expect(offSpy).toHaveBeenCalledWith('canActivatePanicMode', jasmine.any(Function));
        expect(offSpy).toHaveBeenCalledWith('giveCurrentQuestion', jasmine.any(Function));
    });

    it('should toggle timerPlay and call resumeTimer', () => {
        const resumeSpy = spyOn(component, 'resumeTimer');
        component.timerPlay = false;

        component.toggleStartPlay();

        expect(resumeSpy).toHaveBeenCalled();
    });

    it('should toggle timerPlay and call pauseTimer', () => {
        const pauseSpy = spyOn(component, 'pauseTimer');
        component.timerPlay = true;

        component.toggleStartPlay();

        expect(pauseSpy).toHaveBeenCalled();
    });

    it('should send pauseTimer event', () => {
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        component.pauseTimer();
        expect(sendSpy).toHaveBeenCalledWith('pauseTimer');
    });

    it('should send resumeTimer event', () => {
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        component.resumeTimer();
        expect(sendSpy).toHaveBeenCalledWith('resumeTimer');
    });

    it('should start panic mode', () => {
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        const audioSpy = spyOn(component.audio, 'play');
        component.startPanicMode();
        expect(sendSpy).toHaveBeenCalledWith('panicSound');
        expect(sendSpy).toHaveBeenCalledWith('panicMode');
        expect(audioSpy).toHaveBeenCalled();
        expect(component.panicEnable).toBeFalse();
    });

    it('should set allQRLPoints and answersQRLCorrected to true', () => {
        const scores: QRLPlayerScore[] = [
            { player: '1', score: 10 },
            { player: '2', score: 20 },
            { player: '3', score: 30 },
        ];

        component.onAllCorrectedScores(scores);

        expect(component.allQrlPoints).toEqual(scores);
        expect(component.answersQRLCorrected).toBeTrue();
    });

    it('should send "receiveQRLScore" event with allQRLPoints and reset variables', () => {
        const sendSpy = spyOn(component.clientSocketService, 'send');
        const allQrlPoints = [
            { player: '1', score: 10 },
            { player: '2', score: 20 },
            { player: '3', score: 30 },
        ];
        component.allQrlPoints = allQrlPoints;
        component.answersQRLCorrected = true;

        component.sendResult();

        expect(sendSpy).toHaveBeenCalledWith('receiveQRLScore', allQrlPoints);
        expect(component.allQrlPoints).toEqual([]);
        expect(component.answersQRLCorrected).toBe(false);
    });

    it('should set correctionMode to true', () => {
        component.onCorrectionMode();
        expect(component.correctionMode).toBeTrue();
    });

    it('should handle "canActivatePanicMode" event', () => {
        component.panicEnable = false;
        component.handleCanActivatePanicMode();
        expect(component.panicEnable).toBeTrue();
    });
});
