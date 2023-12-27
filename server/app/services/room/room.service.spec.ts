import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { FILL_CODES } from '@common/constantes/constantes';

describe('RoomService', () => {
    let service: RoomService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RoomService],
        }).compile();

        service = module.get<RoomService>(RoomService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate a random unique code', () => {
        const code = service.generateRandomUniqueCode();
        expect(code).toBeDefined();
    });

    it('should update the list of codes', () => {
        const roomID = 'testRoomID';
        service.addGameCode(roomID);
        expect(service.gameCodeSet).toContain(roomID);
    });

    it('should check if a code is unique', () => {
        const code = 'testCode';
        const isUnique = service.isGameCodeExist(code);
        expect(isUnique).toBe(false);
    });

    it('should check if the code is not unique', () => {
        const code = 'testCode';
        const code2 = 'testCode';
        service.addGameCode(code);
        const isUnique = service.isGameCodeExist(code2);
        expect(isUnique).toBe(true);
    });

    it('should generate a random unique code', () => {
        for (let i = 0; i <= FILL_CODES; i++) {
            service.generateRandomUniqueCode();
        }
        const code = service.generateRandomUniqueCode();

        expect(code).toBeDefined();
        expect(code).toMatch(/^[0-9]{4}$/);
        expect(service.gameCodeSet).toContain(code);
    });

    it('should remove a gameCode in the set', () => {
        const code = 'testCode';
        service.addGameCode(code);
        expect(service.gameCodeSet).toContain(code);
        expect(service.gameCodeSet.size).toBe(1);
        service.removeGameCode(code);
        expect(service.gameCodeSet).not.toContain(code);
        expect(service.gameCodeSet.size).toBe(0);
    });
});
