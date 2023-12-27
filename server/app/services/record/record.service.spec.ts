import { Record, RecordDocument, recordSchema } from '@app/model/database/record';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { RecordService } from './record.service';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('RecordService', () => {
    let service: RecordService;
    let recordModel: Model<RecordDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module: TestingModule = await Test.createTestingModule({
            providers: [RecordService],
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Record.name, schema: recordSchema }]),
            ],
        }).compile();

        service = module.get<RecordService>(RecordService);
        recordModel = module.get<Model<RecordDocument>>(getModelToken(Record.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        // The database get auto populated in the constructor
        // We want to make sur we close the connection after the database got
        // populated. So we add small delay
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should add a record to the db', async () => {
        await service.addRecord(fakeRecord);
        expect((await recordModel.find()).length).toEqual(1);
    });

    it('should get all the records form the db', async () => {
        await service.addRecord(fakeRecord);
        await service.getRecords();
        expect((await service.getRecords()).length).toEqual(1);
    });

    it('should reset the records in the db', async () => {
        await service.addRecord(fakeRecord);
        await service.addRecord(fakeRecord2);
        expect((await service.getRecords()).length).toEqual(2);
        await service.resetRecords();
        await service.getRecords();
        expect((await service.getRecords()).length).toEqual(0);
    });

    it('should sort the records by name in ascending order', async () => {
        await service.addRecord(fakeRecord);
        await service.addRecord(fakeRecord2);
        expect((await service.getRecords()).length).toEqual(2);
        const sortedRecords = await service.getRecordSorted('asc', 'name');
        expect(JSON.stringify(sortedRecords)).toBe(JSON.stringify([fakeRecord2, fakeRecord]));
    });

    it('should sort the records by name in descending order', async () => {
        await service.addRecord(fakeRecord);
        await service.addRecord(fakeRecord2);
        expect((await service.getRecords()).length).toEqual(2);
        const sortedRecords = await service.getRecordSorted('desc', 'name');
        expect(JSON.stringify(sortedRecords)).toBe(JSON.stringify([fakeRecord, fakeRecord2]));
    });

    it('should sort the records by date in ascending order', async () => {
        const fakeRecordDate = {
            name: 'test',
            date: new Date('2023-01-01T12:00:00').toISOString(),
            totalPlayer: 2,
            bestScore: 100,
        };

        const fakeRecordDate2 = {
            name: 'allo',
            date: new Date('2023-02-01T15:30:00').toISOString(),
            totalPlayer: 3,
            bestScore: 100,
        };
        await service.addRecord(fakeRecordDate);
        await service.addRecord(fakeRecordDate2);
        expect((await service.getRecords()).length).toEqual(2);
        const sortedRecords = await service.getRecordSorted('asc', 'date');
        const formattedDate1 = service.formatDate('2023-01-01T12:00:00');
        const formattedDate2 = service.formatDate('2023-02-01T15:30:00');

        expect(sortedRecords[0].date).toBe(formattedDate1);
        expect(sortedRecords[1].date).toBe(formattedDate2);
    });

    it('should sort the records by date in descending order', async () => {
        const fakeRecordDate = {
            name: 'test',
            date: new Date('2023-01-01T12:00:00').toISOString(),
            totalPlayer: 2,
            bestScore: 100,
        };

        const fakeRecordDate2 = {
            name: 'allo',
            date: new Date('2023-02-01T15:30:00').toISOString(),
            totalPlayer: 3,
            bestScore: 100,
        };
        await service.addRecord(fakeRecordDate);
        await service.addRecord(fakeRecordDate2);
        expect((await service.getRecords()).length).toEqual(2);
        const sortedRecords = await service.getRecordSorted('desc', 'date');
        const formattedDate1 = service.formatDate('2023-01-01T12:00:00');
        const formattedDate2 = service.formatDate('2023-02-01T15:30:00');

        expect(sortedRecords[0].date).toBe(formattedDate2);
        expect(sortedRecords[1].date).toBe(formattedDate1);
    });

    it('should format the date to the local timezone time with an iso format using a pattern matching', () => {
        const mockDateObject = new Date('2021-02-26T20:42:16.652Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDateObject);
        const formatetDate = service.formatDate(mockDateObject.toISOString());
        expect(formatetDate).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
});

const fakeRecord = {
    name: 'test',
    date: new Date().toISOString(),
    totalPlayer: 2,
    bestScore: 100,
};

const fakeRecord2 = {
    name: 'allo',
    date: new Date().toISOString(),
    totalPlayer: 3,
    bestScore: 100,
};
