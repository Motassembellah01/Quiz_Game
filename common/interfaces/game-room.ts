import { Player } from './player';
import { Quiz } from './quiz';

export interface GameRoom {
    room: number;
    code: string;
    players?: Player[];
    quiz: Quiz;
}

export interface DataPlayerJoin {
    roomCode: string;
    username: string;
}
