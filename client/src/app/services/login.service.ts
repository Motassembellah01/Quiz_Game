import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const serviceURL = '/api/login';

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    readonly baseUrl: string = environment.serverUrl;
    constructor(private httpClient: HttpClient) {}

    verifyLoginPass(passwordToSend: string) {
        return this.httpClient.post<boolean>(`${this.baseUrl}${serviceURL}`, { password: passwordToSend });
    }
}
