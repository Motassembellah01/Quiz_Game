import { RecordService } from '@app/services/record/record.service';
import { Controller, Delete, Get, HttpStatus, Query, Res } from '@nestjs/common';

@Controller('record')
export class RecordController {
    constructor(private readonly recordService: RecordService) {}

    @Get('/')
    async allRecords(@Res() response) {
        try {
            const records = await this.recordService.getRecords();
            response.status(HttpStatus.OK).json(records);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/sorted')
    async sortedNameRecords(@Res() response, @Query('sortBy') sortBy: string, @Query('field') field: string) {
        try {
            const sortedRecords = await this.recordService.getRecordSorted(sortBy.toLowerCase(), field.toLowerCase());
            response.status(HttpStatus.OK).json(sortedRecords);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Delete('/')
    async records(@Res() response) {
        try {
            await this.recordService.resetRecords();
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
        }
    }
}
