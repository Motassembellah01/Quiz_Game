import { Injectable } from '@angular/core';
import { ChartData } from '@common/interfaces/chartData';
import { PlayerResult } from '@common/interfaces/playerResult';

@Injectable({
    providedIn: 'root',
})
export class ResultService {
    scoreBoardData: PlayerResult[] = [];
    charts: ChartData[] = [];

    setScoreBoardData(data: PlayerResult[]) {
        this.scoreBoardData = data;
    }
    getScoreBoardData(): PlayerResult[] {
        return this.scoreBoardData;
    }

    setStatsData(data: ChartData[]) {
        this.charts = data;
    }

    getStatsData(): ChartData[] {
        return this.charts;
    }

    resetResultData() {
        this.scoreBoardData = [];
        this.charts = [];
    }
}
