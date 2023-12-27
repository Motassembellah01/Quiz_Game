import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortPlayerComponent } from './sort-player.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';
import { SortPlayerService } from '@app/services/sort-player.service';

class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}
describe('SortPlayerComponent', () => {
    let component: SortPlayerComponent;
    let fixture: ComponentFixture<SortPlayerComponent>;
    let sortPlayerService: jasmine.SpyObj<SortPlayerService>;
    let socketTestHelper: SocketTestHelper;
    let clientSocketServiceMock: ClientSocketServiceMock;

    beforeEach(() => {
        sortPlayerService = jasmine.createSpyObj('SortPlayerService', ['toggleSort']);
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        TestBed.configureTestingModule({
            declarations: [SortPlayerComponent],
            providers: [
                { provide: ClientSocketService, useValue: clientSocketServiceMock },
                { provide: SortPlayerService, useValue: sortPlayerService },
            ],
        });
        fixture = TestBed.createComponent(SortPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reset all directions', () => {
        component.isDirectionNameDown = true;
        component.resetAllDirection();
        expect(component.isDirectionNameDown).toBeFalsy();

        component.isDirectionPointUp = true;
        component.resetAllDirection();
        expect(component.isDirectionPointUp).toBeFalsy();
    });

    it('should call the service toggleSort with the correct values', () => {
        component.toggleSort('Name', 'up');

        expect(sortPlayerService.toggleSort).toHaveBeenCalledWith('Name', 'up');
    });

    it('should make the correct decision (Name, up)', () => {
        const spyOnReset = spyOn(component, 'resetAllDirection');
        const precedentValue = component.isDirectionNameUp;
        component.makeDecision('Name', true);

        expect(component.isDirectionNameUp).toEqual(!precedentValue);
        expect(spyOnReset).toHaveBeenCalled();
    });

    it('should make the correct decision (Name, down)', () => {
        const spyOnReset = spyOn(component, 'resetAllDirection');
        const precedentValue = component.isDirectionNameDown;
        component.makeDecision('Name', false);

        expect(component.isDirectionNameDown).toEqual(!precedentValue);
        expect(spyOnReset).toHaveBeenCalled();
    });

    it('should make the correct decision (Point, up)', () => {
        const spyOnReset = spyOn(component, 'resetAllDirection');
        const precedentValue = component.isDirectionPointUp;
        component.makeDecision('Point', true);

        expect(component.isDirectionPointUp).toEqual(!precedentValue);
        expect(spyOnReset).toHaveBeenCalled();
    });

    it('should make the correct decision (Point, down)', () => {
        const spyOnReset = spyOn(component, 'resetAllDirection');
        const precedentValue = component.isDirectionPointDown;
        component.makeDecision('Point', false);

        expect(component.isDirectionPointDown).toEqual(!precedentValue);
        expect(spyOnReset).toHaveBeenCalled();
    });

    it('should make the correct decision (State, up)', () => {
        const spyOnReset = spyOn(component, 'resetAllDirection');
        const precedentValue = component.isDirectionStateUp;
        component.makeDecision('State', true);

        expect(component.isDirectionStateUp).toEqual(!precedentValue);
        expect(spyOnReset).toHaveBeenCalled();
    });

    it('should make the correct decision (State, down)', () => {
        const spyOnReset = spyOn(component, 'resetAllDirection');
        const precedentValue = component.isDirectionStateDown;
        component.makeDecision('State', false);

        expect(component.isDirectionStateDown).toEqual(!precedentValue);
        expect(spyOnReset).toHaveBeenCalled();
    });

    it('should configure socket correctly', () => {
        const decison = ['State', false];
        const spyOnMakeDecision = spyOn(component, 'makeDecision');
        const onSpy = spyOn(clientSocketServiceMock, 'on').and.callThrough();
        socketTestHelper.peerSideEmit('Sorting', decison);

        component.configureSockets();

        expect(onSpy.calls.allArgs()).toEqual([['Sorting', jasmine.any(Function)]]);
        expect(spyOnMakeDecision).toHaveBeenCalled();
    });
});
