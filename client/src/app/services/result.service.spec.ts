import { TestBed } from '@angular/core/testing';

import { PlayerResult } from '@common/interfaces/playerResult';
import { ResultService } from './result.service';

const mockResult = [{ name: 'Allan', score: 20, bonus: 2, rank: 1 }] as PlayerResult[];
const mockStats = [
    { labels: ['A', 'B'], stat: [3, 2], colors: ['', ''], title: 'allo' },
    { labels: ['C', 'D'], stat: [3, 1], colors: ['', ''], title: 'test' },
];

describe('ResultService', () => {
    let service: ResultService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ResultService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set the correct value with set setScoreBoardData', () => {
        service.setScoreBoardData(mockResult);
        expect(service.scoreBoardData).toEqual(mockResult);
    });

    it('should get the correct value with getScoreBoardData', () => {
        service.setScoreBoardData(mockResult);
        expect(service.getScoreBoardData()).toEqual(mockResult);
    });

    it('should set the correct value with set setStatsData', () => {
        service.setStatsData(mockStats);
        expect(service.charts).toEqual(mockStats);
    });

    it('should get the correct value with getStatsData', () => {
        service.setStatsData(mockStats);
        expect(service.getStatsData()).toEqual(mockStats);
    });

    it('should reset datas', () => {
        service.resetResultData();
        expect(service.scoreBoardData).toEqual([]);
        expect(service.charts).toEqual([]);
    });
});
