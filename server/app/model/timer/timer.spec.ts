import { TimerGateway } from '@app/gateways/timer.gateway';
import { ONE_SECOND_DELAY, ONE_THOUSAND, TEN, TEN_SECOND_DELAY, TIMER_TICK } from '@common/constantes/constantes';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Timer } from './timer';

describe('Timer', () => {
    let timer: Timer;
    let timerGatewayMock: jest.Mocked<TimerGateway>;
    let eventEmitterMock: jest.Mocked<EventEmitter2>;

    beforeEach(() => {
        timerGatewayMock = {
            sendTimerValue: jest.fn(),
        } as unknown as jest.Mocked<TimerGateway>;

        eventEmitterMock = {
            emit: jest.fn(),
        } as unknown as jest.Mocked<EventEmitter2>;

        timer = new Timer(timerGatewayMock, eventEmitterMock, 'test');
    });

    it('should start the timer with a mode ,check each second if can activate panic mode each second and give back the time to the gateway', () => {
        const duration = 10;
        const mode = 'test';
        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
        const canActivatePanicModeMock = jest.fn();
        jest.spyOn(timer, 'canEnablePanicMode').mockImplementation(canActivatePanicModeMock);

        timer.initializeTimer(duration);
        timer.startTimer(mode);
        jest.advanceTimersByTime(ONE_SECOND_DELAY);
        expect(canActivatePanicModeMock).toHaveBeenCalledTimes(2);
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(timerGatewayMock.sendTimerValue).toHaveBeenCalledWith(timer.roomid, duration);
    });

    it('should start the timer with a given duration , mode and be at 4x speed if panic enable and give back the time to the gateway', () => {
        const duration = 10;
        const mode = 'test';
        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
        timer.initializeTimer(duration);
        timer.activatePanic();
        timer.startTimer(mode);
        jest.advanceTimersByTime(ONE_SECOND_DELAY);
        expect(timer.timerTick).toBe(TIMER_TICK);
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(timerGatewayMock.sendTimerValue).toHaveBeenCalledWith(timer.roomid, duration);
    });

    it('should when the timer hit 0 to clear the timer , call the timer gateway with 0 second and call the timerStateHandle', () => {
        const mode = 'test';
        const cleaTimerMock = jest.fn();
        jest.spyOn(timer, 'clearTimer').mockImplementation(cleaTimerMock);
        const timerStateHandleMock = jest.fn();
        jest.spyOn(timer, 'timerStateHandler').mockImplementation(timerStateHandleMock);
        const disablePanicMock = jest.fn();
        jest.spyOn(timer, 'disablePanic').mockImplementation(disablePanicMock);

        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
        timer.startTimer(mode);
        jest.advanceTimersByTime(TEN_SECOND_DELAY);
        expect(timerGatewayMock.sendTimerValue).toHaveBeenCalledTimes(TEN);
        jest.advanceTimersByTime(ONE_SECOND_DELAY);
        expect(timerGatewayMock.sendTimerValue).toHaveBeenLastCalledWith(timer.roomid, 0);
        expect(cleaTimerMock).toHaveBeenCalled();
        expect(timerStateHandleMock).toHaveBeenCalledWith(mode);
        expect(disablePanicMock).toHaveBeenCalled();
    });

    it('should handle the timeState test given by the timer', () => {
        timer.timerStateHandler('test');
        expect(eventEmitterMock.emit).toHaveBeenCalledWith('timerDone', timer.roomid);
    });

    it('should handle the timeState transition5s given by the timer', () => {
        timer.timerStateHandler('transition5s');
        expect(eventEmitterMock.emit).toHaveBeenCalledWith('timerHit0', timer.roomid);
    });

    it('should handle the timeState transitionQuestion given by the timer', () => {
        timer.timerStateHandler('transitionQuestion');
        expect(eventEmitterMock.emit).toHaveBeenCalledWith('orgChangeQuestion', timer.roomid);
    });

    it('should handle the timeState attendre given by the timer', () => {
        timer.timerStateHandler('attendre');
        expect(eventEmitterMock.emit).toHaveBeenCalledWith('waitVerify', timer.roomid);
    });

    it('should clear the timer', () => {
        jest.spyOn(global, 'clearInterval');
        timer.clearTimer();
        expect(clearInterval).toHaveBeenCalledWith(timer.countDown);
        expect(timer.countDown).toEqual(undefined);
    });

    it('should finish the timer', () => {
        timer.time = TEN;
        timer.finishTimer();
        expect(timer.time).toEqual(0);
    });

    it('should not start another timer if one is already running', () => {
        timer.startTimer('test');
        const res = timer.startTimer('test');
        expect(res).toBeUndefined();
    });

    it('should activate the panic mode and switch the boolean to true', () => {
        timer.panicEnable = false;
        timer.activatePanic();
        expect(timer.panicEnable).toBeTruthy();
    });

    it('should deactivate the panic mode and switch the boolean to false', () => {
        timer.panicEnable = true;
        timer.disablePanic();
        expect(timer.panicEnable).toBeFalsy();
    });

    it('should check if the timer is at 10 seconds to enable the panic mode for a QCM', () => {
        timer.time = 9;
        timer.canEnablePanicMode();
        expect(eventEmitterMock.emit).toHaveBeenCalledWith('canActivatePanicMode', timer.roomid, 'QCM');
    });

    it('should check if the timer is at 20 seconds to enable the panic mode for a QRL', () => {
        timer.time = 19;
        timer.canEnablePanicMode();
        expect(eventEmitterMock.emit).toHaveBeenCalledWith('canActivatePanicMode', timer.roomid, 'QRL');
    });

    it('should check emit nothing if the timer is neither at 10 or 20 seconds', () => {
        timer.time = 25;
        timer.canEnablePanicMode();
        expect(eventEmitterMock.emit).not.toHaveBeenCalled();
    });

    it('should change timer speed to 4x when panic mode is activated', () => {
        timer.panicEnable = true;
        timer.timerTick = ONE_THOUSAND;
        jest.spyOn(global, 'clearInterval');

        timer.changeTimerSpeed('test');

        expect(timer.timerTick).toBe(TIMER_TICK);
        expect(clearInterval).toHaveBeenCalled();
    });

    it('should change the timer speed to 1x  when panic mode is not activated anymore', () => {
        timer.panicEnable = false;
        timer.timerTick = 4000;
        jest.spyOn(global, 'clearInterval');

        timer.changeTimerSpeed('test');

        expect(timer.timerTick).toBe(ONE_THOUSAND);
        expect(clearInterval).toHaveBeenCalled();
    });
});
