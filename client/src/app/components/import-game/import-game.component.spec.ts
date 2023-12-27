/* eslint-disable deprecation/deprecation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { QuizService } from '@app/services/quiz.service';
import { ONE_SECOND_DELAY } from '@common/constantes/constantes';
import { Quiz } from '@common/interfaces/quiz';
import { of, throwError } from 'rxjs';
import { ImportGameComponent } from './import-game.component';
import { validateTitle } from './validation-title';

const mockQuiz = `{
        "id": "ez655h",
        "title": "Questionnaire sur log244",
        "duration": 60,
        "lastModification": "2023-09-28T18:32:03",
        "description": "bye !",
        "questions": [
            {
                "type": "QCM",
                "text": "Parmi les mots suivants, lesquels sont des mots clés réservés en JS?",
                "points": 40,
                "choices": [
                    {
                        "text": "var",
                        "isCorrect": false
                    },
                    {
                        "text": "self",
                        "isCorrect": false
                    },
                    {
                        "text": "this",
                        "isCorrect": false
                    },
                    {
                        "text": "int",
                        "isCorrect": true
                    }
                ]
            },
            {
                "type": "QRL",
                "text": "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
                "points": 60,
                "choices": []
            },
            {
                "type": "QCM",
                "text": "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                "points": 20,
                "choices": [
                    {
                        "text": "Non",
                        "isCorrect": true
                    },
                    {
                        "text": "Oui",
                        "isCorrect": false
                    }
                ]
            }
        ]
    }`;
const mockBlob = new Blob([mockQuiz], { type: 'application/json' });
const mockFile = new File([mockBlob], 'mockfile.json', { type: 'application/json' });

describe('ImportGameComponent', () => {
    let component: ImportGameComponent;
    let fixture: ComponentFixture<ImportGameComponent>;
    let quizServiceSpy: SpyObj<QuizService>;
    let validator: ReturnType<any>;

    beforeEach(waitForAsync(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['addQuizFromFile', 'getTitleUnique']);
        TestBed.configureTestingModule({
            declarations: [ImportGameComponent],
            providers: [FormBuilder, { provide: QuizService, useValue: quizServiceSpy }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' })],
        });
        fixture = TestBed.createComponent(ImportGameComponent);
        component = fixture.componentInstance;
        quizServiceSpy = TestBed.inject(QuizService) as SpyObj<QuizService>;
        component.importForm = new FormBuilder().group({
            title: [''],
        });
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should upload file when event is triggered', () => {
        const readFileSpy = spyOn(component, 'readFile').and.stub();
        const event = { target: { files: [mockFile] } } as any;
        component.uploadFile(event);

        expect(component.isFileUploaded).toBe(true);
        expect(component.uploadedFile).toBe(mockFile);
        expect(component.fichierSelect).toBe('Fichier sélectionné : ');
        expect(readFileSpy).toHaveBeenCalled();
    });

    it('should change fileObj when readfile is called', async () => {
        component.isFileUploaded = true;
        component.uploadedFile = mockFile as any;
        component.fichierSelect = 'Fichier sélectionné : ';
        const result = JSON.parse(mockQuiz) as Quiz;
        result['visibility'] = false;

        await component.readFile();

        expect(component.fileObj).toEqual(result);
    });

    it('should handle error when readfile is called and the parsing fails', async () => {
        component.isFileUploaded = true;

        const invalidJsonContent = 'invalid json';
        const blob = new Blob([invalidJsonContent], { type: 'application/json' });
        component.uploadedFile = blob as any;

        const alertSpy = spyOn(window, 'alert').and.callThrough();
        await component.readFile();

        expect(alertSpy).toHaveBeenCalled();
    });

    it('should clear input fields when clearInput is called', () => {
        component.clearInput();

        expect(component.isTitleWrong).toBe(false);
        expect(component.isFileUploaded).toBe(false);
        expect(component.fichierSelect).toBe('Aucun fichier choisi');
        expect(component.importForm.get('title')?.value).toBe('');
    });

    it('should submit quiz when onSubmit is called', fakeAsync(() => {
        component.fileObj = JSON.parse(mockQuiz) as Quiz;
        const response = { status: 201 } as any;
        quizServiceSpy.addQuizFromFile.and.returnValue(of(response));
        const importFormGetSpy = spyOn(component.importForm, 'get').and.returnValue({
            value: 'Questionnaire sur log244',
        } as any);

        component.onSubmit();

        expect(quizServiceSpy.addQuizFromFile).toHaveBeenCalledWith(JSON.parse(mockQuiz) as Quiz);
        expect(component.fileCreated).toBe(true);
        expect(importFormGetSpy).toHaveBeenCalled();
        tick(ONE_SECOND_DELAY);
        expect(component.fileCreated).toBe(false);
    }));

    it("should handle error: 'titre du jeu n'est pas unique' when sending file to server", () => {
        component.fileObj = JSON.parse(mockQuiz) as Quiz;

        const errorResponse = ["le titre du jeu n'est pas unique"];
        quizServiceSpy.addQuizFromFile.and.returnValue(throwError(errorResponse));
        const importFormGetSpy = spyOn(component.importForm, 'get').and.returnValue({
            value: 'Questionnaire sur log244',
        } as any);

        component.onSubmit();

        expect(quizServiceSpy.addQuizFromFile).toHaveBeenCalledWith(JSON.parse(mockQuiz) as Quiz);
        expect(component.isTitleWrong).toBe(true);
        expect(importFormGetSpy).toHaveBeenCalled();
    });

    it('should handle other errors when sending file to server', () => {
        component.fileObj = JSON.parse(mockQuiz) as Quiz;

        const errorResponse = ['Erreur 1', 'Erreur 2'];
        quizServiceSpy.addQuizFromFile.and.returnValue(throwError(errorResponse));
        const importFormGetSpy = spyOn(component.importForm, 'get').and.returnValue({
            value: 'Questionnaire sur log244',
        } as any);
        const importErrorRequestSpy = spyOn(component.importErrorRequest, 'emit').and.stub();

        component.onSubmit();

        expect(quizServiceSpy.addQuizFromFile).toHaveBeenCalledWith(JSON.parse(mockQuiz) as Quiz);
        expect(component.isTitleWrong).toBe(false);
        expect(importFormGetSpy).toHaveBeenCalled();
        expect(importErrorRequestSpy).toHaveBeenCalledWith(errorResponse);
    });

    it('should test if validate returns null for a unique title', (done) => {
        validator = validateTitle(quizServiceSpy);
        const formControl = new FormControl('Title');
        quizServiceSpy.getTitleUnique.and.returnValue(of(false));

        validator(formControl).subscribe((response: any) => {
            expect(response).toBeNull();
            done();
        });
    });

    it('should test if validate returns an error for a non-unique title', (done) => {
        validator = validateTitle(quizServiceSpy);
        const formControl = new FormControl('Title');
        quizServiceSpy.getTitleUnique.and.returnValue(of(true));

        validator(formControl).subscribe((response: any) => {
            expect(response).toEqual({ titleNotUnique: true });
            done();
        });
    });

    it('should test if validate returns null for a unique title', (done) => {
        validator = validateTitle(quizServiceSpy);
        const formControl = new FormControl('Title');
        quizServiceSpy.getTitleUnique.and.returnValue(throwError('Error'));

        validator(formControl).subscribe((response: any) => {
            expect(response).toBeNull();
            done();
        });
    });
});
