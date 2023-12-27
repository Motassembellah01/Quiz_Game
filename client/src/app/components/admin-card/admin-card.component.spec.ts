import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogService } from '@app/services/dialog.service';
import { QuizService } from '@app/services/quiz.service';
import { SharedService } from '@app/services/shared.service';
import { WAIT_TIME } from '@common/constantes/constantes';
import { of, throwError } from 'rxjs';
import { AdminCardComponent } from './admin-card.component';
import SpyObj = jasmine.SpyObj;

const mockQuiz = {
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
};

describe('AdminCardComponent', () => {
    let component: AdminCardComponent;
    let fixture: ComponentFixture<AdminCardComponent>;
    let quizServiceSpy: SpyObj<QuizService>;
    let sharedServiceSpy: SpyObj<SharedService>;
    let routerSpy: SpyObj<Router>;
    let dialogService: jasmine.SpyObj<DialogService>;

    beforeEach(waitForAsync(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['updateVisibility', 'deleteQuiz']);
        sharedServiceSpy = jasmine.createSpyObj('SharedService', ['setSharedIsEditMode', 'setSharedSelectedGame']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
        TestBed.configureTestingModule({
            declarations: [AdminCardComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [MatDialogModule],
            providers: [
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: SharedService, useValue: sharedServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: DialogService, useValue: dialogService },
            ],
        });
        fixture = TestBed.createComponent(AdminCardComponent);
        component = fixture.componentInstance;
        component.quiz = mockQuiz;
        fixture.detectChanges();
        dialogService.openDialog.and.returnValue(of('true'));
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a Quiz', () => {
        expect(component.quiz).toBeDefined();
    });

    it('should onDestroy revoke the url to destroy the ressource', () => {
        const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL');
        component.ngOnDestroy();
        expect(revokeObjectURLSpy).toHaveBeenCalledWith(component.url);
    });

    it('should OnInit create the url and the fileNam', () => {
        spyOn(component, 'exportJSON');
        component.ngOnInit();
        expect(component.exportJSON).toHaveBeenCalled();
        expect(component.url).toBeDefined();
        expect(component.fileName).toBeDefined();
    });

    it('should call toggleVisibility when visibility button is clicked', () => {
        const toggleButton = fixture.nativeElement.querySelector('#visibilityButton');
        quizServiceSpy.updateVisibility.and.returnValue(of({}));

        toggleButton.click();

        expect(quizServiceSpy.updateVisibility).toHaveBeenCalledOnceWith(component.quiz.id);
    });

    it('should call deleteQuiz when delete button is clicked', () => {
        const deleteButton = fixture.nativeElement.querySelector('#deleteButton');
        quizServiceSpy.deleteQuiz.and.returnValue(of({}));

        deleteButton.click();

        expect(quizServiceSpy.deleteQuiz).toHaveBeenCalledOnceWith(component.quiz.id);
    });

    it('should make an error if deleteQuiz is called with inexitent id', () => {
        const deleteButton = fixture.nativeElement.querySelector('#deleteButton');
        const errorMessage = 'Error message';
        // eslint-disable-next-line deprecation/deprecation
        quizServiceSpy.deleteQuiz.and.returnValue(throwError({ error: { message: errorMessage } }));
        const deleteErrorSpy = spyOn(component.deleteError, 'emit');

        deleteButton.click();

        expect(quizServiceSpy.deleteQuiz).toHaveBeenCalled();
        expect(deleteErrorSpy).toHaveBeenCalled();
    });

    it('should call exportJSON when download button is clicked', () => {
        const downloadButton = fixture.nativeElement.querySelector('#downloadButton');
        const exportAnchor = fixture.nativeElement.querySelector('#export');
        spyOn(exportAnchor, 'click');

        downloadButton.click();
        // eslint-disable-next-line deprecation/deprecation
        expect(exportAnchor.download).toBe('Questionnaire sur inf3405 2.json');
        expect(exportAnchor.href).toContain('http://localhost');
        expect(exportAnchor.click).toHaveBeenCalled();
    });

    it('should call editGame with the correct quiz when the edit button is pressed', fakeAsync(() => {
        const editButton = fixture.nativeElement.querySelector('#editButton');

        sharedServiceSpy.setSharedIsEditMode.and.stub();
        sharedServiceSpy.setSharedSelectedGame.and.stub();
        routerSpy.navigate.and.stub();

        component.quiz = mockQuiz;

        editButton.click();
        tick(WAIT_TIME);

        expect(sharedServiceSpy.setSharedIsEditMode).toHaveBeenCalledWith(true);
        expect(sharedServiceSpy.setSharedSelectedGame).toHaveBeenCalledWith(mockQuiz);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/create-quiz']);
    }));
});
