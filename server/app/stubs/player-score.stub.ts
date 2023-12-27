import { PlayerScore } from '@app/model/interfaces/interfaces';

export const playerScoreStub = (): PlayerScore[] => {
    return [
        {
            score: 0,
            bonus: 0,
            status: true,
        },
        {
            score: 10,
            bonus: 0,
            status: true,
        },
        {
            score: 100,
            bonus: 0,
            status: true,
        },
    ];
};
