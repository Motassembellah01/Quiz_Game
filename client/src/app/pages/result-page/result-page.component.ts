import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ResultService } from '@app/services/result.service';
import { ChatSocketService } from '@app/services/socket/chat-socket.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { ChartData } from '@common/interfaces/chartData';
import { PlayerResult } from '@common/interfaces/playerResult';
import { Chart } from 'chart.js';
@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
})
export class ResultPageComponent implements OnInit {
    @ViewChild('chart', { static: true }) chartCanvas: ElementRef;
    scoreBoardData: PlayerResult[] = [];
    displayedColumns: string[] = ['rank', 'name', 'score', 'bonus'];
    graphs: ChartData[] = [];
    chart: Chart | null = null;
    selectedGraph: number = 0;
    // param router obligatoire
    // eslint-disable-next-line max-params
    constructor(
        private clientSocketService: ClientSocketService,
        private chatSocketService: ChatSocketService,
        private router: Router,
        private resultService: ResultService,
    ) {}

    ngOnInit(): void {
        this.scoreBoardData = this.resultService.getScoreBoardData();
        this.graphs = this.resultService.getStatsData();
        if (this.graphs.length > 0 && this.graphs) {
            this.showGraph(this.selectedGraph);
        }
    }

    showGraph(index: number) {
        const canvas = this.chartCanvas.nativeElement;
        if (this.chart) {
            this.chart.data.labels = this.graphs[index].labels;
            this.chart.data.datasets[0].data = this.graphs[index].stat;
            this.chart.data.datasets[0].borderColor = this.graphs[index].colors;
            this.chart.data.datasets[0].backgroundColor = this.graphs[index].colors;
            if (this.chart.options.plugins && this.chart.options.plugins.title) this.chart.options.plugins.title.text = this.graphs[index].title;
            this.chart.update();
        } else {
            this.chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: this.graphs[index].labels,
                    datasets: [
                        {
                            data: this.graphs[index].stat,
                            borderWidth: 1,
                            backgroundColor: this.graphs[index].colors,
                            borderColor: this.graphs[index].colors,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'white',
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
                        title: {
                            display: true,
                            text: this.graphs[index].title,
                            color: 'white',
                            font: {
                                size: 20,
                            },
                        },
                        legend: {
                            display: false,
                        },
                    },
                },
            });
        }
    }

    nextGraph() {
        if (this.selectedGraph === this.graphs.length - 1) {
            this.selectedGraph = 0;
        } else {
            this.selectedGraph++;
        }
        this.showGraph(this.selectedGraph);
    }

    previousGraph() {
        if (this.selectedGraph === 0) {
            this.selectedGraph = this.graphs.length - 1;
        } else {
            this.selectedGraph--;
        }
        this.showGraph(this.selectedGraph);
    }

    selectGraph(index: number) {
        this.selectedGraph = index;
        this.showGraph(this.selectedGraph);
    }

    leave() {
        this.clientSocketService.send(GameEvent.LeaveTestRoom);
        this.chatSocketService.clearPreviousMessageList();
        this.clientSocketService.send(GameEvent.PlayerLeft);
        this.router.navigate(['/Home']);
    }
}
