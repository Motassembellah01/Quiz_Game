import { TestBed } from '@angular/core/testing';
import { GamesService } from './games.service';
import { RoomSocketService } from './socket/room-socket.service';
import { SocketEvents } from '@common/enum/socket.enum';
import { Quiz } from '@common/interfaces/quiz';
import { of } from 'rxjs';

const mockQuiz = {
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

describe('GamesService', () => {
    let service: GamesService;
    let roomSocketService: jasmine.SpyObj<RoomSocketService>;

    beforeEach(() => {
        roomSocketService = jasmine.createSpyObj('RoomSocketService', ['send', 'getRoomID']);
        TestBed.configureTestingModule({
            providers: [{ provide: RoomSocketService, useValue: roomSocketService }],
        });
        service = TestBed.inject(GamesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a new room', () => {
        const quiz: Quiz = mockQuiz;
        service.createNewRoom(quiz);
        expect(roomSocketService.send).toHaveBeenCalledWith(SocketEvents.CreateRoom, quiz);
    });

    it('should delete the room', () => {
        const roomCode = '1234';
        service.actualGameRoomCode = roomCode;
        service.deleteRoom();
        expect(roomSocketService.send).toHaveBeenCalledWith(SocketEvents.DeleteRoom, roomCode);
    });

    it('should join a game room', () => {
        const roomCode = '5678';
        const username = 'TestUser';
        service.joinGameRoom(roomCode, username);
        const expectedData = { roomCode, username };
        expect(roomSocketService.send).toHaveBeenCalledWith(SocketEvents.JoinGame, expectedData);
    });

    it('should lock a room', () => {
        const roomCode = '1234';
        service.lockRoom(roomCode);
        expect(roomSocketService.send).toHaveBeenCalledWith('LockRoom', roomCode);
    });

    it('should get the room ID', (done) => {
        const roomId = '1234';
        roomSocketService.getRoomID.and.returnValue(of(roomId));

        service.getRoomID().subscribe((data) => {
            expect(data).toEqual(roomId);
            expect(service.actualGameRoomCode).toEqual(roomId);
            done();
        });
    });
});
