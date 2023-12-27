import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { Socket } from 'socket.io-client';
import { ChatSocketService } from './chat-socket.service';

const mockMessage = { id: '1', sender: 'Alice', content: 'Hello', time: new Date() };

class ClientSocketServiceMock extends ClientSocketService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}

describe('ChatSocketService', () => {
    let service: ChatSocketService;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        TestBed.configureTestingModule({
            providers: [{ provide: ClientSocketService, useValue: clientSocketServiceMock }],
        });
        service = TestBed.inject(ChatSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send a message', () => {
        const emitSpy = spyOn(socketTestHelper, 'emit');
        const message = { id: '1', sender: 'Alice', content: 'Hello', time: new Date() };
        service.send('sendMessage', message);
        expect(emitSpy).toHaveBeenCalledWith('sendMessage', message);
    });

    it('should send an event', () => {
        const emitSpy = spyOn(socketTestHelper, 'emit');
        service.send('sendMessage');
        expect(emitSpy).toHaveBeenCalledWith('sendMessage');
    });

    it('should clear list of previous message', () => {
        service.previousMessageList = [mockMessage, mockMessage, mockMessage];
        expect(service.previousMessageList.length).toEqual(3);

        service.clearPreviousMessageList();

        expect(service.previousMessageList).toEqual([]);
    });

    it('should check for event newMessage', () => {
        const message = { id: '1', sender: 'Grégory', content: 'Hello', time: new Date() };
        const onSpy = spyOn(service.socket, 'on').and.callThrough();

        service.checkForNewMessage();
        socketTestHelper.peerSideEmit('newMessage', JSON.stringify(message));

        expect(onSpy.calls.allArgs()).toEqual([['newMessage', jasmine.any(Function)]]);
    });
});
