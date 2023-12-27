import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginService } from '@app/services/login.service';
import { of } from 'rxjs';
import { AuthComponent } from '@app/components/auth/auth.component';

describe('AuthComponent', () => {
    let component: AuthComponent;
    let fixture: ComponentFixture<AuthComponent>;
    let loginService: jasmine.SpyObj<LoginService>;

    beforeEach(() => {
        loginService = jasmine.createSpyObj('LoginService', ['verifyLoginPass']);
        TestBed.configureTestingModule({
            declarations: [AuthComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: LoginService, useValue: loginService }],
        });

        fixture = TestBed.createComponent(AuthComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit the connect event when passwords match', () => {
        spyOn(component.connect, 'emit');

        component.userPassword = 'poly';
        loginService.verifyLoginPass.and.returnValue(of(true));
        component.validate();
        expect(component.isAccepted).toBeTrue();
        expect(component.connect.emit).toHaveBeenCalled();
    });

    it('should show an alert when passwords do not match', () => {
        spyOn(window, 'alert');

        component.userPassword = 'incorrect';
        loginService.verifyLoginPass.and.returnValue(of(false));
        component.validate();
        expect(component.isAccepted).toBeFalse();
        expect(window.alert).toHaveBeenCalledWith('Mauvais mot de passe! Essayez à nouveau.');
    });
});
