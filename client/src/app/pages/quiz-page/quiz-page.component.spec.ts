/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DialogService } from '@app/services/dialog.service';
import { SharedService } from '@app/services/shared.service';
import { PlayerResult } from '@common/interfaces/playerResult';
import { Quiz } from '@common/interfaces/quiz';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { QuizComponent } from './quiz-page.component';

class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}

describe('QuizComponent', () => {
    let component: QuizComponent;
    let fixture: ComponentFixture<QuizComponent>;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;
    let onSpy: jasmine.Spy<any>;
    let router: Router;
    let mockSharedService: jasmine.SpyObj<SharedService>;
    let mockQuiz: Quiz;
    let dialogService: jasmine.SpyObj<DialogService>;

    beforeEach(() => {
        mockSharedService = jasmine.createSpyObj('SharedService', ['getSharedSelectedGame']);
        mockQuiz = {
            id: '1a2b3c',
            title: 'Questionnaire sur le JS',
            duration: 10,
            lastModification: '2018-11-13T20:20:39+00:00',
            description: 'Ce questionnaire permet de tester vos connaissances en JS.',
            visibility: true,
            questions: [
                {
                    type: 'QCM',
                    text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                    points: 40,
                    choices: [
                        {
                            text: 'var',
                            isCorrect: true,
                        },
                        {
                            text: 'self',
                            isCorrect: false,
                        },
                        {
                            text: 'this',
                            isCorrect: true,
                        },
                        {
                            text: 'int',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    type: 'QRL',
                    text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
                    points: 60,
                },
                {
                    type: 'QCM',
                    text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                    points: 20,
                    choices: [
                        {
                            text: 'Non',
                            isCorrect: true,
                        },
                        {
                            text: 'Oui',
                            isCorrect: false,
                        },
                    ],
                },
            ],
        };
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
        TestBed.configureTestingModule({
            declarations: [QuizComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'home', component: MainPageComponent },
                    { path: 'game', component: GamePageComponent },
                ]),
                MatDialogModule,
                FormsModule,
            ],
            providers: [
                { provide: ClientSocketService, useValue: clientSocketServiceMock },
                { provide: DialogService, useValue: dialogService },
            ],
        });

        fixture = TestBed.createComponent(QuizComponent);
        component = fixture.componentInstance;
        mockSharedService.getSharedSelectedGame.and.returnValue(mockQuiz);
        onSpy = spyOn(clientSocketServiceMock, 'on').and.callThrough();
        router = TestBed.inject(Router);
        dialogService.openDialog.and.returnValue(of('true'));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should ngOnInit properly', () => {
        component.sharedService = mockSharedService;
        const connectSpy = spyOn(component, 'connect').and.callThrough();
        const startGameSpy = spyOn(component, 'startGame').and.callThrough();
        component.ngOnInit();
        expect(connectSpy).toHaveBeenCalled();
        expect(startGameSpy).toHaveBeenCalled();
        expect(component.mode).toEqual(component.route.snapshot.paramMap.get('mode'));
        expect(component.currentQuiz).toEqual(mockSharedService.getSharedSelectedGame());
    });

    it('should configure sockets to leave test when gameDone', () => {
        component.mode = 'test';
        const leaveGameSpy = spyOn(component, 'leaveTest');
        socketTestHelper.peerSideEmit('gameDone');
        component.configureSockets();
        expect(onSpy.calls.allArgs()).toContain(['gameDone', jasmine.any(Function)]);
        expect(leaveGameSpy).toHaveBeenCalled();
    });

    it('should configure sockets and set the scoreboard when gameResult', () => {
        const expectedResult: PlayerResult[] = [];
        const setScoreBoardDataSpy = spyOn(component.result, 'setScoreBoardData').and.callThrough();
        socketTestHelper.peerSideEmit('gameResult', JSON.stringify(expectedResult));
        component.configureSockets();
        expect(onSpy.calls.allArgs()).toContain(['gameResult', jasmine.any(Function)]);
        expect(setScoreBoardDataSpy).toHaveBeenCalledWith(expectedResult);
    });

    it('should configure sockets to route player to result view when routePlayerResult', () => {
        const routePlayerResultSpy = spyOn(component, 'routePlayerResult');
        socketTestHelper.peerSideEmit('routePlayerResult');
        component.configureSockets();
        expect(onSpy.calls.allArgs()).toContain(['routePlayerResult', jasmine.any(Function)]);
        expect(routePlayerResultSpy).toHaveBeenCalled();
    });

    it('should configure sockets to route player to home when orgLeft', () => {
        const componentRouterSpy = spyOn(component.router, 'navigate');
        socketTestHelper.peerSideEmit('orgLeft');
        component.configureSockets();
        expect(onSpy.calls.allArgs()).toContain(['orgLeft', jasmine.any(Function)]);
        expect(componentRouterSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should configure sockets to play the audio on playPanic event', () => {
        const audioSpy = spyOn(component.audio, 'play');
        socketTestHelper.peerSideEmit('playPanic');
        component.configureSockets();
        expect(onSpy.calls.allArgs()).toContain(['playPanic', jasmine.any(Function)]);
        expect(audioSpy).toHaveBeenCalled();
    });

    it('should configure sockets to setStatsData', () => {
        const data = '[]';
        const setDataSpy = spyOn(component.result, 'setStatsData');
        socketTestHelper.peerSideEmit('sendGraphs', data);
        component.configureSockets();
        expect(onSpy.calls.allArgs()).toContain(['sendGraphs', jasmine.any(Function)]);
        expect(setDataSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should call closeSockets', () => {
        const closeSocketsSpy = spyOn(component, 'closeSockets');
        component.ngOnDestroy();
        expect(closeSocketsSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should call leaveTest when mode is test', () => {
        component.mode = 'test';
        const leaveTestSpy = spyOn(clientSocketServiceMock, 'send');
        component.ngOnDestroy();
        expect(leaveTestSpy).toHaveBeenCalled();
    });

    it('connect should call joinTestRoom when mode is test and configure sockets', () => {
        component.mode = 'test';
        const joinTestRoomSpy = spyOn(clientSocketServiceMock, 'joinTestRoom');
        component.connect();
        expect(joinTestRoomSpy).toHaveBeenCalled();
    });

    it('connect should configure sockets anyway', () => {
        const configureSocketsSpy = spyOn(component, 'configureSockets');
        component.connect();
        expect(configureSocketsSpy).toHaveBeenCalled();
    });

    it('should redirect to gameCreationView when leaveGame is called in mode test', () => {
        component.mode = 'test';
        const routerSpy = spyOn(router, 'navigate');
        component.abandonGame();
        expect(routerSpy).toHaveBeenCalledWith(['/game']);
    });

    it('should go home and send playerAbandon if abandonGame is not mode test', () => {
        component.mode = 'game';
        const routerSpy = spyOn(router, 'navigate');
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        component.abandonGame();
        expect(routerSpy).toHaveBeenCalledWith(['/home']);
        expect(sendSpy).toHaveBeenCalledWith('playerAbandon');
    });

    it('should redirect to resultView when routePlayerResult is called', () => {
        const routerSpy = spyOn(router, 'navigate');
        component.routePlayerResult();
        expect(routerSpy).toHaveBeenCalledWith(['/result-page']);
    });

    it('should leaveTest', () => {
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        const componentRouterSpy = spyOn(component.router, 'navigate');
        const clearSpy = spyOn(component.chatSocketService, 'clearPreviousMessageList');
        component.leaveTest();
        expect(sendSpy).toHaveBeenCalledWith('leaveTestRoom');
        expect(clearSpy).toHaveBeenCalled();
        expect(componentRouterSpy).toHaveBeenCalledWith(['/game']);
    });

    it('should call off function on clientSocketServiceMock when closeSockets', () => {
        const offSpy = spyOn(clientSocketServiceMock, 'off');
        component.closeSockets();
        expect(offSpy).toHaveBeenCalledWith('gameDone');
        expect(offSpy).toHaveBeenCalledWith('gameResult');
    });

    it('should send startTestGame when startGame is called in mode test', () => {
        component.mode = 'test';
        const sendSpy = spyOn(clientSocketServiceMock, 'send');
        component.startGame();
        expect(sendSpy).toHaveBeenCalledWith('startTestGame', component.currentQuiz);
    });
});
