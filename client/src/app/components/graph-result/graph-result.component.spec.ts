import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ResultService } from '@app/services/result.service';
import { Chart } from 'chart.js';
import { Socket } from 'socket.io-client';
import { GraphResultComponent } from './graph-result.component';

class ClientSocketServiceMock extends ClientSocketService {
    override connect() {
        // Empty
    }
}

const QCM = {
    type: 'QCM',
    text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
    points: 20,
    choices: [
        {
            text: 'Non',
            isCorrect: true,
        },
        {
            text: 'Oui',
            isCorrect: false,
        },
    ],
};

const QRL = {
    type: 'QRL',
    text: 'Quel est le sens de la vie ?',
    points: 20,
    choices: undefined,
};

const chart = new Chart('myChart', {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'resultats',
                data: [],
                borderWidth: 1,
                backgroundColor: [],
                borderColor: [],
            },
        ],
    },
});

describe('GraphResultComponent', () => {
    let component: GraphResultComponent;
    let clientSocketServiceMock: ClientSocketServiceMock;
    let socketTestHelper: SocketTestHelper;
    let resultService: jasmine.SpyObj<ResultService>;
    let fixture: ComponentFixture<GraphResultComponent>;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        clientSocketServiceMock = new ClientSocketServiceMock();
        clientSocketServiceMock.socket = socketTestHelper as unknown as Socket;
        resultService = jasmine.createSpyObj('ResultService', ['setStatsData']);

        TestBed.configureTestingModule({
            declarations: [GraphResultComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: ClientSocketService, useValue: clientSocketServiceMock },
                { provide: ResultService, useValue: resultService },
            ],
        });

        fixture = TestBed.createComponent(GraphResultComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call configureSockets, setLabels and setColors', () => {
        const configureSpy = spyOn(component, 'configureSockets');
        const labelSpy = spyOn(component, 'setLabels');
        const colorSpy = spyOn(component, 'setColors');

        component.ngOnInit();

        expect(configureSpy).toHaveBeenCalled();
        expect(labelSpy).toHaveBeenCalled();
        expect(colorSpy).toHaveBeenCalled();
    });

    it('should set chart', () => {
        expect(component.chart).toBeNull();
        component.makeChart();
        expect(component.chart).not.toBeNull();
    });

    it('should push chart in charts', () => {
        const spy = spyOn(component.charts, 'push');
        component.chart = chart;
        component.saveChart();
        expect(spy).toHaveBeenCalled();
    });

    it('should set labels', () => {
        expect(component.labels).toEqual([]);
        component.choices = QCM.choices;
        component.setLabels();
        expect(component.labels).toEqual(['Non', 'Oui']);
    });

    it('should set colors', () => {
        expect(component.colors).toEqual([]);
        component.choices = QCM.choices;
        component.setColors();
        expect(component.colors).toEqual(['rgb(71, 185, 163)', 'rgb(254, 0, 0)']);
    });

    it('should call clientSocketService.on with right parameter', () => {
        const spy = spyOn(clientSocketServiceMock, 'on');
        component.configureSockets();
        expect(spy).toHaveBeenCalledWith('giveCurrentQuestion', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('giveCurrentStatAnswer', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('SendQRLAnswersToOrg', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('timerDoneClient', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('ActivePlayer', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('IdlePlayer', jasmine.any(Function));
    });

    it('should set graph with new qcm', () => {
        component.chart = chart;

        const labelSpy = spyOn(component, 'setLabels');
        const colorSpy = spyOn(component, 'setColors');
        const chartSpy = spyOn(component.chart, 'update');

        component.handleGiveCurrentQuestion(JSON.stringify(QCM));

        expect(labelSpy).toHaveBeenCalled();
        expect(colorSpy).toHaveBeenCalled();
        expect(chartSpy).toHaveBeenCalled();
        expect(component.choices).toEqual(QCM.choices);
    });

    it('should create graph with new qrl', () => {
        const expectedChoices = [
            { text: 'Active', isCorrect: true },
            { text: 'Inactive', isCorrect: false },
        ];

        const labelSpy = spyOn(component, 'setLabels');
        const colorSpy = spyOn(component, 'setColors');
        const chartSpy = spyOn(component, 'makeChart');

        component.handleGiveCurrentQuestion(JSON.stringify(QRL));

        expect(labelSpy).toHaveBeenCalled();
        expect(colorSpy).toHaveBeenCalled();
        expect(chartSpy).toHaveBeenCalled();
        expect(component.choices).toEqual(expectedChoices);
        expect(component.stat).toEqual([0, 0, 0, 0]);
    });

    it('should set graph with new qrl', () => {
        component.chart = chart;
        const expectedChoices = [
            { text: 'Active', isCorrect: true },
            { text: 'Inactive', isCorrect: false },
        ];

        const labelSpy = spyOn(component, 'setLabels');
        const colorSpy = spyOn(component, 'setColors');
        const chartSpy = spyOn(component.chart, 'update');

        component.handleGiveCurrentQuestion(JSON.stringify(QRL));

        expect(labelSpy).toHaveBeenCalled();
        expect(colorSpy).toHaveBeenCalled();
        expect(chartSpy).toHaveBeenCalled();
        expect(component.choices).toEqual(expectedChoices);
        expect(component.stat).toEqual([0, 0, 0, 0]);
    });

    it('should update graph with updated answers', () => {
        component.chart = chart;

        const stat = [1, 3];
        const labelSpy = spyOn(component, 'setLabels');
        const colorSpy = spyOn(component, 'setColors');
        const chartSpy = spyOn(component.chart, 'update');

        component.handleGiveCurrentStatAnswer(JSON.stringify(stat));

        expect(labelSpy).toHaveBeenCalled();
        expect(colorSpy).toHaveBeenCalled();
        expect(chartSpy).toHaveBeenCalled();
        expect(component.stat).toEqual(stat);
    });

    it('should call setLabels, setColors and update graph with active player data', () => {
        component.chart = chart;
        component.stat = [0, 1, 0, 0];

        const labelSpy = spyOn(component, 'setLabels');
        const colorSpy = spyOn(component, 'setColors');
        const chartSpy = spyOn(component.chart, 'update');

        component.handleActivePlayer();
        component.handleActivePlayer();

        expect(labelSpy).toHaveBeenCalled();
        expect(colorSpy).toHaveBeenCalled();
        expect(chartSpy).toHaveBeenCalled();
    });

    it('should call setLabels, setColors and update graph with idle player data', () => {
        component.chart = chart;
        component.stat = [1, 0, 0, 0];

        const labelSpy = spyOn(component, 'setLabels');
        const colorSpy = spyOn(component, 'setColors');
        const chartSpy = spyOn(component.chart, 'update');

        component.handleIdlePlayer();
        component.handleIdlePlayer();

        expect(labelSpy).toHaveBeenCalled();
        expect(colorSpy).toHaveBeenCalled();
        expect(chartSpy).toHaveBeenCalled();
    });

    it('should call saveChart, setStatsData and send giveGraph', () => {
        const saveSpy = spyOn(component, 'saveChart');
        const sendSpy = spyOn(clientSocketServiceMock, 'send');

        component.handleTimerDoneClient();

        expect(saveSpy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith('giveGraph', component.charts);
        expect(resultService.setStatsData).toHaveBeenCalled();
    });

    it('should emit correctionModeChange', () => {
        const spy = spyOn(component.correctionModeChange, 'emit');
        component.handleSendQRLAnswersToOrg();
        expect(spy).toHaveBeenCalled();
    });
});
