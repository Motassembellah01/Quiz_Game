import { Injectable } from '@angular/core';
import { RADIX } from '@common/constantes/constantes';
import { Quiz } from '@common/interfaces/quiz';

@Injectable({
    providedIn: 'root',
})
export class SharedService {
    quizVide: Quiz;
    private selectedGame: Quiz;
    private isEditMode: boolean = false;
    private connected: boolean = false;
    private isAdminConnected: boolean = false;

    getSharedSelectedGame(): Quiz {
        return this.selectedGame;
    }

    setSharedSelectedGame(quiz: Quiz): void {
        this.selectedGame = quiz;
    }

    getSharedIsEditMode(): boolean {
        return this.isEditMode;
    }

    setSharedIsEditMode(mode: boolean): void {
        this.isEditMode = mode;
    }

    getSharedIsConnected(): boolean {
        return this.connected;
    }

    getSharedIsAdminConnected(): boolean {
        return this.isAdminConnected;
    }
    setSharedIsAdminConnected(connection: boolean) {
        this.isAdminConnected = connection;
    }

    setSharedIsConnected(connect: boolean): void {
        this.connected = connect;
    }

    generateRandomId(): string {
        const length = 6;
        return Math.random()
            .toString(RADIX)
            .substring(2, length + 2);
    }
}
