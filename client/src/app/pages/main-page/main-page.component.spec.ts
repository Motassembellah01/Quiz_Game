import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([]), HttpClientModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            declarations: [MainPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        router = TestBed.inject(Router);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'TriviaTwist'", () => {
        expect(component.title).toEqual('TriviaTwist');
    });

    it('should contain "Joindre une partie" option', () => {
        const joinButton = fixture.nativeElement.querySelector('#joindre');
        expect(joinButton).toBeTruthy();
    });

    it('should contain "Créer une partie" option', () => {
        const createButton = fixture.nativeElement.querySelector('#creer');
        expect(createButton).toBeTruthy();
    });

    it('should navigate to /game on "Créer une partie" button click ', fakeAsync(() => {
        const createButton = fixture.nativeElement.querySelector('#creer');
        const navigateSpy = spyOn(router, 'navigateByUrl');

        fixture.detectChanges();

        createButton.click();

        tick();

        expect(navigateSpy).toHaveBeenCalledWith(jasmine.stringMatching(/\/game$/), jasmine.any(Object));
    }));

    it('should contain "Administrer les jeux" option that navigates to admin view', () => {
        const adminButton = fixture.nativeElement.querySelector('#administrer');
        expect(adminButton).toBeTruthy();

        const routerLink = adminButton.getAttribute('routerLink');
        expect(routerLink).toBe('/admin');
    });

    it('should navigate to /admin on "Administrer les jeux" button click ', fakeAsync(() => {
        const adminButton = fixture.nativeElement.querySelector('#administrer');
        const navigateSpy = spyOn(router, 'navigateByUrl');

        fixture.detectChanges();

        adminButton.click();

        tick();

        expect(navigateSpy).toHaveBeenCalledWith(jasmine.stringMatching(/\/admin$/), jasmine.any(Object));
    }));

    it('should display the game name', () => {
        const gameTitle = fixture.nativeElement.querySelector('.header-item');
        expect(gameTitle.textContent).toContain('TriviaTwist');
    });

    it('Should display the game logo', () => {
        const logoImage = fixture.nativeElement.querySelector('img');
        expect(logoImage).toBeTruthy();
        expect(logoImage.getAttribute('src')).toContain('assets/images/logo.png');
    });

    it('should display the team number', () => {
        const teamName = fixture.nativeElement.querySelector('.team-name');
        expect(teamName.textContent).toContain('Équipe: 204');
    });

    it('Should display team member names', () => {
        const memberNames = fixture.nativeElement.querySelectorAll('.footer-item h2');
        const expectedMemberNames = [
            'Grégory Lagrandcourt',
            'Gabriel Gascon-Parent',
            'Bruna Bado Corrêa',
            'Allan-André Tchokogué',
            'Motassembellah Mohamed Bassiouni',
            'Julie Malosse',
        ];

        expect(memberNames.length).toBe(expectedMemberNames.length);
        memberNames.forEach((nameElement: HTMLElement, index: number) => {
            const actualName = nameElement.textContent?.trim();
            const expectedName = expectedMemberNames[index];
            expect(actualName).toBe(expectedName);
        });
    });
});
