import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '@app/services/shared.service';

@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
    @Output() showImportViewEvent = new EventEmitter<void>();
    @Output() showGameListEvent = new EventEmitter<void>();
    @Output() showRecords = new EventEmitter<void>();
    activeTab: number = 1;

    constructor(
        private sharedService: SharedService,
        private router: Router,
    ) {}

    btn1EventHandler() {
        this.activeTabBtn1();
        this.showGameList();
    }

    btn2EventHandler() {
        this.activeTabBtn2();
        this.showImportComponent();
    }

    btn3EventHandler() {
        this.activeTabBtn3();
        this.showRecord();
    }

    activeTabBtn1() {
        this.activeTab = 1;
    }

    activeTabBtn2() {
        this.activeTab = 2;
    }

    activeTabBtn3() {
        this.activeTab = 3;
    }

    showImportComponent() {
        this.showImportViewEvent.emit();
    }

    showGameList() {
        this.showGameListEvent.emit();
    }

    showRecord() {
        this.showRecords.emit();
    }

    returnHome() {
        this.sharedService.setSharedIsConnected(!this.sharedService.getSharedIsConnected());
        this.router.navigate(['/Home']);
    }
}
