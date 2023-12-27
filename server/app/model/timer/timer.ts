/* eslint-disable prettier/prettier */
import { TimerGateway } from '@app/gateways/timer.gateway';
import { FOUR_TIMES_FASTER, ONE_SECOND_DELAY, QCM_PANIC, QRL_PANIC } from '@common/constantes/constantes';
import { TimerEvent, TimerState } from '@common/enum/timer.gateway.events';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class Timer {
    time: number = 0;
    countDown: NodeJS.Timer | undefined;
    roomid: string;
    isPaused: boolean = false;
    panicEnable = false;
    timerTick: number;

    constructor(
        private timerGateWay: TimerGateway,
        private eventEmitter: EventEmitter2,
        roomId: string,
    ) {
        this.roomid = roomId;
    }

    initializeTimer(duration: number) {
        this.panicEnable = false;
        this.time = duration;
        this.canEnablePanicMode();
    }

    canEnablePanicMode() {
        if (this.time === QCM_PANIC) this.eventEmitter.emit('canActivatePanicMode', this.roomid, 'QCM');
        if (this.time === QRL_PANIC) this.eventEmitter.emit('canActivatePanicMode', this.roomid, 'QRL');
    }

    activatePanic() {
        this.panicEnable = true;
    }

    disablePanic() {
        this.panicEnable = false;
    }

    startTimer(mode: string) {
        if (this.countDown) return;
        this.timerTick = this.panicEnable ? FOUR_TIMES_FASTER : ONE_SECOND_DELAY;
        this.countDown = setInterval(() => {
            if (this.time > 0) {
                this.timerGateWay.sendTimerValue(this.roomid, this.time);
                this.time--;
                this.canEnablePanicMode();
                this.changeTimerSpeed(mode);
            } else {
                this.disablePanic();
                this.clearTimer();
                this.timerGateWay.sendTimerValue(this.roomid, 0);
                this.timerStateHandler(mode);
            }
        }, this.timerTick);
    }

    changeTimerSpeed(mode: string) {
        if (this.panicEnable && this.timerTick !== FOUR_TIMES_FASTER) {
            this.timerTick = FOUR_TIMES_FASTER;
            this.clearTimer();
            this.startTimer(mode);
        } else if (!this.panicEnable && this.timerTick !== ONE_SECOND_DELAY) {
            this.timerTick = ONE_SECOND_DELAY;
            this.clearTimer();
            this.startTimer(mode);
        }
    }

    timerStateHandler(mode: string) {
        switch (mode) {
            case TimerState.Test: {
                this.eventEmitter.emit(TimerEvent.TimerDone, this.roomid);
                break;
            }
            case TimerState.Transition5s: {
                this.eventEmitter.emit(TimerEvent.TimerHit0, this.roomid);
                break;
            }
            case TimerState.TransitionQuestion: {
                this.eventEmitter.emit(TimerEvent.OrgChangeQuestion, this.roomid);
                break;
            }
            case TimerState.Attendre: {
                this.eventEmitter.emit(TimerEvent.WaitVerify, this.roomid);
                break;
            }
            // No default
        }
    }

    clearTimer() {
        clearInterval(this.countDown);
        this.countDown = undefined;
    }

    finishTimer() {
        this.time = 0;
    }
}
