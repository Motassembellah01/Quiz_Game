import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthGameService } from '@app/services/auth-game.service';
import { DialogService } from '@app/services/dialog.service';
import { GamesService } from '@app/services/games.service';
import { PlayerService } from '@app/services/player.service';
import { RoomSocketService } from '@app/services/socket/room-socket.service';
import { of } from 'rxjs';
import { OnlinePlayerBoardComponent } from './online-player-board.component';

describe('OnlinePlayerBoardComponent', () => {
    let component: OnlinePlayerBoardComponent;
    let fixture: ComponentFixture<OnlinePlayerBoardComponent>;
    let playerService: jasmine.SpyObj<PlayerService>;
    let router: jasmine.SpyObj<Router>;
    let gamesService: jasmine.SpyObj<GamesService>;
    let roomSocketService: jasmine.SpyObj<RoomSocketService>;
    let authGameService: jasmine.SpyObj<AuthGameService>;
    let dialogService: jasmine.SpyObj<DialogService>;

    beforeEach(() => {
        playerService = jasmine.createSpyObj('PlayerService', ['openPlayerDetails', 'leaveRoom']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        gamesService = jasmine.createSpyObj('GamesService', ['getRoomID', 'deleteRoom']);
        roomSocketService = jasmine.createSpyObj('RoomSocketService', ['getRoomID', 'getPlayersOfRoom', 'deletePlayerList']);
        authGameService = jasmine.createSpyObj('AuthGameService', ['setIsAccepted']);
        dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
        TestBed.configureTestingModule({
            declarations: [OnlinePlayerBoardComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [MatDialogModule],
            providers: [
                { provide: PlayerService, useValue: playerService },
                { provide: Router, useValue: router },
                { provide: GamesService, useValue: gamesService },
                { provide: RoomSocketService, useValue: roomSocketService },
                { provide: AuthGameService, useValue: authGameService },
                { provide: DialogService, useValue: dialogService },
            ],
        });

        fixture = TestBed.createComponent(OnlinePlayerBoardComponent);
        component = fixture.componentInstance;
        router.navigate.and.stub();
        dialogService.openDialog.and.returnValue(of('true'));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getRoomID on gamesService and set theRoomCode', () => {
        const mockRoomCode = '1234';
        gamesService.getRoomID.and.returnValue(of(mockRoomCode));

        component.ngOnInit();

        expect(component.theRoomCode).toEqual(mockRoomCode);
    });

    it('should subscribe to player updates and set playersArray', () => {
        const mockPlayersArray = ['Player1', 'Player2'];
        roomSocketService.getPlayersOfRoom.and.returnValue(of(mockPlayersArray));

        component.ngOnInit();

        expect(roomSocketService.getPlayersOfRoom).toHaveBeenCalled();
        expect(component.playersArray).toEqual(mockPlayersArray);
    });

    it('should open player details', () => {
        const player = 'Player1';
        component.theRoomCode = '1234';

        component.openPlayerDetails(player);

        expect(playerService.openPlayerDetails).toHaveBeenCalledWith({
            roomCode: '1234',
            username: player,
        });
    });

    it('should delete room', () => {
        playerService.isOrganizer = true;

        component.leave();

        expect(gamesService.deleteRoom).toHaveBeenCalled();
        expect(roomSocketService.deletePlayerList).toHaveBeenCalled();
        expect(playerService.isOrganizer).toBe(false);
        expect(playerService.leaveRoom).not.toHaveBeenCalled();
        expect(authGameService.setIsAccepted).toHaveBeenCalledWith(false);
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should leave', () => {
        playerService.isOrganizer = false;

        component.leave();

        expect(playerService.leaveRoom).toHaveBeenCalled();
        expect(authGameService.setIsAccepted).toHaveBeenCalledWith(false);
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
});
