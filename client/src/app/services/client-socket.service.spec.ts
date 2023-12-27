import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { ClientSocketService } from './client-socket.service';
import { SocketTestHelper } from '@app/classes/socket-test-helper';

describe('ClientSocketService', () => {
    let service: ClientSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClientSocketService);
        service.socket = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect', () => {
        service.connect();
        expect(service.socket).toBeDefined();
    });

    it('should disconnect', () => {
        const serviceSocketSpy = spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(serviceSocketSpy).toHaveBeenCalled();
    });

    it('isSocketAlive should return true if the socket is still connected', () => {
        service.socket.connected = true;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeTruthy();
    });

    it('isSocketAlive should return false if the socket is no longer connected', () => {
        service.socket.connected = false;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('isSocketAlive should return false if the socket is not defined', () => {
        (service.socket as unknown) = undefined;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('should join the test room', () => {
        const emitSpy = spyOn(service.socket, 'emit');
        service.joinTestRoom();
        expect(emitSpy).toHaveBeenCalledWith('joinTestRoom');
    });

    it('should handle socket events', () => {
        const testEventData = { test: 'data' };
        const callback = jasmine.createSpy('callback');
        const onSpy = spyOn(service.socket, 'on');

        service.on('testEvent', callback);
        onSpy.calls.mostRecent().args[1](testEventData);

        expect(callback).toHaveBeenCalledWith(testEventData);
    });

    it('should call socket.on with an event', () => {
        const event = 'helloWorld';
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for fake function
        const action = () => {};
        const spy = spyOn(service.socket, 'on');
        service.on(event, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, action);
    });

    it('should call emit with data when using send', () => {
        const event = 'helloWorld';
        const data = 42;
        const spy = spyOn(service.socket, 'emit');
        service.send(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, data);
    });

    it('should call emit without data when using send if data is undefined', () => {
        const event = 'helloWorld';
        const data = undefined;
        const spy = spyOn(service.socket, 'emit');
        service.send(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event);
    });
});

// Certaines portions de ce code s'inpire de l'exemple Socket-IO fourni dans le cadre du cours par Nikolay Radoev - Chargé du cours
