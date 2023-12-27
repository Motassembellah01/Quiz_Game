import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quiz } from '@common/interfaces/quiz';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
const serviceURL = '/api/games';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    readonly baseUrl: string = environment.serverUrl;
    constructor(private httpClient: HttpClient) {}

    getQuizzes() {
        const stuff = this.httpClient.get<Quiz[]>(`${this.baseUrl}${serviceURL}`);
        return stuff;
    }

    addQuizFromFile(jsonObj: object): Observable<HttpResponse<string>> {
        return this.httpClient
            .post(`${this.baseUrl}${serviceURL}/file`, jsonObj, { observe: 'response', responseType: 'text' })
            .pipe(catchError(this.handleError));
    }

    getVisibleQuiz() {
        const stuff = this.httpClient.get<Quiz[]>(`${this.baseUrl}${serviceURL}/visibility`);
        return stuff;
    }

    deleteQuiz(id: string) {
        return this.httpClient.delete(`${this.baseUrl}${serviceURL}/${id}`);
    }

    updateVisibility(id: string) {
        return this.httpClient.patch(`${this.baseUrl}${serviceURL}/visibility/${id}`, '');
    }

    modifyGame(game: Quiz, id: string) {
        return this.httpClient.put(`${this.baseUrl}${serviceURL}/modify/${id}`, game);
    }

    addGame(quiz: Quiz) {
        return this.httpClient.put(`${this.baseUrl}${serviceURL}/`, quiz);
    }

    getTitleUnique(title: string): Observable<boolean> {
        return this.httpClient.get<boolean>(`${this.baseUrl}${serviceURL}/title${title}`);
    }

    isGameExist(id: string): Observable<boolean> {
        return this.httpClient.get<boolean>(`${this.baseUrl}${serviceURL}/exist${id}`);
    }

    handleError(error: HttpErrorResponse) {
        return throwError(() => JSON.parse(error.error).message);
    }
}
