import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    // TODO faire un interface pour remplacer le any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
