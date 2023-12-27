import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { ClientSocketService } from '@app/services/client-socket.service';

describe('AppComponent', () => {
    let clientSocketService: jasmine.SpyObj<ClientSocketService>;
    let app: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    beforeEach(async () => {
        clientSocketService = jasmine.createSpyObj('ClientSocketService', ['connect']);
        await TestBed.configureTestingModule({
            imports: [AppRoutingModule],
            declarations: [AppComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: ClientSocketService, useValue: clientSocketService }],
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        app = fixture.componentInstance;
    });

    it('should create the app', () => {
        expect(app).toBeTruthy();
    });

    it('should connect while once created', () => {
        app.ngOnInit();
        expect(clientSocketService.connect).toHaveBeenCalled();
    });
});
