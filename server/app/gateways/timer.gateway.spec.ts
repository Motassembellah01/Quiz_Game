import { FIFTY } from '@common/constantes/constantes';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { TimerGateway } from './timer.gateway';

describe('TimerGateway', () => {
    let gateway: TimerGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: Socket,
                    useValue: socket,
                },
            ],
        }).compile();

        gateway = module.get<TimerGateway>(TimerGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should send timer value to a room', () => {
        const roomId = 'testRoom';
        const time = FIFTY;

        server.to.returns({
            emit: (event: string, timeValue: number) => {
                expect(event).toEqual('timerTick');
                expect(timeValue).toEqual(FIFTY);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.sendTimerValue(roomId, time);
    });
});
