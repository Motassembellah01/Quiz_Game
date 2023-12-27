import { CreateQuestionDto } from '@app/model/dto/game/create-question.dto';

export const questionValidStubs = (): CreateQuestionDto[] => {
    return [
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
            points: 50,
            choices: [],
        },
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
                    isCorrect: true,
                },
                {
                    text: 'something',
                    isCorrect: true,
                },
                {
                    text: 'something2',
                    isCorrect: false,
                },
            ],
        },
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
                {
                    text: 'something',
                    isCorrect: true,
                },
                {
                    text: 'something2',
                    isCorrect: false,
                },
            ],
        },
        {
            type: 'QCM',
            text: 'bjdafdfg grsfd grsdf',
            points: 10,
            choices: [
                {
                    text: 'ok',
                    isCorrect: null,
                },
                {
                    text: 'psa',
                    isCorrect: false,
                },
                {
                    text: 'something',
                    isCorrect: true,
                },
                {
                    text: 'something2',
                    isCorrect: false,
                },
            ],
        },
        {
            type: 'QCM',
            text: 'bjdafdfg grsfd grsdf',
            points: 10,
            choices: [
                {
                    text: 'ok',
                },
                {
                    text: 'psa',
                    isCorrect: false,
                },
                {
                    text: 'something',
                    isCorrect: true,
                },
                {
                    text: 'something2',
                    isCorrect: false,
                },
            ],
        },
    ];
};

export const questionInvalidStubs = (): CreateQuestionDto[] => {
    return [
        {
            type: 'QCM',
            text: 'bjdafdfg grsfd grsdf',
            points: 17,
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
            type: 'QCM',
            text: 'bjdafdfg grsfd grsdf',
            points: 10,
            choices: [
                {
                    text: 'ok',
                    isCorrect: true,
                },
            ],
        },
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
                    text: 'ok2',
                    isCorrect: true,
                },
            ],
        },
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
                    text: 'ok2',
                    isCorrect: false,
                },
            ],
        },
    ];
};
