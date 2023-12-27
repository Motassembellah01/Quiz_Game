import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { PlayerService } from '@app/services/player.service';
import { RoomEvent } from '@common/enum/room.gateway.events';
import { Socket } from 'socket.io-client';
import { GameAuthComponent } from './game-auth.component';

class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}

describe('GameAuthComponent', () => {
    let component: GameAuthComponent;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let fixture: ComponentFixture<GameAuthComponent>;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['isValid', 'createPlayer']);
        TestBed.configureTestingModule({
            declarations: [GameAuthComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: ClientSocketService, useValue: clientSocketServiceMock },
            ],
        });
        fixture = TestBed.createComponent(GameAuthComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit the connect event and call createPlayer if valid', async () => {
        const spy = spyOn(component.connect, 'emit');
        playerServiceSpy.isValid.and.returnValue(Promise.resolve(true));
        await component.validate();
        expect(playerServiceSpy.isValid).toHaveBeenCalledWith(component.userName, component.userPassword);
        expect(spy).toHaveBeenCalled();
        expect(playerServiceSpy.createPlayer).toHaveBeenCalledWith(component.userName);
    });

    it('should subscribe to RoomEvent.ErrorMessage and display alert if data is not empty', () => {
        const errorMessage = 'Custom error message';
        const alertSpy = spyOn(window, 'alert');
        socketTestHelper.peerSideEmit(RoomEvent.ErrorMessage, errorMessage);
        component.ngOnInit();

        expect(alertSpy).toHaveBeenCalledWith(errorMessage);
    });
});
