import { Injectable } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ChatEvent } from '@common/enum/chat.gateway.events';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
interface Message {
    id: string;
    sender: string;
    content: string;
    time: Date;
}

@Injectable({
    providedIn: 'root',
})
export class ChatSocketService {
    socket: Socket = this.clientSocketService.socket;
    previousMessageList: Message[] = [];
    playerMessageSubject$: Observable<Message>;
    playerMessageSubject: BehaviorSubject<Message> = new BehaviorSubject({ id: '', sender: '', content: '', time: new Date() });

    constructor(private clientSocketService: ClientSocketService) {
        this.playerMessageSubject$ = this.playerMessageSubject.asObservable();
        this.checkForNewMessage();
    }

    checkForNewMessage() {
        this.socket.on(ChatEvent.NewMessage, (data: string) => {
            const parsedData = JSON.parse(data);
            this.playerMessageSubject.next(parsedData);
            this.previousMessageList.push(parsedData);
        });
    }

    clearPreviousMessageList() {
        this.previousMessageList = [];
        this.playerMessageSubject.next({ id: '', sender: '', content: '', time: new Date() });
    }

    send<T>(event: string, data?: T): void {
        this.clientSocketService.send(event, data);
    }
}
