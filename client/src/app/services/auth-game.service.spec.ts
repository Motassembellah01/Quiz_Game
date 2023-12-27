import { TestBed } from '@angular/core/testing';

import { AuthGameService } from './auth-game.service';

describe('AuthGameService', () => {
    let service: AuthGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get isConnected', () => {
        const isConnected = service.getIsConnected();
        expect(isConnected).toBeFalse();
    });

    it('should get isAccepted', () => {
        const isAccepted = service.getIsAccepted();
        expect(isAccepted).toBeFalse();
    });

    it('should set and reset isConnected and isAccepted', () => {
        service.setIsAccepted(true);
        service.setIsConnected(true);
        let isAccepted = service.getIsAccepted();
        let isConnected = service.getIsConnected();
        expect(isAccepted).toBeTrue();
        expect(isConnected).toBeTrue();

        service.resetAllValues();
        isAccepted = service.getIsAccepted();
        isConnected = service.getIsConnected();
        expect(isAccepted).toBeFalse();
        expect(isConnected).toBeFalse();
    });
});
