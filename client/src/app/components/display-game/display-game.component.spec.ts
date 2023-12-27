import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { Socket } from 'socket.io-client';
import { DisplayGameComponent } from './display-game.component';
import { FIFTY, ONE_HUNDRED } from '@common/constantes/constantes';
import JSConfetti from 'js-confetti';

const question = {
    type: 'QCM',
    text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
    points: 20,
    choices: [
        {
            text: 'Non',
            isCorrect: true,
        },
        {
            text: 'Oui',
            isCorrect: false,
        },
    ],
};

class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}

describe('DisplayGameComponent', () => {
    let component: DisplayGameComponent;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;
    let fixture: ComponentFixture<DisplayGameComponent>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;

        TestBed.configureTestingModule({
            declarations: [DisplayGameComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: ClientSocketService, useValue: clientSocketServiceMock }],
            imports: [FormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(DisplayGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should enable submition and set the isAnswerSubmitted flag to true when the Enter key is pressed and no answer has been submitted', () => {
        const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        component.onKeyPress(enterKeyEvent);

        expect(component.submitBtn.nativeElement.disabled).toBe(true);
        expect(component.isAnswerSubmitted).toBe(true);
    });

    it('should not enable the submit button if isChatFocused is true', () => {
        const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        component.isChatFocused = true;
        component.onKeyPress(enterKeyEvent);
        expect(component.isAnswerSubmitted).toBe(false);
    });

    it('should toggle the selection of the answer choice corresponding to the pressed key', () => {
        const answerChoiceKey = new KeyboardEvent('keydown', { key: '1' });
        component.isSelectedArr = [false, false, false, false];
        component.onKeyPress(answerChoiceKey);

        expect(component.isSelectedArr[0]).toBe(true);
        component.onKeyPress(answerChoiceKey);
        expect(component.isSelectedArr[0]).toBe(false);
    });

    it('should do nothing when an invalid answer choice key is pressed', () => {
        const invalidAnswerChoiceKey = new KeyboardEvent('keydown', { key: 'z' });
        component.isSelectedArr = [false, false, false, false];
        component.onKeyPress(invalidAnswerChoiceKey);
        expect(component.isSelectedArr).toEqual([false, false, false, false]);
    });

    it('should do nothing when the Enter key is pressed and an answer has already been submitted', () => {
        component.isAnswerSubmitted = true;

        const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        component.onKeyPress(enterKeyEvent);

        expect(component.isAnswerSubmitted).toBe(true);
    });

    it('should call the render.addClass method when the Enter key is pressed and no answer has been submitted', () => {
        const spy = spyOn(component.render, 'addClass');

        const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        component.onKeyPress(enterKeyEvent);

        expect(spy).toHaveBeenCalledWith(component.submitBtn.nativeElement, 'clicked');
    });

    it('should call the render.removeClass method when the resetSubmitButton method is called', () => {
        const spy = spyOn(component.render, 'removeClass');

        component.resetSubmitButton();

        expect(spy).toHaveBeenCalledWith(component.submitBtn.nativeElement, 'clicked');
    });

    it('should configure sockets correctly', () => {
        const answers = [true, false];
        const onSpy = spyOn(clientSocketServiceMock, 'on').and.callThrough();
        socketTestHelper.peerSideEmit('giveCurrentQuestion', JSON.stringify(question));
        socketTestHelper.peerSideEmit('giveCurrentQuestionAnswers', JSON.stringify(answers));
        component.isAnswerSubmitted = false;
        socketTestHelper.peerSideEmit('timerDoneClient');

        component.configureSockets();

        expect(onSpy.calls.allArgs()).toEqual([
            ['giveCurrentQuestion', jasmine.any(Function)],
            ['giveCurrentQuestionAnswers', jasmine.any(Function)],
            ['Confetti', jasmine.any(Function)],
            ['timerDoneClient', jasmine.any(Function)],
            ['QRLScore', jasmine.any(Function)],
        ]);

        expect(component.currentQuestion).toEqual(question);
        expect(component.choices).toEqual(question.choices);
        expect(component.isSelectedArr.length).toEqual(question.choices.length);
        expect(component.answerQuestionQCM).toEqual(answers);
    });

    it('should configure sockets correctly when the question is a QRL', () => {
        spyOn(component, 'isQRL').and.returnValue(true);
        const sendSpy = spyOn(component.clientSocketService, 'send');
        socketTestHelper.peerSideEmit('giveCurrentQuestion', JSON.stringify(question));
        component.configureSockets();
        expect(sendSpy).toHaveBeenCalledWith('playerIdle');
        expect(component.isActiveQRL).toBeFalse();
        expect(component.firstInteraction).toBeFalse();
    });

    it('should create and add confetti when the Confetti event is received', () => {
        const jsConfettiSpy = jasmine.createSpyObj('JSConfetti', ['addConfetti']);
        spyOn(JSConfetti.prototype, 'addConfetti').and.callFake(jsConfettiSpy.addConfetti);

        socketTestHelper.peerSideEmit('Confetti');
        socketTestHelper.peerSideEmit('giveCurrentQuestion', JSON.stringify(question));
        component.configureSockets();
        expect(jsConfettiSpy.addConfetti).toHaveBeenCalled();
    });

    it('should toggle selection', () => {
        component.isAnswerSubmitted = false;
        component.isSelectedArr = [false, false, false];
        component.toggleSelection(1);
        expect(component.isSelectedArr[1]).toBe(true);
    });

    it('should toggle submit', () => {
        component.isAnswerSubmitted = false;
        spyOn(component.clientSocketService, 'send');
        component.toggleSubmit();
        expect(component.isAnswerSubmitted).toBe(true);
        expect(component.clientSocketService.send).toHaveBeenCalled();
    });

    it('should clear interval and send answerQuestionQRL if isQRL', () => {
        spyOn(component.clientSocketService, 'send');
        spyOn(component, 'isQRL').and.returnValue(true);
        component.toggleSubmit();
        expect(component.clientSocketService.send).toHaveBeenCalledWith('playerAnswerQRL', component.answerQuestionQRL);
    });

    it('should reset submit button', () => {
        component.submitBtn.nativeElement.disabled = true;
        component.submitBtn.nativeElement.classList.add('clicked');
        component.isAnswerSubmitted = true;
        component.resetSubmitButton();
        fixture.detectChanges();
        expect(component.submitBtn.nativeElement.disabled).toBe(false);
        expect(component.submitBtn.nativeElement.classList.contains('clicked')).toBe(false);
        expect(component.isAnswerSubmitted).toBe(false);
    });

    it('submit test rooms if mode test in toggle submit', () => {
        component.mode = 'test';
        spyOn(component.clientSocketService, 'send');
        component.toggleSubmit();
        expect(component.clientSocketService.send).toHaveBeenCalledWith('submitTestRoom');
    });

    it('should ngOnInit', () => {
        spyOn(component, 'configureSockets');
        component.ngOnInit();
        expect(component.configureSockets).toHaveBeenCalled();
    });

    it('should send selected answer when timer hit 0 and player no submit', () => {
        spyOn(component.clientSocketService, 'send');
        expect(component.isAnswerSubmitted).toBeFalse();
        component.timerHit0();
        expect(component.submitBtn.nativeElement.disabled).toBe(true);
        expect(component.submitBtn.nativeElement.classList.contains('clicked')).toBe(true);
        expect(component.isTimerDone).toBeTrue();
        expect(component.clientSocketService.send).toHaveBeenCalledWith('playerAnswerNoSubmit', component.isSelectedArr);
        expect(component.isAnswerSubmitted).toBeTrue();
    });

    it('timer hit 0 should should send answerQuestionQRL if isQRL', () => {
        spyOn(component.clientSocketService, 'send');
        spyOn(component, 'isQRL').and.returnValue(true);
        component.timerHit0();
        expect(component.clientSocketService.send).toHaveBeenCalledWith('playerAnswerQRL', component.answerQuestionQRL);
    });

    it('should set QrlFocus to its corresponding value', () => {
        const chosenBool = true;
        component.setQrlFocus(chosenBool);
        expect(component.isQrlFocused).toEqual(chosenBool);
    });

    it('should update character count if there is length with length', () => {
        const MAX_CHARACTERS = 200;
        component.answerQuestionQRL = 'Salut';
        component.updateCharacterCount();
        expect(component.remainingCharacters).toEqual(MAX_CHARACTERS - component.answerQuestionQRL.length);
    });

    it('should update character count if there is no length', () => {
        const MAX_CHARACTERS = 200;
        component.answerQuestionQRL = '';
        component.updateCharacterCount();
        expect(component.remainingCharacters).toEqual(MAX_CHARACTERS);
    });

    it('should send playerActive and firstInteractionQRL when isActiveQRL is false and firstInteraction is false', () => {
        spyOn(component.clientSocketService, 'send');
        component.isActiveQRL = false;
        component.firstInteraction = false;
        component.sendActive();
        expect(component.clientSocketService.send).toHaveBeenCalledWith('playerActive');
        expect(component.clientSocketService.send).toHaveBeenCalledWith('firstInteractionQRL');
        expect(component.isActiveQRL).toBeTrue();
        expect(component.firstInteraction).toBeTrue();
    });

    it('should send playerActive when isActiveQRL is false and firstInteraction is true', () => {
        spyOn(component.clientSocketService, 'send');
        component.isActiveQRL = false;
        component.firstInteraction = true;
        component.sendActive();
        expect(component.clientSocketService.send).toHaveBeenCalledWith('playerActive');
        expect(component.clientSocketService.send).not.toHaveBeenCalledWith('firstInteractionQRL');
        expect(component.isActiveQRL).toBeTrue();
        expect(component.firstInteraction).toBeTrue();
    });

    it('should send firstInteractionQRL when isActiveQRL is true and firstInteraction is false', () => {
        spyOn(component.clientSocketService, 'send');
        component.isActiveQRL = true;
        component.firstInteraction = false;
        component.sendActive();
        expect(component.clientSocketService.send).not.toHaveBeenCalledWith('playerActive');
        expect(component.clientSocketService.send).toHaveBeenCalledWith('firstInteractionQRL');
        expect(component.isActiveQRL).toBeTrue();
        expect(component.firstInteraction).toBeTrue();
    });

    it('should not send playerActive and firstInteractionQRL when isActiveQRL is true and firstInteraction is true', () => {
        spyOn(component.clientSocketService, 'send');
        component.isActiveQRL = true;
        component.firstInteraction = true;
        component.sendActive();
        expect(component.clientSocketService.send).not.toHaveBeenCalledWith('playerActive');
        expect(component.clientSocketService.send).not.toHaveBeenCalledWith('firstInteractionQRL');
        expect(component.isActiveQRL).toBeTrue();
        expect(component.firstInteraction).toBeTrue();
    });

    it('should send playerIdle and set isActiveQRL to false when idleTime is greater than 5000 and isActiveQRL is true', () => {
        const currentTime = Date.now();
        const idleTime = 6000;
        component.lastActivityTime = currentTime - idleTime;
        component.isActiveQRL = true;
        spyOn(component.clientSocketService, 'send');

        component.sendIdle();

        expect(component.clientSocketService.send).toHaveBeenCalledWith('playerIdle');
        expect(component.isActiveQRL).toBeFalse();
    });

    it('should not send playerIdle and not change isActiveQRL when idleTime is less than or equal to 5000', () => {
        const currentTime = Date.now();
        const idleTime = 4000;
        component.lastActivityTime = currentTime - idleTime;
        component.isActiveQRL = true;
        spyOn(component.clientSocketService, 'send');

        component.sendIdle();

        expect(component.clientSocketService.send).not.toHaveBeenCalled();
        expect(component.isActiveQRL).toBeTrue();
    });

    it('should not send playerIdle and not change isActiveQRL when isActiveQRL is false', () => {
        const currentTime = Date.now();
        const idleTime = 6000;
        component.lastActivityTime = currentTime - idleTime;
        component.isActiveQRL = false;
        spyOn(component.clientSocketService, 'send');
        component.sendIdle();
        expect(component.clientSocketService.send).not.toHaveBeenCalled();
        expect(component.isActiveQRL).toBeFalse();
    });

    it('should handle QRL score correctly', () => {
        const score = 0;
        component.handleQRLScore(score);
        expect(component.scoreMessageQRL).toEqual(['Dommage! ' + '\uD83D\uDE22', 'Meilleure chance la prochaine fois.', score]);
        expect(component.showQRLScore).toBeTrue();

        const score2 = FIFTY;
        component.handleQRLScore(score2);
        expect(component.scoreMessageQRL).toEqual(['Proche! ' + '\uD83D\uDE09', 'Tu y étais presque.', score2]);
        expect(component.showQRLScore).toBeTrue();

        const score3 = ONE_HUNDRED;
        component.handleQRLScore(score3);
        expect(component.scoreMessageQRL).toEqual(['Bravo! ' + '\uD83D\uDE03', "Tu l'as bien eu.", score3]);
        expect(component.showQRLScore).toBeTrue();

        const score4 = 20;
        component.handleQRLScore(score4);
        expect(component.scoreMessageQRL).toEqual(['', '', 0]);
        expect(component.showQRLScore).toBeTrue();
    });
});
