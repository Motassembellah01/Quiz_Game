import { TestBed } from '@angular/core/testing';
import { Quiz } from '@common/interfaces/quiz';
import { SharedService } from './shared.service';
import { MAX_ITERATION } from '@common/constantes/constantes';

const quiz: Quiz = {
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
};

describe('SharedService', () => {
    let service: SharedService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SharedService],
        });

        service = TestBed.inject(SharedService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get selectedGame', () => {
        service.setSharedSelectedGame(quiz);
        const selectedGame = service.getSharedSelectedGame();
        expect(selectedGame).toBe(quiz);
    });

    it('should set and get isEditMode', () => {
        const mode = true;
        service.setSharedIsEditMode(mode);
        const isEditMode = service.getSharedIsEditMode();
        expect(isEditMode).toBe(mode);
    });

    it('should set and get isConnected', () => {
        const isConnected = true;
        service.setSharedIsConnected(isConnected);
        const isConnectedResult = service.getSharedIsConnected();
        expect(isConnectedResult).toBe(isConnected);
    });

    it('should get and set isAdminConnected', () => {
        const isAdminConnected = true;
        service.setSharedIsAdminConnected(isAdminConnected);
        const isAdminConnectedRes = service.getSharedIsAdminConnected();
        expect(isAdminConnectedRes).toBe(isAdminConnected);
    });

    it('should generate a random id', () => {
        const idset = new Set();
        let isIdUnique = true;
        for (let i = 0; i < MAX_ITERATION; i++) {
            const id = service.generateRandomId();
            if (idset.has(id)) {
                isIdUnique = false;
            } else {
                idset.add(id);
            }
        }
        expect(isIdUnique).toEqual(true);
    });
});
