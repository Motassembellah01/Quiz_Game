import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-error-message',
    templateUrl: './error-message.component.html',
    styleUrls: ['./error-message.component.scss'],
})
export class ErrorMessageComponent {
    @Input() errorMessage: string[];
    @Input() vueAttente: boolean;
    @Output() closeMessage = new EventEmitter<void>();

    constructor(private router: Router) {}
    action() {
        if (this.vueAttente) {
            this.router.navigate(['/game']);
        }
        this.closeMessage.emit();
    }
}
