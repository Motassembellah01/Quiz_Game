import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validateTitle } from '@app/components/import-game/validation-title';
import { QuizService } from '@app/services/quiz.service';
import { HTTP_CREATED, ONE_SECOND_DELAY } from '@common/constantes/constantes';
import { Quiz } from '@common/interfaces/quiz';
import { timer } from 'rxjs';

@Component({
    selector: 'app-import-game',
    templateUrl: './import-game.component.html',
    styleUrls: ['./import-game.component.scss'],
})
export class ImportGameComponent implements OnInit {
    @Output() updatePage = new EventEmitter<void>();
    @Output() importErrorRequest = new EventEmitter<string[]>();
    isFileUploaded: boolean = false;
    uploadedFile: File;
    fichierSelect: string = 'Aucun fichier choisi';
    fileCreated: boolean = false;
    fileObj: Quiz;
    isTitleWrong: boolean = false;
    importForm: FormGroup;

    constructor(
        private quizService: QuizService,
        private fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.importForm = this.fb.group({
            title: ['', [Validators.required], [validateTitle(this.quizService)]],
        });
    }

    async uploadFile(event: Event) {
        this.isFileUploaded = true;
        let file: File = new File(['{}'], '');
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            file = input.files[0];
        }
        this.uploadedFile = file;
        this.fichierSelect = 'Fichier sélectionné : ';
        await this.readFile();
    }

    sendFileToServer() {
        this.quizService.addQuizFromFile(this.fileObj).subscribe({
            next: (response) => {
                if (response.status === HTTP_CREATED) {
                    this.fileCreated = true;
                    timer(ONE_SECOND_DELAY).subscribe(() => {
                        this.fileCreated = false;
                        this.clearInput();
                    });
                }
                this.updatePage.emit();
            },
            error: (error) => {
                if (error.length === 1 && error[0] === "le titre du jeu n'est pas unique") {
                    this.isTitleWrong = true;
                } else {
                    this.importErrorRequest.emit(error);
                }
            },
        });
    }

    async readFile() {
        if (this.uploadedFile) {
            const blob = this.uploadedFile;

            await blob.text().then((fileContent) => {
                try {
                    const jsonObj = JSON.parse(fileContent);
                    jsonObj['visibility'] = false;
                    this.fileObj = jsonObj as Quiz;
                } catch (error) {
                    // Handle JSON parsing error
                    alert(`N'a pas pu lire le fichier: ${error}`);
                }
            });
        }
    }

    clearInput() {
        this.isTitleWrong = false;
        this.isFileUploaded = false;
        this.fichierSelect = 'Aucun fichier choisi';
        this.importForm.patchValue({
            title: '',
        });
    }

    onSubmit() {
        this.fileObj.title = this.importForm.get('title')?.value;
        this.sendFileToServer();
    }
}
