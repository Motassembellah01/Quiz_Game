import { Record } from '@app/model/database/record';
import { RecordService } from '@app/services/record/record.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { RecordController } from './record.controller';
describe('RecordController', () => {
    let controller: RecordController;
    let recordService: SinonStubbedInstance<RecordService>;

    beforeEach(async () => {
        recordService = createStubInstance(RecordService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RecordController],
            providers: [
                {
                    provide: RecordService,
                    useValue: recordService,
                },
            ],
        }).compile();

        controller = module.get<RecordController>(RecordController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allRecords() should get all the records from the db and return a list', async () => {
        const fakeRecord = [new Record(), new Record()];

        recordService.getRecords.resolves(fakeRecord);

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (records) => {
            expect(records).toEqual(fakeRecord);
            return res;
        };

        await controller.allRecords(res);
    });

    it('should return an error NOT_FOUND if the srvice was unable to get the dat from the db', async () => {
        recordService.getRecords.rejects();

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allRecords(res);
    });

    it('should delete records by calling the recordService and return a NO_CONTENT status', async () => {
        recordService.getRecords.resolves();

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;

        await controller.records(res);
    });

    it('should delete records by calling the recordService and return a INTERNAL_SERVER_ERROR status if unable', async () => {
        recordService.getRecords.rejects();

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.records(res);
    });

    it('should not sort records and not call the recordService and return a NOT_FOUND if the queries are wrong', async () => {
        recordService.getRecords.rejects();

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.sortedNameRecords(res, '', '');
    });

    it('should sort the records by name in ascending order', async () => {
        const fakeRecord = [new Record(), new Record()];
        recordService.getRecordSorted.resolves(fakeRecord);

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (records) => {
            expect(records).toEqual(fakeRecord);
            return res;
        };

        await controller.sortedNameRecords(res, 'asc', 'name');
    });

    it('should sort the records by name in descending order', async () => {
        const fakeRecord = [new Record(), new Record()];
        recordService.getRecordSorted.resolves(fakeRecord);

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (records) => {
            expect(records).toEqual(fakeRecord);
            return res;
        };

        await controller.sortedNameRecords(res, 'desc', 'name');
    });

    it('should sort the records by date in ascending order', async () => {
        const fakeRecord = [new Record(), new Record()];
        recordService.getRecordSorted.resolves(fakeRecord);

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (records) => {
            expect(records).toEqual(fakeRecord);
            return res;
        };

        await controller.sortedNameRecords(res, 'asc', 'date');
    });

    it('should sort the records by date in descending order', async () => {
        const fakeRecord = [new Record(), new Record()];
        recordService.getRecordSorted.resolves(fakeRecord);

        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (records) => {
            expect(records).toEqual(fakeRecord);
            return res;
        };

        await controller.sortedNameRecords(res, 'desc', 'date');
    });
});
