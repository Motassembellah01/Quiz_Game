import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { Socket } from 'socket.io-client';
import { DisplayChoiceComponent } from './display-choice.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

class ClientSocketServiceMock extends ClientSocketService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}

describe('DisplayChoiceComponent', () => {
    let component: DisplayChoiceComponent;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;
    let fixture: ComponentFixture<DisplayChoiceComponent>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        TestBed.configureTestingModule({
            declarations: [DisplayChoiceComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: ClientSocketService, useValue: clientSocketServiceMock }],
            imports: [],
        });

        fixture = TestBed.createComponent(DisplayChoiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call clientSocketService.on with right parameter', () => {
        const spy = spyOn(clientSocketServiceMock, 'on');
        component.configureSockets();
        expect(spy).toHaveBeenCalledWith('timerDoneClient', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('everyPlayerAnswered', jasmine.any(Function));
    });

    it('should call showAnswer', () => {
        const spy = spyOn(component, 'showAnswer');
        socketTestHelper.peerSideEmit('timerDoneClient');
        socketTestHelper.peerSideEmit('everyPlayerAnswered');
        component.configureSockets();
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should set color to green', () => {
        component.isCorrect = true;
        component.showAnswer();
        expect(component.color).toEqual({ backgroundColor: '#47b9a3' });
    });

    it('should set color to red', () => {
        component.isCorrect = false;
        component.showAnswer();
        expect(component.color).toEqual({ backgroundColor: '#FE0000' });
    });
});
