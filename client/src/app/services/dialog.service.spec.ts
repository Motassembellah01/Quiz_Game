import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
    let service: DialogService;
    let dialog: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            providers: [DialogService, { provide: MatDialog, useValue: dialogSpy }],
        });

        service = TestBed.inject(DialogService);
        dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open a dialog with the correct parameters', () => {
        const actionString = 'testAction';
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('dialog result') });
        dialog.open.and.returnValue(dialogRefSpyObj);

        const result = service.openDialog(actionString);

        expect(dialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
            width: '20%',
            enterAnimationDuration: '500ms',
            data: {
                action: actionString,
            },
        });

        expect(result).toBe(dialogRefSpyObj.afterClosed());
    });
});
