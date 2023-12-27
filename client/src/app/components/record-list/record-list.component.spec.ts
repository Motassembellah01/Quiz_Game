import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogService } from '@app/services/dialog.service';
import { RecordHtppService } from '@app/services/record-http.service';
import { of } from 'rxjs';
import { RecordListComponent } from './record-list.component';
import SpyObj = jasmine.SpyObj;
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

const recordsMock = [
    {
        name: 'A',
        date: '2023-11-09 10:24:01',
        totalPlayer: 2,
        bestScore: 100,
    },
    {
        name: 'B',
        date: '2023-11-10 10:24:01',
        totalPlayer: 3,
        bestScore: 100,
    },
];

describe('RecordListComponent', () => {
    let component: RecordListComponent;
    let fixture: ComponentFixture<RecordListComponent>;
    let recordHttpSpy: SpyObj<RecordHtppService>;
    let dialogService: jasmine.SpyObj<DialogService>;

    beforeEach(() => {
        recordHttpSpy = jasmine.createSpyObj('RecordHtppService', ['getRecords', 'resetRecords', 'getRecordSorted']);
        dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
        TestBed.configureTestingModule({
            declarations: [RecordListComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: RecordHtppService, useValue: recordHttpSpy },
                { provide: DialogService, useValue: dialogService },
            ],
            imports: [MatDialogModule],
        });
        fixture = TestBed.createComponent(RecordListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        dialogService.openDialog.and.returnValue(of('true'));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call updatePage on init', () => {
        const spy = spyOn(component, 'updatePage');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should update dataSource', () => {
        recordHttpSpy.getRecords.and.returnValue(of(recordsMock));
        component.updatePage();
        expect(component.dataSource).toEqual(recordsMock);
    });

    it('should reset records and call updatePage', () => {
        const spy = spyOn(component, 'updatePage');
        recordHttpSpy.resetRecords.and.returnValue(of({}));
        component.resetRecords();
        expect(spy).toHaveBeenCalled();
    });

    it('should get records sorted by date', () => {
        const spyDateState = spyOn(component, 'toggleDateState');
        const spyDesactiveNameState = spyOn(component, 'desactiveNameState');
        recordHttpSpy.getRecordSorted.and.returnValue(of(recordsMock));
        component.sortColumn('ASC', 'date');
        expect(spyDateState).toHaveBeenCalledWith('ASC');
        expect(spyDesactiveNameState).toHaveBeenCalled();
        expect(component.dataSource).toEqual(recordsMock);
    });

    it('should get records sorted by name', () => {
        const spyNameState = spyOn(component, 'toggleNameState');
        const spyDesactiveDateState = spyOn(component, 'desactiveDateState');
        recordHttpSpy.getRecordSorted.and.returnValue(of(recordsMock));
        component.sortColumn('DESC', 'name');
        expect(spyNameState).toHaveBeenCalledWith('DESC');
        expect(spyDesactiveDateState).toHaveBeenCalled();
        expect(component.dataSource).toEqual(recordsMock);
    });

    it('should call activateDateStateAsc', () => {
        const spy = spyOn(component, 'activateDateStateAsc');
        component.toggleDateState('ASC');
        expect(spy).toHaveBeenCalled();
    });

    it('should call activateDateStateDesc', () => {
        const spy = spyOn(component, 'activateDateStateDesc');
        component.toggleDateState('DESC');
        expect(spy).toHaveBeenCalled();
    });

    it('should call activateNameStateAsc', () => {
        const spy = spyOn(component, 'activateNameStateAsc');
        component.toggleNameState('ASC');
        expect(spy).toHaveBeenCalled();
    });

    it('should call activateNameStateDesc', () => {
        const spy = spyOn(component, 'activateNameStateDesc');
        component.toggleNameState('DESC');
        expect(spy).toHaveBeenCalled();
    });

    it('should activate and desactivate date state', () => {
        component.activateDateStateAsc();
        expect(component.getIsDateAsc()).toBeTrue();
        expect(component.getIsDateDesc()).toBeFalse();

        component.activateDateStateDesc();
        expect(component.getIsDateAsc()).toBeFalse();
        expect(component.getIsDateDesc()).toBeTrue();

        component.desactiveDateState();
        expect(component.getIsDateAsc()).toBeFalse();
        expect(component.getIsDateDesc()).toBeFalse();
    });

    it('should activate and desactivate name state', () => {
        component.activateNameStateAsc();
        expect(component.getIsNameAsc()).toBeTrue();
        expect(component.getIsNameDesc()).toBeFalse();

        component.activateNameStateDesc();
        expect(component.getIsNameAsc()).toBeFalse();
        expect(component.getIsNameDesc()).toBeTrue();

        component.desactiveNameState();
        expect(component.getIsNameAsc()).toBeFalse();
        expect(component.getIsNameDesc()).toBeFalse();
    });
});
