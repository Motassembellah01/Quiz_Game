import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomService {
    gameCodeSet: Set<string> = new Set();

    addGameCode(roomID: string) {
        this.gameCodeSet.add(roomID);
    }

    removeGameCode(roomID: string) {
        this.gameCodeSet.delete(roomID);
    }

    isGameCodeExist(gameCode: string): boolean {
        return this.gameCodeSet.has(gameCode);
    }

    generateRandomUniqueCode(): string {
        const length = 4;
        let code: string;

        do {
            code = Math.random()
                .toString()
                .substring(2, length + 2);
        } while (this.isGameCodeExist(code));
        this.addGameCode(code);

        return code;
    }
}
