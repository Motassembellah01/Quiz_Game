import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamesService } from '@app/services/games.service';
import { PlayerService } from '@app/services/player.service';
import { of } from 'rxjs';
import { OrganizerOptionComponent } from './organizer-option.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('OrganizerOptionComponent', () => {
    let component: OrganizerOptionComponent;
    let gamesService: jasmine.SpyObj<GamesService>;
    let playerService: jasmine.SpyObj<PlayerService>;
    let fixture: ComponentFixture<OrganizerOptionComponent>;

    beforeEach(() => {
        gamesService = jasmine.createSpyObj('GamesService', ['getRoomID']);
        playerService = jasmine.createSpyObj('PlayerService', ['closePlayerDetails', 'removePlayer']);
        TestBed.configureTestingModule({
            declarations: [OrganizerOptionComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: GamesService, useValue: gamesService },
                { provide: PlayerService, useValue: playerService },
            ],
        });
        fixture = TestBed.createComponent(OrganizerOptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to room state updates', () => {
        const roomID = '1234';
        gamesService.getRoomID.and.returnValue(of(roomID));

        component.ngOnInit();

        expect(gamesService.getRoomID).toHaveBeenCalled();
        expect(component.theRoomCode).toEqual(roomID);
    });

    it('should call closePlayerDetails', () => {
        component.closeOptions();
        expect(playerService.closePlayerDetails).toHaveBeenCalled();
    });

    it('should call removePlayer and closeOption', () => {
        const spy = spyOn(component, 'closeOptions');
        component.banOption();
        expect(playerService.removePlayer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });
});
