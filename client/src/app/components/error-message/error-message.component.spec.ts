import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorMessageComponent } from './error-message.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('ErrorMessageComponent', () => {
    let component: ErrorMessageComponent;
    let fixture: ComponentFixture<ErrorMessageComponent>;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ErrorMessageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule.withRoutes([])],
        });
        fixture = TestBed.createComponent(ErrorMessageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should go to the game page if we are in the vue-attente page and click on fermer', fakeAsync(() => {
        component.vueAttente = true;
        const spyNavigator = spyOn(router, 'navigateByUrl');
        fixture.detectChanges();
        const homeButton = fixture.nativeElement.querySelector('.fermer');
        homeButton.click();

        tick();

        expect(spyNavigator).toHaveBeenCalledWith(jasmine.stringMatching(/\/game$/), jasmine.any(Object));
    }));

    it('should not go to the game page if we are not in the vue-attente page and click on fermer', fakeAsync(() => {
        component.vueAttente = false;
        const spyNavigator = spyOn(router, 'navigateByUrl');
        fixture.detectChanges();
        const closeBtn = fixture.nativeElement.querySelector('.fermer');
        closeBtn.click();

        tick();

        expect(spyNavigator).toHaveBeenCalledTimes(0);
    }));

    it('should emit a close message event when we are not in the vue-attente page', fakeAsync(() => {
        component.vueAttente = false;
        spyOn(component.closeMessage, 'emit');
        fixture.detectChanges();
        const closeBtn = fixture.nativeElement.querySelector('.fermer');
        closeBtn.click();
        expect(component.closeMessage.emit).toHaveBeenCalled();
    }));

    it('should display correctly the error message on the component', () => {
        component.errorMessage = ['titre pas unique', 'le nombre de points doit être un multiple de 10 entre 10 et 100'];
        fixture.detectChanges();
        const elements = fixture.nativeElement.querySelectorAll('li');

        expect(elements.length).toBe(component.errorMessage.length);

        for (let i = 0; i < component.errorMessage.length; i++) {
            expect(elements[i].innerHTML).toContain(component.errorMessage[i]);
        }
    });
});
