import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { Socket } from 'socket.io-client';
import { TopBarComponent } from './top-bar.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}

describe('TopBarComponent', () => {
    let component: TopBarComponent;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;
    let fixture: ComponentFixture<TopBarComponent>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        TestBed.configureTestingModule({
            declarations: [TopBarComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: ClientSocketService, useValue: clientSocketServiceMock }],
            imports: [],
        });
        fixture = TestBed.createComponent(TopBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call clientSocketService on with right parameter', () => {
        const spy = spyOn(clientSocketServiceMock, 'on');
        component.configureSockets();
        expect(spy).toHaveBeenCalledWith('giveCurrentQuestion', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('changeTopBar', jasmine.any(Function));
    });

    it('should update question', () => {
        const question = {
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
        };
        expect(component.question).not.toEqual(question.text);
        expect(component.points).not.toEqual(question.points);
        component.configureSockets();
        socketTestHelper.peerSideEmit('giveCurrentQuestion', JSON.stringify(question));
        expect(component.question).toEqual(question.text);
        expect(component.points).toEqual(question.points);
    });

    it('should toggle isShowQuestion', () => {
        component.isShowQuestion = true;
        socketTestHelper.peerSideEmit('changeTopBar');
        component.configureSockets();
        expect(component.isShowQuestion).toBeFalse();
    });
});
