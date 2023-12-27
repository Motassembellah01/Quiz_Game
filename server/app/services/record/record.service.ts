/* eslint-disable @typescript-eslint/naming-convention */
// variable du field de mongoose
import { Record, RecordDocument } from '@app/model/database/record';
import { RecordDto } from '@app/model/dto/record.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RecordService {
    constructor(@InjectModel(Record.name) public recordModel: Model<RecordDocument>) {}

    async addRecord(record: RecordDto) {
        const parsedDate = this.formatDate(record.date);
        record.date = parsedDate;
        await this.recordModel.create(record);
    }

    async resetRecords() {
        await this.recordModel.deleteMany({});
    }

    async getRecords(): Promise<Record[]> {
        return this.recordModel.find({}, { __v: 0, _id: 0 });
    }

    async getRecordSorted(order: string, field: string): Promise<Record[]> {
        const sortOptions = {};
        sortOptions[field] = order;
        return await this.recordModel.find({}, { __v: 0, _id: 0 }).sort(sortOptions).collation({ locale: 'en', strength: 2 });
    }

    formatDate(date: string) {
        const dateObj = new Date(date);
        const options = { timeZone: 'America/Toronto' };
        const localDate = new Date(dateObj.toLocaleString('en-US', options));

        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const hour = String(localDate.getHours()).padStart(2, '0');
        const minute = String(localDate.getMinutes()).padStart(2, '0');
        const second = String(localDate.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
}
