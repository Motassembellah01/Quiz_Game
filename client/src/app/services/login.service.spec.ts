import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoginService } from './login.service';

const serviceURL = '/api/login';

describe('LoginService', () => {
    let httpTestingController: HttpTestingController;
    let service: LoginService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [LoginService],
        });
        service = TestBed.inject(LoginService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should verify the password and return true if its the right one', () => {
        service.verifyLoginPass('poly').subscribe((bool) => {
            expect(bool).toBeTrue();
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}`);
        expect(req.request.method).toBe('POST');
        req.flush(true);
    });

    it('should verify the password and return false if its the wrong one', () => {
        service.verifyLoginPass('string').subscribe((bool) => {
            expect(bool).toBeFalsy();
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}${serviceURL}`);
        expect(req.request.method).toBe('POST');
        req.flush(false);
    });
});
