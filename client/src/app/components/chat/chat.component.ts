import { AfterViewChecked, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ChatSocketService } from '@app/services/socket/chat-socket.service';
import { CHARACTER_LIMIT } from '@common/constantes/constantes';
import { ChatEvent } from '@common/enum/chat.gateway.events';

interface Message {
    id: string;
    sender: string;
    content: string;
    time: Date;
    cssClass?: string;
}

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('chatMessages') chatMessagesRef!: ElementRef;
    @Output() isFocus = new EventEmitter<void>();
    @Output() isNotFocus = new EventEmitter<void>();

    chatMessagesList: Message[] = [];
    messageInput: string = '';
    hasAbandonedGame: boolean = false;
    characterLimit: number = CHARACTER_LIMIT;
    isChatBlocked: boolean = false;

    constructor(
        private chatSocketService: ChatSocketService,
        private clientSocketService: ClientSocketService,
    ) {
        this.loadMessages();
    }

    ngOnInit() {
        this.chatSocketService.playerMessageSubject$.subscribe((data) => {
            const theMessage: Message = {
                id: data.id,
                sender: data.sender + ' : ',
                content: data.content,
                time: data.time,
                cssClass: this.getMessageCssClass(data),
            };

            if (!this.isAlreadyExists(theMessage) && theMessage.content !== '') {
                this.chatMessagesList.push(theMessage);
                this.scrollToBottom();
            }
        });

        this.clientSocketService.on(ChatEvent.ChatUnblocked, (data: string) => {
            const counter = this.checkTheChatState();
            const parsedData = JSON.parse(data);
            if (counter % 2 !== 0) {
                const theMessage: Message = {
                    id: parsedData.id,
                    sender: parsedData.sender + ' : ',
                    content: parsedData.content,
                    time: parsedData.time,
                    cssClass: this.getMessageCssClass(parsedData),
                };
                this.chatMessagesList.push(theMessage);
            }
            this.isChatBlocked = false;
        });
    }

    ngOnDestroy() {
        this.chatMessagesList = [];
        this.resetMessageInput();
    }

    loadMessages() {
        this.chatSocketService.previousMessageList?.forEach((data) => {
            const theMessage: Message = {
                id: data.id,
                sender: data.sender + ' : ',
                content: data.content,
                time: data.time,
                cssClass: this.getMessageCssClass(data),
            };
            this.chatMessagesList.push(theMessage);
        });
        this.chatMessagesList.pop();
    }

    isAlreadyExists(theMessage: Message) {
        for (const elem of this.chatMessagesList) {
            if (elem === theMessage) return true;
        }
        return false;
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    onInputChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.messageInput = inputElement?.value;
        this.characterLimit = CHARACTER_LIMIT - this.messageInput?.length;
    }

    scrollToBottom(): void {
        if (this.chatMessagesRef) this.chatMessagesRef.nativeElement.scrollTop = this.chatMessagesRef.nativeElement.scrollHeight;
    }

    getMessageCssClass(data: Message): string {
        let isOrganizer = '';
        if (data.sender.toLowerCase() === 'organisateur') isOrganizer = ' organizer';
        if (data.sender === 'Système') {
            if (data.id === 'abandon') return 'u1 chat abandon';
            this.isChatBlocked = !this.isChatBlocked;
            return 'u1 chat console';
        }
        if (data.sender === 'Bonus') {
            return 'u1 chat bonus';
        }
        return data?.id === this.chatSocketService.socket?.id ? 'u2 chat' + isOrganizer : 'u1 chat' + isOrganizer;
    }

    checkTheChatState() {
        let counter = 0;
        for (const message of this.chatMessagesList) {
            if (message.sender === 'Système : ' && message.id !== 'abandon') counter++;
        }
        return counter;
    }

    sendMessage() {
        if (this.messageInput.trim().length > 0) {
            const message: Message = {
                id: this.chatSocketService.socket.id,
                sender: '',
                content: this.messageInput,
                time: new Date(),
            };

            this.chatSocketService.send(ChatEvent.SendMessage, message);

            this.resetMessageInput();
        }
    }

    resetMessageInput() {
        this.messageInput = '';
        this.characterLimit = CHARACTER_LIMIT;
    }

    chatFocus() {
        this.isFocus.emit();
    }

    chatNotFocus() {
        this.isNotFocus.emit();
    }
}
