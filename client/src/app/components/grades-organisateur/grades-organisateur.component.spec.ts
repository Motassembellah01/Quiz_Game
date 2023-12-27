/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GradesOrganisateurComponent } from './grades-organisateur.component';
import { QRLPlayerScore } from '@common/interfaces/QRLPlayerScore';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { EIGHT, FIVE } from '@common/constantes/constantes';

describe('GradesOrganisateurComponent', () => {
    let component: GradesOrganisateurComponent;
    let fixture: ComponentFixture<GradesOrganisateurComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GradesOrganisateurComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(GradesOrganisateurComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize convertedList based on AllQRLPoints', () => {
        const mockQRLPlayerScores: QRLPlayerScore[] = [
            { player: 'Player1', score: FIVE },
            { player: 'Player2', score: EIGHT },
        ];
        component.allQrlPoints = mockQRLPlayerScores;

        component.ngOnInit();

        expect(component.convertedList).toEqual([
            ['Player1', FIVE],
            ['Player2', EIGHT],
        ]);
    });
});
