import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ChatSocketService } from '@app/services/socket/chat-socket.service';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ChatComponent } from './chat.component';

interface Message {
    id: string;
    sender: string;
    content: string;
    time: Date;
    cssClass?: string;
}

const message1 = {
    id: '1',
    sender: 'Grégory',
    content: 'Hello',
    time: new Date(),
    cssClass: 'u2 chat',
};

const message2 = {
    id: '2',
    sender: 'PasGrégory',
    content: 'Hello',
    time: new Date(),
    cssClass: 'u2 chat',
};

const message3: Message = {
    id: '1',
    sender: '',
    content: 'Hello',
    time: new Date(),
};

const organizerMsg = {
    id: '4',
    sender: 'Organisateur',
    content: 'Hello',
    time: new Date(),
    cssClass: '',
};

const abandonMsg = {
    id: 'abandon',
    sender: 'Système',
    content: 'Hello',
    time: new Date(),
    cssClass: '',
};

const muteMsg = {
    id: '1',
    sender: 'Système',
    content: 'Hello',
    time: new Date(),
    cssClass: '',
};

const bonusMsg = {
    id: '1',
    sender: 'Bonus',
    content: 'Hello',
    time: new Date(),
    cssClass: '',
};

const data = new BehaviorSubject<Message>(message3);
const CHARACTER_LIMIT = 200;
class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}
describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatSocketService: jasmine.SpyObj<ChatSocketService>;
    let socketTestHelper: SocketTestHelper;
    let clientSocketServiceMock: ClientSocketServiceMock;

    beforeEach(() => {
        chatSocketService = jasmine.createSpyObj('ChatSocketService', ['socket', 'playerMessageSubject$', 'previousMessageList', 'send']);
        chatSocketService.socket.id = '1';
        chatSocketService.previousMessageList = [message1, message2];
        chatSocketService.playerMessageSubject$ = data.asObservable();
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;

        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: ChatSocketService, useValue: chatSocketService },
                { provide: ClientSocketService, useValue: clientSocketServiceMock },
            ],
        });
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should receive message', () => {
        const myMessage = message1;
        myMessage.cssClass = 'u2 chat';
        myMessage.sender = ' : ';

        component.ngOnInit();

        expect(component.chatMessagesList[component.chatMessagesList.length - 1]).toEqual(myMessage);
    });

    it('should handle ChatUnblocked event', () => {
        const onSpy = spyOn(clientSocketServiceMock, 'on');
        const spyCheckState = spyOn(component, 'checkTheChatState');
        const spyCssClass = spyOn(component, 'getMessageCssClass');
        const mockData = {
            id: '',
            sender: 'Système',
            content: 'Vous pouvez à nouveau écrire !',
            time: new Date(),
        };

        component.ngOnInit();
        socketTestHelper.peerSideEmit('ChatUnblocked', JSON.stringify(mockData));

        expect(onSpy).toHaveBeenCalledWith('ChatUnblocked', jasmine.any(Function));
        expect(spyCheckState).toHaveBeenCalled();
        expect(spyCssClass).toHaveBeenCalled();
        expect(component.chatMessagesList[component.chatMessagesList.length - 1].content).toEqual(mockData.content);
        expect(component.chatMessagesList[component.chatMessagesList.length - 1].id).toEqual(mockData.id);
        expect(component.chatMessagesList[component.chatMessagesList.length - 1].sender).toEqual(mockData.sender + ' : ');
        expect(component.isChatBlocked).toBeFalse();
    });

    it('should send a message', () => {
        const myMessage = {
            id: '1',
            sender: '',
            content: '',
            time: new Date(),
        };
        component.messageInput = 'Test message';

        myMessage.content = component.messageInput;

        component.sendMessage();
        myMessage.time = new Date();

        expect(chatSocketService.send).toHaveBeenCalledWith('sendMessage', myMessage);
    });

    it('should update messageInput and characterLimit when input event occurs', () => {
        const inputElement = fixture.nativeElement.querySelector('input');

        inputElement.value = 'New message';
        inputElement.dispatchEvent(new Event('input'));

        expect(component.messageInput).toBe('New message');
        expect(component.characterLimit).toBe(CHARACTER_LIMIT - 'New message'.length);
    });

    it('should emit isFocus event', () => {
        spyOn(component.isFocus, 'emit');
        component.chatFocus();
        expect(component.isFocus.emit).toHaveBeenCalled();
    });

    it('should emit isNotFocus event', () => {
        spyOn(component.isNotFocus, 'emit');
        component.chatNotFocus();
        expect(component.isNotFocus.emit).toHaveBeenCalled();
    });

    it('should load previous message', () => {
        const myMessage = message1;
        myMessage.sender += ' : ';
        fixture.detectChanges();

        component.loadMessages();

        expect(component.chatMessagesList.length).toBe(3);
        expect(component.chatMessagesList[0]).toEqual(myMessage);
    });

    it('should return if a message already exists', () => {
        component.chatMessagesList = [message1];
        const responseTrue = component.isAlreadyExists(message1);
        const responseFalse = component.isAlreadyExists(message2);
        expect(responseTrue).toBeTrue();
        expect(responseFalse).toBeFalse();
    });

    it('should get css class for the organizer', () => {
        expect(component.getMessageCssClass(organizerMsg)).toEqual('u1 chat organizer');
    });

    it('should get css class for the system abandon', () => {
        expect(component.getMessageCssClass(abandonMsg)).toEqual('u1 chat abandon');
    });

    it('should get css class for the system mute', () => {
        component.isChatBlocked = false;
        expect(component.getMessageCssClass(muteMsg)).toEqual('u1 chat console');
        expect(component.isChatBlocked).toBeTrue();
    });

    it('should get css class for the system bonus', () => {
        expect(component.getMessageCssClass(bonusMsg)).toEqual('u1 chat bonus');
    });

    it('should count mute message in chat', () => {
        const sysMsgAbandon = {
            id: 'abandon',
            sender: 'Système : ',
            content: 'Hello',
            time: new Date(),
            cssClass: '',
        };

        const sysMsgMute = {
            id: '1',
            sender: 'Système : ',
            content: 'Hello',
            time: new Date(),
            cssClass: '',
        };
        component.chatMessagesList = [message1, sysMsgAbandon, sysMsgMute];
        expect(component.checkTheChatState()).toEqual(1);
    });
});
