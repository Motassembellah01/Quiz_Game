import { GameState } from '@app/model/interfaces/interfaces';
import { validGames } from './game-dto.stub';

export const gameStateStubs = (): GameState[] => {
    const validQuestions = validGames()[0].questions;
    return [
        {
            questions: validQuestions,
            currentQuestion: validQuestions[2],
            currentIndex: 2,
            totalquestion: 2,
            timeQuestion: 10,
            isTest: false,
            gameName: 'final',
            startDate: new Date('2023-11-09T03:05:27.100Z'),
            totalPlayers: 3,
        },
        {
            questions: validQuestions,
            currentQuestion: validQuestions[0],
            currentIndex: 0,
            totalquestion: 2,
            timeQuestion: 10,
            isTest: false,
            gameName: 'one',
            startDate: new Date('2023-11-09T03:05:27.100Z'),
            totalPlayers: 10,
        },
        {
            questions: validQuestions,
            currentQuestion: validQuestions[0],
            currentIndex: 0,
            totalquestion: 2,
            timeQuestion: 10,
            isTest: true,
            gameName: 'test',
            startDate: new Date('2023-11-09T03:05:27.100Z'),
            totalPlayers: 0,
        },
        {
            questions: validQuestions,
            currentQuestion: validQuestions[1],
            currentIndex: 1,
            totalquestion: 2,
            timeQuestion: 10,
            isTest: false,
            gameName: 'test',
            startDate: new Date('2023-11-09T03:05:27.100Z'),
            totalPlayers: 1,
        },
    ];
};
