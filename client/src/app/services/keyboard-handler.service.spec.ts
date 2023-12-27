import { TestBed } from '@angular/core/testing';

import { KeyboardHandlerService } from './keyboard-handler.service';
import { FOUR, ONE, THIRTEEN, THREE, TWO } from '@common/constantes/constantes';

describe('KeyboardHandlerService', () => {
    let service: KeyboardHandlerService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(KeyboardHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle the enter keypress by returning a value of 13', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        const res = service.handleKeyPress(keyEvent);
        expect(res).toBe(THIRTEEN);
    });

    it('should return the numeric value of the key 1 when pressed', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: '1' });
        const res = service.handleKeyPress(keyEvent);
        expect(res).toBe(ONE);
    });

    it('should return the numeric value of the key 2 when pressed', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: '2' });
        const res = service.handleKeyPress(keyEvent);
        expect(res).toBe(TWO);
    });

    it('should return the numeric value of the key 2 when pressed', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: '3' });
        const res = service.handleKeyPress(keyEvent);
        expect(res).toBe(THREE);
    });

    it('should return the numeric value of the key 2 when pressed', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: '4' });
        const res = service.handleKeyPress(keyEvent);
        expect(res).toBe(FOUR);
    });

    it('should return null if the key is not enter , 1 , 2 ,3 or 4', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'z' });
        const res = service.handleKeyPress(keyEvent);
        expect(res).toBe(null);
    });
});
