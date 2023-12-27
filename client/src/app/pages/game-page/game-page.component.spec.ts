import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { QuizComponent } from '@app/pages/quiz-page/quiz-page.component';
import { GamesService } from '@app/services/games.service';
import { PlayerService } from '@app/services/player.service';
import { QuizService } from '@app/services/quiz.service';
import { SharedService } from '@app/services/shared.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

const mockQuizList = [
    {
        id: '3c42vj',
        title: 'Quiz Test 1',
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
        visibility: true,
    },
];

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let routerSpy: SpyObj<Router>;
    let playerService: jasmine.SpyObj<PlayerService>;
    let gamesService: jasmine.SpyObj<GamesService>;
    let quizService: jasmine.SpyObj<QuizService>;
    let sharedService: jasmine.SpyObj<SharedService>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        playerService = jasmine.createSpyObj('PlayerService', ['createGame']);
        gamesService = jasmine.createSpyObj('GamesService', ['createNewRoom']);
        quizService = jasmine.createSpyObj('QuizService', ['getVisibleQuiz', 'isGameExist']);
        sharedService = jasmine.createSpyObj('SharedService', ['setSharedSelectedGame']);

        TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'Quiz/test', component: QuizComponent },
                    { path: 'lobby-page', component: LobbyPageComponent },
                ]),
            ],
            providers: [
                { provide: Router, usevalue: routerSpy },
                { provide: PlayerService, useValue: playerService },
                { provide: GamesService, useValue: gamesService },
                { provide: QuizService, useValue: quizService },
                { provide: SharedService, useValue: sharedService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        quizService.getVisibleQuiz.and.returnValue(of(mockQuizList));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get the visible quiz onInit', () => {
        component.ngOnInit();

        expect(quizService.getVisibleQuiz).toHaveBeenCalled();
        expect(component.quizList).toEqual(mockQuizList);
    });

    it('should get a quiz by the title', () => {
        component.ngOnInit();
        const quiz = component.getGame(mockQuizList[1].title);

        expect(quiz).toEqual(mockQuizList[1]);
    });

    it('should select a game by the title', () => {
        component.ngOnInit();
        const quiz = component.getGame(mockQuizList[1].title);
        component.selectGame(mockQuizList[1].title);

        if (quiz) {
            expect(component.selectedGame).toEqual(quiz);
            expect(component.selectedQuizDescription).toEqual(quiz.description);
            expect(component.quizTime).toEqual(quiz.duration.toString() + 's/question');
            expect(component.actualGame).toEqual(quiz.title);
            expect(component.isButtonsDisabled).toBeFalse();
        }
    });

    it('should check if the game exists and display error', () => {
        component.ngOnInit();
        component.selectGame(mockQuizList[1].title);
        quizService.isGameExist.and.returnValue(of(false));

        component.canPlay();
        expect(component.errorMsg).toEqual([`Le jeu ${component.selectedGame.title} à été enlever.Veuillir choisir un autre jeu!`]);
    });

    it('should check if the game exists before try it', () => {
        component.ngOnInit();
        component.selectGame(mockQuizList[1].title);
        quizService.isGameExist.and.returnValue(of(true));

        component.canPlay();
        expect(component.gameExist).toBeTrue();
    });

    it('should reload visible quiz when close message', () => {
        component.ngOnInit();
        component.closeMessage();
        expect(quizService.getVisibleQuiz).toHaveBeenCalled();
        expect(component.dataSource).toEqual([]);
        expect(component.errorMsg).toEqual([]);
    });

    it('should create a room and navigate to wait page when create game', () => {
        component.ngOnInit();
        component.selectGame(mockQuizList[1].title);
        component.createGame();
        expect(playerService.isOrganizer).toBeTrue();
        expect(gamesService.createNewRoom).toHaveBeenCalledWith(mockQuizList[1]);
    });
});
