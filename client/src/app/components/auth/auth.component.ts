import { Component, EventEmitter, Output } from '@angular/core';
import { LoginService } from '@app/services/login.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
    @Output() connect = new EventEmitter<void>();
    hide = true;
    userPassword: string = '';
    isAccepted = false;

    constructor(private loginService: LoginService) {}

    validate() {
        this.loginService.verifyLoginPass(this.userPassword).subscribe((res) => {
            this.isAccepted = res;
            if (this.isAccepted) {
                this.connect.emit();
            } else {
                alert('Mauvais mot de passe! Essayez à nouveau.');
            }
        });
    }
}
