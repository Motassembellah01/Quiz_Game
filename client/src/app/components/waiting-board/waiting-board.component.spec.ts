import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GamesService } from '@app/services/games.service';
import { PlayerService } from '@app/services/player.service';
import { RoomService } from '@app/services/room.service';
import { SharedService } from '@app/services/shared.service';
import { RoomSocketService } from '@app/services/socket/room-socket.service';
import { ONE_SECOND_DELAY } from '@common/constantes/constantes';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { WaitingBoardComponent } from './waiting-board.component';

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

describe('WaitingBoardComponent', () => {
    let component: WaitingBoardComponent;
    let fixture: ComponentFixture<WaitingBoardComponent>;
    let gamesService: jasmine.SpyObj<GamesService>;
    let playerService: jasmine.SpyObj<PlayerService>;
    let sharedService: jasmine.SpyObj<SharedService>;
    let roomSocketService: jasmine.SpyObj<RoomSocketService>;
    let roomService: jasmine.SpyObj<RoomService>;

    beforeEach(() => {
        gamesService = jasmine.createSpyObj('GamesService', ['getRoomID']);
        playerService = jasmine.createSpyObj('PlayerService', [], ['isOrganizer']);
        sharedService = jasmine.createSpyObj('SharedService', ['getSharedSelectedGame']);
        roomSocketService = jasmine.createSpyObj('RoomSocketService', ['getLockState', 'getRoomPlayers', 'send']);
        roomService = jasmine.createSpyObj('RoomService', ['changeLockState']);
        TestBed.configureTestingModule({
            declarations: [WaitingBoardComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: GamesService, useValue: gamesService },
                { provide: PlayerService, useValue: playerService },
                { provide: SharedService, useValue: sharedService },
                { provide: RoomSocketService, useValue: roomSocketService },
                { provide: RoomService, useValue: roomService },
            ],
        });

        fixture = TestBed.createComponent(WaitingBoardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize properties', () => {
        expect(component.isGameStarting).toBe(false);
        expect(component.isOrganizer).toBeUndefined();
        expect(component.isGameLocked).toBe(false);
        expect(component.roomPlayer).toEqual(new Map());
    });

    it('should subscribe to room state updates', () => {
        gamesService.getRoomID.and.returnValue(of('1234'));
        roomSocketService.getLockState.and.returnValue(of(false));

        component.ngOnInit();

        expect(gamesService.getRoomID).toHaveBeenCalled();
        expect(component.isGameLocked).toEqual(false);
    });

    it('should subscribe to room players', () => {
        const mockRoomPlayers = new Map<Socket, string>();
        roomSocketService.getRoomPlayers.and.returnValue(of(mockRoomPlayers));

        component.ngOnInit();

        expect(roomSocketService.getRoomPlayers).toHaveBeenCalled();
        expect(component.roomPlayer).toEqual(mockRoomPlayers);
    });

    it('should toggle game lock', () => {
        component.isOrganizer = true;
        component.isGameStarting = false;

        component.toggleGameLock();

        expect(roomService.changeLockState).toHaveBeenCalled();
        // jamais appelé mais je ne comprend pas pourquoi
    });

    it('should start the game', () => {
        component.theRoomCode = '1234';
        component.quiz = mockQuiz;

        const mockRoomPlayers = new Map<Socket, string>();
        component.roomPlayer = mockRoomPlayers;

        component.startGame();

        const expectedDataToSend = {
            roomID: '1234',
            quiz: component.quiz,
            players: Array.from(mockRoomPlayers),
        };

        expect(roomSocketService.send).toHaveBeenCalledWith('Start', expectedDataToSend);
    });

    it('should toggle isCopied with delay', fakeAsync(() => {
        component.copyCode();

        expect(component.isCopied).toBeTrue();

        tick(ONE_SECOND_DELAY);
        fixture.detectChanges();

        expect(component.isCopied).toBeFalse();
    }));
});
