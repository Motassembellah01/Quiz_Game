import { DataPlayerJoin } from '@app/model/interfaces/interfaces';

export const dataPlayerJoinStub = (): DataPlayerJoin[] => {
    return [
        {
            roomCode: 'test',
            username: 'test',
        },
        {
            roomCode: 'test',
            username: 'delete',
        },
        {
            roomCode: 'test',
            username: 'salut',
        },
        {
            roomCode: 'test',
            username: 'join',
        },
        {
            roomCode: 'test',
            username: 'bidon',
        },
    ];
};
