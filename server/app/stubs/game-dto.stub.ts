import { CreateGameDto } from '@app/model/dto/game/create-game.dto';

export const validGames = (): CreateGameDto[] => {
    return [
        {
            id: 's0oesm',
            title: 'test',
            duration: 10,
            lastModification: '2023-09-24T04:22:47',
            description: 'testtestest',
            visibility: true,
            questions: [
                {
                    type: 'QCM',
                    text: 'bjdafdfg grsfd grsdf',
                    points: 10,
                    choices: [
                        {
                            text: 'ok',
                            isCorrect: true,
                        },
                        {
                            text: 'psa',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    type: 'QRL',
                    text: 'okokokokkkkkkkkkkkkk',
                    points: 10,
                    choices: [],
                },
            ],
        },
        {
            id: 's0oesm',
            title: 'test',
            duration: 10,
            lastModification: '2023-09-24T04:22:47',
            description: 'testtestest',
            visibility: true,
            questions: [
                {
                    type: 'QRL',
                    text: 'okokokokkkkkkkkkkkkk',
                    points: 10,
                    choices: [],
                },
            ],
        },
        {
            id: 'xc42vi',
            title: 'Quiz Test 1',
            duration: 10,
            lastModification: '2023-09-24T16:22:51',
            description: 'Ceci est une description pour le Quiz Test 1',
            visibility: true,
            questions: [
                {
                    choices: [
                        {
                            isCorrect: true,
                            text: 'Choix 1',
                        },
                        {
                            isCorrect: false,
                            text: 'Choix 2',
                        },
                        {
                            isCorrect: false,
                            text: 'Choix 3',
                        },
                    ],
                    points: 10,
                    text: 'Quelle est la réponse ?',
                    type: 'QCM',
                },
            ],
        },
    ];
};

export const invalidGames = (): CreateGameDto[] => {
    return [
        {
            id: 's0oesm',
            title: 'test',
            duration: 10,
            lastModification: '2023-09-24T04:22:47',
            description: 'testtestest',
            visibility: true,
            questions: [
                {
                    type: 'QCM',
                    text: 'bjdafdfg grsfd grsdf',
                    points: 15,
                    choices: [
                        {
                            text: 'ok',
                            isCorrect: true,
                        },
                        {
                            text: 'psa',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    type: 'QRL',
                    text: 'okokokokkkkkkkkkkkkk',
                    points: 10,
                    choices: [],
                },
            ],
        },
        {
            id: 's0oesm',
            title: 'test',
            duration: 10,
            lastModification: '2023-09-24T04:22:47',
            description: 'testtestest',
            visibility: true,
            questions: [
                {
                    type: 'QCM',
                    text: 'bjdafdfg grsfd grsdf',
                    points: 10,
                    choices: [
                        {
                            text: 'ok',
                            isCorrect: false,
                        },
                        {
                            text: 'psa',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    type: 'QRL',
                    text: 'okokokokkkkkkkkkkkkk',
                    points: 10,
                    choices: [],
                },
            ],
        },
        {
            id: 's0oesm',
            title: 'test',
            duration: 10,
            lastModification: '2023-09-24T04:22:47',
            description: 'testtestest',
            visibility: true,
            questions: [
                {
                    type: 'QCM',
                    text: 'bjdafdfg grsfd grsdf',
                    points: 10,
                    choices: [
                        {
                            text: 'ok',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    type: 'QRL',
                    text: 'okokokokkkkkkkkkkkkk',
                    points: 10,
                    choices: [],
                },
            ],
        },
    ];
};
