import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ResultService } from '@app/services/result.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { ChartData } from '@common/interfaces/chartData';
import { Choice, Question } from '@common/interfaces/quiz';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-graph-result',
    templateUrl: './graph-result.component.html',
    styleUrls: ['./graph-result.component.scss'],
})
export class GraphResultComponent implements OnInit, OnDestroy {
    @Output() correctionModeChange = new EventEmitter<void>();
    @Input() correctionMode: boolean;
    choices: Choice[] | undefined;
    stat: number[] = [];
    chart: Chart | null = null;
    title: string | undefined;
    labels: string[] = [];
    colors: string[] = [];
    charts: ChartData[] = [];
    handleGiveCurrentQuestionData = this.handleGiveCurrentQuestion.bind(this);
    handleGiveCurrentStatAnswerData = this.handleGiveCurrentStatAnswer.bind(this);
    handleSendQRLAnswersToOrgData = this.handleSendQRLAnswersToOrg.bind(this);
    handleTimerDoneClientData = this.handleTimerDoneClient.bind(this);
    handleActivePlayerData = this.handleActivePlayer.bind(this);
    handleIdlePlayerData = this.handleIdlePlayer.bind(this);

    constructor(
        private clientSocketService: ClientSocketService,
        private resultService: ResultService,
    ) {}
    ngOnInit(): void {
        this.configureSockets();
        this.setLabels();
        this.setColors();
    }

    ngOnDestroy(): void {
        this.closeSockets();
    }

    makeChart() {
        this.chart = new Chart('myChart', {
            type: 'bar',
            data: {
                labels: this.labels,
                datasets: [
                    {
                        label: 'resultats',
                        data: this.stat,
                        borderWidth: 1,
                        backgroundColor: this.colors,
                        borderColor: this.colors,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'white',
                            stepSize: 1,
                        },
                        grid: {
                            color: 'white',
                        },
                    },
                    x: {
                        grid: {
                            color: 'white',
                        },
                        ticks: {
                            color: 'white',
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        });
    }

    saveChart() {
        if (this.chart) {
            this.charts.push({
                labels: this.labels,
                stat: this.stat,
                colors: this.colors,
                title: this.title,
            });
        }
    }

    setLabels(): void {
        this.labels = [];
        if (this.choices) {
            for (const choice of this.choices) {
                this.labels.push(choice.text);
            }
        }
    }

    setColors(): void {
        this.colors = [];
        if (this.choices) {
            for (const choice of this.choices) {
                if (choice.isCorrect) {
                    this.colors.push('rgb(71, 185, 163)');
                } else {
                    this.colors.push('rgb(254, 0, 0)');
                }
            }
        }
    }

    configureSockets() {
        this.clientSocketService.on(GameEvent.GiveCurrentQuestion, this.handleGiveCurrentQuestionData);
        this.clientSocketService.on(GameEvent.GiveCurrentStatAnswer, this.handleGiveCurrentStatAnswerData);
        this.clientSocketService.on(GameEvent.SendQRLAnswersToOrg, this.handleSendQRLAnswersToOrgData);
        this.clientSocketService.on(GameEvent.TimerDoneClient, this.handleTimerDoneClientData);
        this.clientSocketService.on(GameEvent.ActivePlayer, this.handleActivePlayerData);
        this.clientSocketService.on(GameEvent.IdlePlayer, this.handleIdlePlayerData);
    }

    closeSockets() {
        this.clientSocketService.off(GameEvent.GiveCurrentQuestion, this.handleGiveCurrentQuestionData);
        this.clientSocketService.off(GameEvent.GiveCurrentStatAnswer, this.handleGiveCurrentStatAnswerData);
        this.clientSocketService.off(GameEvent.SendQRLAnswersToOrg, this.handleSendQRLAnswersToOrgData);
        this.clientSocketService.off(GameEvent.TimerDoneClient, this.handleTimerDoneClientData);
        this.clientSocketService.off(GameEvent.ActivePlayer, this.handleActivePlayerData);
        this.clientSocketService.on(GameEvent.IdlePlayer, this.handleIdlePlayerData);
    }

    handleGiveCurrentQuestion(question: unknown) {
        const currentQuestion = JSON.parse(question as string) as Question;
        if (currentQuestion.type === 'QCM') this.choices = currentQuestion.choices;
        else
            this.choices = [
                { text: 'Active', isCorrect: true },
                { text: 'Inactive', isCorrect: false },
            ] as Choice[];
        this.title = currentQuestion.text;
        this.setLabels();
        this.setColors();
        if (this.chart) {
            if (currentQuestion.type === 'QRL') this.stat = [0, 0, 0, 0];
            else this.stat = [];
            this.chart.data.labels = this.labels;
            this.chart.data.datasets[0].data = this.stat;
            this.chart.data.datasets[0].borderColor = this.colors;
            this.chart.data.datasets[0].backgroundColor = this.colors;
            this.chart.update();
        } else {
            this.makeChart();
            if (currentQuestion.type === 'QRL') this.stat = [0, 0, 0, 0];
        }
    }

    handleGiveCurrentStatAnswer(stat: unknown) {
        this.stat = JSON.parse(stat as string) as number[];
        this.setLabels();
        this.setColors();
        if (this.chart) {
            this.chart.data.datasets[0].data = this.stat;
            this.chart.data.datasets[0].borderColor = this.colors;
            this.chart.data.datasets[0].backgroundColor = this.colors;
            this.chart.update();
        }
    }

    handleActivePlayer() {
        const newStats = [this.stat[0] + 1, this.stat[1] === 0 ? 0 : this.stat[1] - 1, 0, 0];
        this.stat = newStats;
        this.setLabels();
        this.setColors();
        if (this.chart) {
            this.chart.data.datasets[0].data = this.stat;
            this.chart.data.datasets[0].borderColor = this.colors;
            this.chart.data.datasets[0].backgroundColor = this.colors;
            this.chart.update();
        }
    }

    handleIdlePlayer() {
        const newStats = [this.stat[0] === 0 ? 0 : this.stat[0] - 1, this.stat[1] + 1, 0, 0];
        this.stat = newStats;
        this.setLabels();
        this.setColors();
        if (this.chart) {
            this.chart.data.datasets[0].data = this.stat;
            this.chart.data.datasets[0].borderColor = this.colors;
            this.chart.data.datasets[0].backgroundColor = this.colors;
            this.chart.update();
        }
    }

    handleTimerDoneClient() {
        this.saveChart();
        this.resultService.setStatsData(this.charts);
        this.clientSocketService.send(GameEvent.giveGraph, this.charts);
    }

    handleSendQRLAnswersToOrg() {
        this.correctionModeChange.emit();
    }
}
