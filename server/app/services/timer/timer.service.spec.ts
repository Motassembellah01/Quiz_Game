import { TimerGateway } from '@app/gateways/timer.gateway';
import { timerMock } from '@app/mocks/timer-mock';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimerService, TimerGateway, EventEmitter2, Logger],
        }).compile();

        service = module.get<TimerService>(TimerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize the timer in a room when the game start', () => {
        const roomId = 'test';
        expect(service.timers.size).toBe(0);
        service.initializeTimer(roomId);
        expect(service.timers.size).toBe(1);
        expect(service.timers.has(roomId)).toBeTruthy();
    });

    it('should start the timer in a room', () => {
        const roomId = 'test';
        const mode = 'test';
        const timer = timerMock();
        service.timers.set(roomId, timer);
        service.startTimerRoom(roomId, mode);
        expect(timer.startTimer).toHaveBeenCalledWith(mode);
    });

    it('should clear the timer in the room', () => {
        const roomId = 'test';
        const timer = timerMock();
        service.timers.set(roomId, timer);
        service.clearTimerRoom(roomId);
        expect(timer.clearTimer).toHaveBeenCalled();
    });

    it('should delete the timer in a room', () => {
        const spyClearTimerRoom = jest.spyOn(service, 'clearTimerRoom');
        const roomId = 'test';
        const timer = timerMock();
        service.timers.set(roomId, timer);
        service.deleteTimer(roomId);
        expect(spyClearTimerRoom).toHaveBeenCalledWith(roomId);
        expect(timer.clearTimer).toHaveBeenCalled();
        expect(service.timers.has(roomId)).toBeFalsy();
    });

    it('should finish the timer in a rooom', () => {
        const roomId = 'test';
        const timer = timerMock();
        service.timers.set(roomId, timer);
        service.finishTimer(roomId);
        expect(timer.finishTimer).toHaveBeenCalled();
    });

    it('should set the timer duration of a lobby', () => {
        const roomId = 'test';
        const timer = timerMock();
        const duration = 10;
        service.timers.set(roomId, timer);
        service.setTimerDuration(roomId, duration);
        expect(timer.initializeTimer).toHaveBeenCalledWith(duration);
    });

    it('should activate the panic mode of a timer', () => {
        const roomId = 'test';
        const timer = timerMock();
        service.timers.set(roomId, timer);
        service.activatePanic(roomId);
        expect(timer.activatePanic).toBeCalled();
    });
});
