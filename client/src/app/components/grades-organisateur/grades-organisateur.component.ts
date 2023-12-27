import { Component, Input, OnInit } from '@angular/core';
import { TEN } from '@common/constantes/constantes';
import { QRLPlayerScore } from '@common/interfaces/QRLPlayerScore';

@Component({
    selector: 'app-grades-organisateur',
    templateUrl: './grades-organisateur.component.html',
    styleUrls: ['./grades-organisateur.component.scss'],
})
export class GradesOrganisateurComponent implements OnInit {
    @Input() allQrlPoints: QRLPlayerScore[] = [];
    convertedList: [string, number][] = [];
    displayedColumns: string[] = ['Player', 'Grade', 'PointsGained'];
    totalPoints: number = TEN;

    ngOnInit(): void {
        this.convertedList = this.allQrlPoints.map(({ player, score }: { player: string; score: number }) => [player, score]);
    }
}
