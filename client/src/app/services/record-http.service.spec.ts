import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Record } from '@common/interfaces/record';
import { RecordHtppService } from './record-http.service';

const recordsMock: Record[] = [
    {
        name: 'test',
        date: '2023-10-05 23:12:48',
        totalPlayer: 2,
        bestScore: 100,
    },
    {
        name: 'test1',
        date: '2023-10-05 22:12:48',
        totalPlayer: 3,
        bestScore: 100,
    },
];

const RECORD_URL = '/api/record';

describe('RecordHttpService', () => {
    let service: RecordHtppService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(RecordHtppService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return records', () => {
        service.getRecords().subscribe((records) => {
            expect(records).toEqual(recordsMock);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}${RECORD_URL}`);
        expect(req.request.method).toBe('GET');
        req.flush(recordsMock);
    });

    it('should return sorted records', () => {
        service.getRecordSorted('', '').subscribe((records) => {
            expect(records).toEqual(recordsMock);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}${RECORD_URL}/sorted?sortBy=&field=`);
        expect(req.request.method).toBe('GET');
        req.flush(recordsMock);
    });

    it('should reset records', () => {
        service.resetRecords().subscribe((res) => expect(res).toEqual({}));
        const req = httpTestingController.expectOne(`${service.baseUrl}${RECORD_URL}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });
});
