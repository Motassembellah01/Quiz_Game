import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CODE_BAD_REQUEST, CODE_OK } from '@common/constantes/constantes';
import { QuizService } from './quiz.service';

const games = [
    {
        id: 'xc42vi',
        title: 'Quiz Test 1',
        duration: 10,
        lastModification: '2023-09-24T16:22:51',
        description: 'Ceci est une description pour le Quiz Test 1',
        questions: [
            {
                choices: [
                    {
                        isCorrect: true,
                        text: 'Choix 1',
                    },
                    {
                        isCorrect: false,
                        text: 'Choix 2',
                    },
                    {
                        isCorrect: false,
                        text: 'Choix 3',
                    },
                ],
                points: 10,
                text: 'Quelle est la réponse ?',
                type: 'QCM',
            },
        ],
        visibility: true,
    },
    {
        id: '3c42vj',
        title: 'Quiz Test 2',
        duration: 15,
        lastModification: '2023-09-24T16:22:30',
        description: 'Ceci est une description pour le Quiz Test 2',
        questions: [
            {
                choices: [
                    {
                        isCorrect: true,
                        text: 'Choix 1',
                    },
                    {
                        isCorrect: false,
                        text: 'Choix 2',
                    },
                    {
                        isCorrect: false,
                        text: 'Choix 3',
                    },
                ],
                points: 10,
                text: 'Quelle est la réponse ?',
                type: 'QCM',
            },
        ],
        visibility: false,
    },
];
const serviceURL = '/api/games';

describe('QuizService', () => {
    let service: QuizService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuizService],
        });

        service = TestBed.inject(QuizService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get quizzes', () => {
        const dummyQuizzes = games;

        service.getQuizzes().subscribe((quizzes) => {
            expect(quizzes).toEqual(dummyQuizzes);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyQuizzes);
    });

    it('should get visible quizzes', () => {
        const dummyQuizzes = games;

        service.getVisibleQuiz().subscribe((quizzes) => {
            expect(quizzes).toEqual(dummyQuizzes);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/visibility`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyQuizzes);
    });

    it('should add quiz from file', () => {
        const jsonObj = {};

        service.addQuizFromFile(jsonObj).subscribe((res) => {
            expect(res.status).toBe(CODE_OK);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/file`);
        expect(req.request.method).toBe('POST');
        req.flush({});
    });

    it('should add quiz from file with pipe', () => {
        const jsonObj = {};
        const responseText = 'Success';

        service.addQuizFromFile(jsonObj).subscribe((res: HttpResponse<string>) => {
            expect(res.status).toBe(CODE_OK);
            expect(res.body).toBe(responseText);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/file`);
        expect(req.request.method).toBe('POST');

        req.flush(responseText, { status: CODE_OK, statusText: 'OK' });
    });

    it('should handle errors', () => {
        spyOn(service, 'handleError').and.callThrough();
        const responseText = 'Fail';
        const errorResponse = new HttpErrorResponse({
            error: JSON.stringify({ message: responseText }),
            status: CODE_BAD_REQUEST,
            statusText: 'Bad Request',
        });
        // eslint-disable-next-line deprecation/deprecation
        service.handleError(errorResponse).subscribe(
            () => {
                fail('Expected an error, but got a result');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error: any) => {
                expect(error).toEqual(responseText);
            },
        );
    });

    it('should delete quiz', () => {
        service.deleteQuiz('xc42vi').subscribe((res) => expect(res).toEqual({}));
        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/${'xc42vi'}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });

    it('should add quiz', () => {
        service.addGame(games[0]).subscribe((res) => expect(res).toEqual({}));
        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/`);
        expect(req.request.method).toBe('PUT');
        req.flush({});
    });

    it('Should update visibility of quiz', () => {
        service.updateVisibility('xc42vi').subscribe((res) => expect(res).toEqual({}));
        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/visibility/${'xc42vi'}`);
        expect(req.request.method).toBe('PATCH');
        req.flush({});
    });

    it('Should modify game', () => {
        const modifyQuiz = games[0];
        modifyQuiz.title = 'Quiz modifié';

        service.modifyGame(modifyQuiz, modifyQuiz.id).subscribe((res) => expect(res).toEqual({}));
        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/modify/${'xc42vi'}`);
        expect(req.request.method).toBe('PUT');
        req.flush({});
    });

    it('Should know if a title is unique', () => {
        service.getTitleUnique(games[0].title).subscribe((res) => expect(res).toBeTruthy());
        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/title${games[0].title}`);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('Should know if a game exist', () => {
        service.isGameExist(games[0].id).subscribe((res) => expect(res).toBeTruthy());
        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}/exist${games[0].id}`);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should handle client-side error', () => {
        const errorMessage = 'A client-side error occurred.';
        const errorResponse = new HttpErrorResponse({
            error: errorMessage,
            status: 0,
        });

        const result = service['handleError'](errorResponse);

        expect(result).toEqual(jasmine.any(Object));
    });

    it('should handle server-side error', () => {
        const message: string[] = ['500'];
        const errorMessage: JSON = JSON.parse(message.toString());
        const errorResponse = new HttpErrorResponse({
            error: errorMessage,
            status: 500,
        });

        const result = service['handleError'](errorResponse);

        expect(result).toEqual(jasmine.any(Object));
    });

    it('should handle unknown error', () => {
        const message: string[] = ['404'];
        const errorMessage: JSON = JSON.parse(message.toString());
        const errorResponse = new HttpErrorResponse({
            error: errorMessage,
            status: 404,
        });

        const result = service['handleError'](errorResponse);

        expect(result).toEqual(jasmine.any(Object));
    });

    afterEach(() => {
        httpTestingController.verify();
    });
});
