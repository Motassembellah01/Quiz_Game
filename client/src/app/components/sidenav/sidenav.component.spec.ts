import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SidenavComponent } from './sidenav.component';

describe('SidenavComponent', () => {
    let component: SidenavComponent;
    let fixture: ComponentFixture<SidenavComponent>;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SidenavComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule.withRoutes([])],
        });
        fixture = TestBed.createComponent(SidenavComponent);
        router = TestBed.inject(Router);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit showRecords when btn3EventHandler is called', () => {
        const spyEmit = spyOn(component.showRecords, 'emit');
        component.btn3EventHandler();
        expect(spyEmit).toHaveBeenCalled();
    });

    it('should emit showImportViewEvent when btn2EventHandler is called', () => {
        spyOn(component.showImportViewEvent, 'emit');
        component.btn2EventHandler();
        expect(component.showImportViewEvent.emit).toHaveBeenCalled();
    });

    it('should emit showGameList when btn1EventHandler is called', () => {
        spyOn(component.showGameListEvent, 'emit');
        component.btn1EventHandler();
        expect(component.showGameListEvent.emit).toHaveBeenCalled();
    });

    it('should change activeTab to 3 when activeTabBtn3 is called', () => {
        component.activeTabBtn3();
        expect(component.activeTab).toBe(3);
    });

    it('should change activeTab to 2 when activeTabBtn2 is called', () => {
        component.activeTabBtn2();
        expect(component.activeTab).toBe(2);
    });

    it('should change activeTab to 1 when activeTabBtn1 is called', () => {
        component.activeTabBtn1();
        expect(component.activeTab).toBe(1);
    });

    it('should go back to the home page when pressing page accueil', fakeAsync(() => {
        const spyNavigator = spyOn(router, 'navigateByUrl');

        fixture.detectChanges();

        const homeButton = fixture.nativeElement.querySelector('.home');

        homeButton.click();

        tick();

        expect(spyNavigator).toHaveBeenCalledWith(jasmine.stringMatching(/\/Home$/), jasmine.any(Object));
    }));
});
