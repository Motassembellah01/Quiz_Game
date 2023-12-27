import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@app/components/dialog/dialog.component';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: MatDialog) {}

    openDialog(actionString: string): Observable<string> {
        const dialogRes = this.dialog.open(DialogComponent, {
            width: '20%',
            enterAnimationDuration: '500ms',
            data: {
                action: actionString,
            },
        });
        return dialogRes.afterClosed();
    }
}
