import { CreateQuestionDto } from '@app/model/dto/game/create-question.dto';

export interface GameState {
    questions: CreateQuestionDto[];
    currentQuestion: CreateQuestionDto;
    currentIndex: number;
    totalquestion: number;
    timeQuestion: number;
    isTest: boolean;
    gameName: string;
    startDate: Date;
    totalPlayers: number;
}

export interface Message {
    id: string;
    sender: string;
    content: string;
    time: Date;
}
export interface PlayerScore {
    score: number;
    bonus: number;
    status: boolean;
}

export interface UpdatePlayerScore {
    score: number;
    isBonus: boolean;
    playerName: string;
}

export interface DataPlayerJoin {
    roomCode: string;
    username: string;
}

export interface QRLPlayerScore {
    player: string;
    score: number;
}
