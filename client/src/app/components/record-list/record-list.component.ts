import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { DialogService } from '@app/services/dialog.service';
import { RecordHtppService } from '@app/services/record-http.service';
import { Record } from '@common/interfaces/record';
export interface SortState {
    asc: boolean;
    desc: boolean;
}
@Component({
    selector: 'app-record-list',
    templateUrl: './record-list.component.html',
    styleUrls: ['./record-list.component.scss'],
})
export class RecordListComponent implements OnInit {
    @ViewChild(MatSort) sort: MatSort;
    dataSource: Record[] = [];
    sortState = new Map([
        ['name', { asc: false, desc: false }],
        ['date', { asc: false, desc: false }],
    ]);

    constructor(
        private recordHttpService: RecordHtppService,
        private dialogService: DialogService,
    ) {}
    ngOnInit(): void {
        this.updatePage();
    }

    async updatePage() {
        this.recordHttpService.getRecords().subscribe((list) => {
            this.dataSource = list;
        });
    }

    resetRecords() {
        this.dialogService.openDialog("effacer tout l'historique").subscribe((res) => {
            if (res === 'true') {
                this.recordHttpService.resetRecords().subscribe(() => {
                    this.updatePage();
                });
            }
        });
    }

    sortColumn(order: string, field: string) {
        if (field === 'date') {
            this.toggleDateState(order);
            this.desactiveNameState();
        } else if (field === 'name') {
            this.toggleNameState(order);
            this.desactiveDateState();
        }

        this.recordHttpService.getRecordSorted(order, field).subscribe((records) => {
            this.dataSource = records;
        });
    }

    toggleDateState(order: string) {
        if (order === 'ASC') {
            this.activateDateStateAsc();
        } else if (order === 'DESC') {
            this.activateDateStateDesc();
        }
    }

    toggleNameState(order: string) {
        if (order === 'ASC') {
            this.activateNameStateAsc();
        } else {
            this.activateNameStateDesc();
        }
    }

    desactiveDateState() {
        this.sortState.set('date', { asc: false, desc: false });
    }

    desactiveNameState() {
        this.sortState.set('name', { asc: false, desc: false });
    }

    activateDateStateAsc() {
        this.sortState.set('date', { asc: true, desc: false });
    }

    activateDateStateDesc() {
        this.sortState.set('date', { asc: false, desc: true });
    }

    activateNameStateAsc() {
        this.sortState.set('name', { asc: true, desc: false });
    }

    activateNameStateDesc() {
        this.sortState.set('name', { asc: false, desc: true });
    }

    getIsDateAsc() {
        return this.sortState.get('date')?.asc;
    }

    getIsDateDesc() {
        return this.sortState.get('date')?.desc;
    }

    getIsNameDesc() {
        return this.sortState.get('name')?.desc;
    }

    getIsNameAsc() {
        return this.sortState.get('name')?.asc;
    }
}
