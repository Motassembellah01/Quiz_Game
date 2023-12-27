import { TestBed } from '@angular/core/testing';
import { RoomService } from './room.service';
import { RoomSocketService } from './socket/room-socket.service';

describe('RoomService', () => {
    let service: RoomService;
    let roomSocketService: RoomSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RoomSocketService], // Ajoutez le fournisseur ici
        });

        service = TestBed.inject(RoomService);
        roomSocketService = TestBed.inject(RoomSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call RoomSocketService.send with the correct arguments', () => {
        const roomCode = 'yourRoomCode'; // Remplacez par le code de la salle que vous voulez tester
        const sendSpy = spyOn(roomSocketService, 'send');

        service.changeLockState(roomCode);

        expect(sendSpy).toHaveBeenCalledWith('LockRoom', roomCode);
    });
});
