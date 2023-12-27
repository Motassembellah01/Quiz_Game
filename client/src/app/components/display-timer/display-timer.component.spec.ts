import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { Socket } from 'socket.io-client';
import { DisplayTimerComponent } from './display-timer.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

class ClientSocketServiceMock extends ClientSocketService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}

describe('DisplayTimerComponent', () => {
    let component: DisplayTimerComponent;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;
    let fixture: ComponentFixture<DisplayTimerComponent>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        TestBed.configureTestingModule({
            declarations: [DisplayTimerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: ClientSocketService, useValue: clientSocketServiceMock }],
            imports: [],
        });
        fixture = TestBed.createComponent(DisplayTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call clientSocketService on with timerTick parameter', () => {
        const spy = spyOn(clientSocketServiceMock, 'on');
        component.configureFeatures();
        expect(spy).toHaveBeenCalledWith('timerTick', jasmine.any(Function));
    });

    it('should update timer', () => {
        const time = 14;
        expect(component.time).not.toEqual(time);
        component.configureFeatures();
        socketTestHelper.peerSideEmit('timerTick', time);
        expect(component.time).toEqual(time);
    });
});
