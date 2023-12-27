import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { AdminCardComponent } from '@app/components/admin-card/admin-card.component';
import { AuthComponent } from '@app/components/auth/auth.component';
import { ErrorMessageComponent } from '@app/components/error-message/error-message.component';
import { ImportGameComponent } from '@app/components/import-game/import-game.component';
import { SidenavComponent } from '@app/components/sidenav/sidenav.component';
import { LoginService } from '@app/services/login.service';
import { QuizService } from '@app/services/quiz.service';
import { SharedService } from '@app/services/shared.service';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import SpyObj = jasmine.SpyObj;

const mockQuizList = [
    {
        id: '1a2b3c',
        title: 'Questionnaire sur inf3405 2',
        duration: 60,
        lastModification: '2018-11-13T20:20:39+00:00',
        description: 'hi',
        questions: [
            {
                type: 'QCM',
                text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                points: 40,
                choices: [
                    {
                        text: 'var',
                        isCorrect: false,
                    },
                    {
                        text: 'self',
                        isCorrect: false,
                    },
                    {
                        text: 'this',
                        isCorrect: false,
                    },
                    {
                        text: 'int',
                        isCorrect: true,
                    },
                ],
            },
            {
                type: 'QCM',
                text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 20,
                choices: [
                    {
                        text: 'Non',
                        isCorrect: true,
                    },
                    {
                        text: 'Oui',
                        isCorrect: false,
                    },
                ],
            },
        ],
    },
    {
        id: '4a5b6c',
        title: 'Questionnaire sur inf3405',
        duration: 60,
        lastModification: '2018-11-13T20:20:39+00:00',
        description: 'hi',
        questions: [
            {
                type: 'QCM',
                text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                points: 40,
                choices: [
                    {
                        text: 'var',
                        isCorrect: false,
                    },
                    {
                        text: 'self',
                        isCorrect: false,
                    },
                    {
                        text: 'this',
                        isCorrect: false,
                    },
                    {
                        text: 'int',
                        isCorrect: true,
                    },
                ],
            },
            {
                type: 'QCM',
                text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 20,
                choices: [
                    {
                        text: 'Non',
                        isCorrect: true,
                    },
                    {
                        text: 'Oui',
                        isCorrect: false,
                    },
                ],
            },
        ],
    },
];
const mockQuizListUpdate = [
    {
        id: '4a5b6c',
        title: 'Questionnaire sur inf3405',
        duration: 60,
        lastModification: '2018-11-13T20:20:39+00:00',
        description: 'hi',
        questions: [
            {
                type: 'QCM',
                text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                points: 40,
                choices: [
                    {
                        text: 'var',
                        isCorrect: false,
                    },
                    {
                        text: 'self',
                        isCorrect: false,
                    },
                    {
                        text: 'this',
                        isCorrect: false,
                    },
                    {
                        text: 'int',
                        isCorrect: true,
                    },
                ],
            },
            {
                type: 'QCM',
                text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 20,
                choices: [
                    {
                        text: 'Non',
                        isCorrect: true,
                    },
                    {
                        text: 'Oui',
                        isCorrect: false,
                    },
                ],
            },
        ],
    },
];

describe('AdminComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let sidenavComponent: SidenavComponent;
    let sidenavComponentDebugElement: DebugElement;
    let admincardComponent: AdminCardComponent;
    let admincardComponentDebugElement: DebugElement;
    let errormessageComponent: ErrorMessageComponent;
    let errormessageComponentDebugElement: DebugElement;
    let importgameComponent: ImportGameComponent;
    let importgameComponentDebugElement: DebugElement;
    let authComponent: AuthComponent;
    let authComponentDebugElement: DebugElement;
    let quizServiceSpy: SpyObj<QuizService>;
    let sharedServiceSpy: SpyObj<SharedService>;
    let loginServiceSpy: SpyObj<LoginService>;

    beforeEach(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['getQuizzes']);
        sharedServiceSpy = jasmine.createSpyObj('SharedService', ['getSharedIsAdminConnected', 'setSharedIsAdminConnected']);
        quizServiceSpy.getQuizzes.and.returnValue(of(mockQuizList));
        loginServiceSpy = jasmine.createSpyObj('LoginService', ['verifyLoginPass']);
        TestBed.configureTestingModule({
            declarations: [AdminPageComponent, SidenavComponent, AdminCardComponent, ImportGameComponent, ErrorMessageComponent, AuthComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: SharedService, useValue: sharedServiceSpy },
                { provide: LoginService, useValue: loginServiceSpy },
            ],
            imports: [MatDialogModule],
        });
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        component.connected = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should have a Quiz list', () => {
        expect(component.quizList).toBeDefined();
    });

    it('should call updatePage in constructor', () => {
        expect(component.quizList).toEqual(mockQuizList);
    });

    it('should call changeViewAdmin() when the event showImportViewEvent is sent to the admin page', () => {
        sidenavComponentDebugElement = fixture.debugElement.query(By.directive(SidenavComponent));
        sidenavComponent = sidenavComponentDebugElement.componentInstance;

        sidenavComponent.showImportViewEvent.emit();

        expect(component.showImportView).toBe(true);
        expect(component.showGameList).toBe(false);
    });

    it('should call changeToGameList() when the event showGameListEvent is sent to the admin page', () => {
        component.changeViewAdmin();

        sidenavComponentDebugElement = fixture.debugElement.query(By.directive(SidenavComponent));
        sidenavComponent = sidenavComponentDebugElement.componentInstance;

        sidenavComponent.showGameListEvent.emit();

        expect(component.showImportView).toBe(false);
        expect(component.showGameList).toBe(true);
    });

    it('should updatePage when called', () => {
        quizServiceSpy.getQuizzes.and.returnValue(of(mockQuizListUpdate));
        component.updatePage();
        expect(component.quizList).toEqual(mockQuizListUpdate);
    });

    it('should show an error if a deleteError event is sent', () => {
        admincardComponentDebugElement = fixture.debugElement.query(By.directive(AdminCardComponent));
        admincardComponent = admincardComponentDebugElement.componentInstance;

        const erreur = ['Error 1', 'Error 2'];
        admincardComponent.deleteError.emit(erreur);

        expect(component.showErrorMessage).toBe(true);
        expect(component.giveErrorMessage).toEqual(erreur);
    });

    it('should show an error if an importError event is sent', () => {
        component.changeViewAdmin();
        fixture.detectChanges();

        importgameComponentDebugElement = fixture.debugElement.query(By.directive(ImportGameComponent));
        importgameComponent = importgameComponentDebugElement.componentInstance;

        const erreur = ['Error 1', 'Error 2'];
        importgameComponent.importErrorRequest.emit(erreur);

        expect(component.showErrorMessage).toBe(true);
        expect(component.giveErrorMessage).toEqual(erreur);
    });

    it('should call updatePage when the erreur message is closed', () => {
        const erreur = ['Error 1', 'Error 2'];
        component.errorHandler(erreur);
        fixture.detectChanges();
        spyOn(component, 'updatePage').and.callThrough();

        errormessageComponentDebugElement = fixture.debugElement.query(By.directive(ErrorMessageComponent));
        errormessageComponent = errormessageComponentDebugElement.componentInstance;

        errormessageComponent.closeMessage.emit();

        expect(component.showErrorMessage).toBe(false);
        expect(component.updatePage).toHaveBeenCalled();
    });

    it('should connect the Shared service when access is granted', () => {
        component.connected = false;
        fixture.detectChanges();
        sharedServiceSpy.getSharedIsAdminConnected.and.returnValue(true);

        authComponentDebugElement = fixture.debugElement.query(By.directive(AuthComponent));
        authComponent = authComponentDebugElement.componentInstance;

        authComponent.connect.emit();

        expect(sharedServiceSpy.setSharedIsAdminConnected).toHaveBeenCalledWith(true);
        expect(component.connected).toBe(true);
    });

    it('should show records', () => {
        component.showGameList = true;
        component.showImportView = false;
        component.showRecordList = false;

        component.changeToRecords();

        expect(component.showGameList).toBeFalse();
        expect(component.showImportView).toBeFalse();
        expect(component.showRecordList).toBeTrue();
    });

    it('should show game list', () => {
        component.showGameList = false;
        component.showImportView = true;
        component.showRecordList = false;

        component.changeToGameList();

        expect(component.showGameList).toBeTrue();
        expect(component.showImportView).toBeFalse();
        expect(component.showRecordList).toBeFalse();
    });

    it('should show admin view', () => {
        component.showGameList = false;
        component.showImportView = false;
        component.showRecordList = true;

        component.changeViewAdmin();

        expect(component.showGameList).toBeFalse();
        expect(component.showImportView).toBeTrue();
        expect(component.showRecordList).toBeFalse();
    });
});
