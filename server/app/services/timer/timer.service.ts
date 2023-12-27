import { TimerGateway } from '@app/gateways/timer.gateway';
import { Timer } from '@app/model/timer/timer';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TimerService {
    timers: Map<string, Timer> = new Map();

    constructor(
        private timerGateWay: TimerGateway,
        private eventEmitter: EventEmitter2,
    ) {}

    initializeTimer(roomId: string) {
        const timer = new Timer(this.timerGateWay, this.eventEmitter, roomId);
        if (timer) {
            this.timers.set(roomId, timer);
        }
    }

    setTimerDuration(roomId: string, duration: number) {
        const timer = this.timers.get(roomId);
        if (timer) {
            timer.initializeTimer(duration);
        }
    }

    startTimerRoom(roomId: string, mode: string) {
        const timer = this.timers.get(roomId);
        if (timer) {
            timer.startTimer(mode);
        }
    }

    clearTimerRoom(roomId: string) {
        const timer = this.timers.get(roomId);
        if (timer) {
            timer.clearTimer();
        }
    }

    deleteTimer(roomId: string) {
        this.clearTimerRoom(roomId);
        this.timers.delete(roomId);
    }

    finishTimer(roomId: string) {
        const timer = this.timers.get(roomId);
        if (timer) {
            timer.finishTimer();
        }
    }

    activatePanic(roomId: string) {
        const timer = this.timers.get(roomId);
        if (timer) {
            timer.activatePanic();
        }
    }
}
