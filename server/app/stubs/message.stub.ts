import { Message } from '@app/model/interfaces/interfaces';
export const messageStub = (): Message => {
    return {
        id: '2113',
        sender: 'bidon',
        content: 'hello',
        time: new Date(),
    };
};
