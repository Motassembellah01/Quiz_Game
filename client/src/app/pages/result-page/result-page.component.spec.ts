import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ResultService } from '@app/services/result.service';
import { ChatSocketService } from '@app/services/socket/chat-socket.service';
import { ResultPageComponent } from './result-page.component';

const mockStatsData = [
    {
        labels: ['A', 'B'],
        stat: [3, 2],
        colors: ['', ''],
        title: 'test',
    },
    {
        labels: ['C', 'D'],
        stat: [1, 2],
        colors: ['', ''],
        title: 'test2',
    },
];

describe('ResultPageComponent', () => {
    let component: ResultPageComponent;
    let fixture: ComponentFixture<ResultPageComponent>;
    let resultService: jasmine.SpyObj<ResultService>;
    let clientSocketService: jasmine.SpyObj<ClientSocketService>;
    let chatSocketService: jasmine.SpyObj<ChatSocketService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let activatedRoute: any;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        resultService = jasmine.createSpyObj('ResultService', ['getScoreBoardData', 'getStatsData']);
        clientSocketService = jasmine.createSpyObj('ClientSocketService', ['connect', 'send', 'disconnect']);
        chatSocketService = jasmine.createSpyObj('ChatSocketService', ['clearPreviousMessageList']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        resultService.getStatsData.and.returnValue(mockStatsData);
        activatedRoute = {
            snapshot: {
                paramMap: {
                    get: (param: string) => {
                        if (param === 'room') return 'roomIdTest';
                        else if (param === 'socketId') return 'socketTest';
                        else return null;
                    },
                },
            },
        };

        TestBed.configureTestingModule({
            declarations: [ResultPageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: ResultService, useValue: resultService },
                { provide: ClientSocketService, useValue: clientSocketService },
                { provide: ChatSocketService, useValue: chatSocketService },
                { provide: ActivatedRoute, useValue: activatedRoute },
                { provide: Router, useValue: router },
            ],
        });

        fixture = TestBed.createComponent(ResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should init scoreboard, graphs and call showGraph', () => {
        const spy = spyOn(component, 'showGraph');
        component.ngOnInit();
        expect(resultService.getScoreBoardData).toHaveBeenCalled();
        expect(resultService.getStatsData).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(0);
    });

    it('should init chart', () => {
        component.showGraph(0);
        expect(component.chart).toBeDefined();
        expect(component.chart?.data.labels).toEqual(mockStatsData[0].labels);
        expect(component.chart?.data.datasets[0].data).toEqual(mockStatsData[0].stat);
        expect(component.chart?.data.datasets[0].borderColor).toEqual(mockStatsData[0].colors);
        expect(component.chart?.data.datasets[0].backgroundColor).toEqual(mockStatsData[0].colors);
        expect(component.chart?.options.plugins?.title?.text).toEqual(mockStatsData[0].title);
    });

    it('should select next graph', () => {
        const spy = spyOn(component, 'showGraph');
        component.nextGraph();
        expect(component.selectedGraph).toEqual(1);
        expect(spy).toHaveBeenCalledWith(1);
    });

    it('should return to first graph', () => {
        const spy = spyOn(component, 'showGraph');
        component.selectedGraph = 1;
        component.nextGraph();
        expect(component.selectedGraph).toEqual(0);
        expect(spy).toHaveBeenCalledWith(0);
    });

    it('should select previous graph', () => {
        const spy = spyOn(component, 'showGraph');
        component.selectedGraph = 1;
        component.previousGraph();
        expect(component.selectedGraph).toEqual(0);
        expect(spy).toHaveBeenCalledWith(0);
    });

    it('should return to last graph', () => {
        const spy = spyOn(component, 'showGraph');
        component.previousGraph();
        expect(component.selectedGraph).toEqual(1);
        expect(spy).toHaveBeenCalledWith(1);
    });

    it('should set selectedGraph', () => {
        const spy = spyOn(component, 'showGraph');
        component.selectGraph(0);
        expect(component.selectedGraph).toEqual(0);
        expect(spy).toHaveBeenCalledWith(0);
    });

    it('Should send event for leave and route', () => {
        router.navigate.and.stub();
        component.leave();
        expect(clientSocketService.send).toHaveBeenCalledWith('leaveTestRoom');
        expect(chatSocketService.clearPreviousMessageList).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/Home']);
    });
});
