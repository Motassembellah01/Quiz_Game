import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Record } from '@common/interfaces/record';
import { environment } from 'src/environments/environment';
const RECORD_URL = '/api/record';

@Injectable({
    providedIn: 'root',
})
export class RecordHtppService {
    readonly baseUrl: string = environment.serverUrl;
    constructor(private httpClient: HttpClient) {}

    getRecords() {
        return this.httpClient.get<Record[]>(`${this.baseUrl}${RECORD_URL}`);
    }

    getRecordSorted(order: string, field: string) {
        return this.httpClient.get<Record[]>(`${this.baseUrl}${RECORD_URL}/sorted?sortBy=${order}&field=${field}`);
    }

    resetRecords() {
        return this.httpClient.delete(`${this.baseUrl}${RECORD_URL}`);
    }
}
